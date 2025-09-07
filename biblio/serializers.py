from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Sum

from .models import (
    User, Author, Category, Book, BookCopy, 
    LoanRequest, LoanRequestItem, Loan, LoanItem,
    Penalty, Suspension, Notification, AuditLog
)


# ==========================
# AUTHENTICATION SERIALIZERS
# ==========================

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError("Compte désactivé.")
            else:
                raise serializers.ValidationError("Identifiants invalides.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")

        return data


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'role_display'
        )
        read_only_fields = ('id')


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'role')
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False}
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    active_loans_count = serializers.SerializerMethodField()
    pending_requests_count = serializers.SerializerMethodField()
    unpaid_penalties_amount = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'role_display', 'is_suspended', 'suspension_start', 
            'suspension_end', 'date_joined', 'last_login',
            'active_loans_count', 'pending_requests_count', 'unpaid_penalties_amount'
        )
        read_only_fields = ('id', 'date_joined', 'last_login')

    def get_active_loans_count(self, obj):
        return obj.loans.filter(status="ACTIVE").count()

    def get_pending_requests_count(self, obj):
        return obj.loan_requests.filter(status="PENDING").count()

    def get_unpaid_penalties_amount(self, obj):
        result = obj.penalties.filter(payment_status="UNPAID").aggregate(
            total=Sum('amount')
        )
        return result['total'] or 0


# ==========================
# CATALOG SERIALIZERS
# ==========================

class AuthorSerializer(serializers.ModelSerializer):
    books_count = serializers.SerializerMethodField()

    class Meta:
        model = Author
        fields = '__all__'
        read_only_fields = ('id',)

    def get_books_count(self, obj):
        return obj.books.count()

class CategorySerializer(serializers.ModelSerializer):
    books_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ('id',)

    def get_books_count(self, obj):
        return obj.books.count()

class BookListSerializer(serializers.ModelSerializer):
    authors = serializers.StringRelatedField(many=True)
    category = serializers.StringRelatedField()
    available_copies = serializers.IntegerField(read_only=True)

    class Meta:
        model = Book
        fields = (
            'id', 'isbn', 'title', 'image_couverture', 'summary', 
            'language', 'publisher', 'publication_year', 
            'authors', 'category', 'available_copies', 'is_available'
        )
        read_only_fields = ('id', 'available_copies', 'is_available')

class BookDetailSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)
    category = CategorySerializer(many=True, read_only=True)
    available_copies = serializers.IntegerField(read_only=True)
    copies = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = (
            'id', 'isbn', 'title', 'image_couverture', 'summary', 
            'language', 'publisher', 'publication_year', 
            'authors', 'category', 'available_copies', 'is_available', 'copies'
        )
        read_only_fields = ('id', 'available_copies', 'is_available')

    def get_copies(self, obj):
        copies = obj.copies.all()
        return BookCopySerializer(copies, many=True).data


class BookWriteSerializer(serializers.ModelSerializer):
    author_ids = serializers.ListField(
        child=serializers.UUIDField(), 
        write_only=True, 
        required=False
    )
    category_id = serializers.UUIDField(  # ici on ne prend qu'une seule catégorie
        write_only=True, 
        required=False
    )

    class Meta:
        model = Book
        fields = (
            'id', 'isbn', 'title', 'image_couverture', 'summary', 
            'language', 'publisher', 'publication_year', 
            'author_ids', 'category_id'
        )
        read_only_fields = ('id',)

    def create(self, validated_data):
        author_ids = validated_data.pop('author_ids', [])
        category_id = validated_data.pop('category_id',None)
        
        book = Book.objects.create(**validated_data)
        
        # Add authors and categories
        if author_ids:
            authors = Author.objects.filter(id__in=author_ids)
            book.authors.set(authors)

        # Add category (unique)
        if category_id:
            category = Category.objects.get(id=category_id)
            book.categories.set([category]) 
              
        return book


    def update(self, instance, validated_data):
        author_ids = validated_data.pop('author_ids', None)
        category_id = validated_data.pop('category_id', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update authors if provided
        if author_ids is not None:
            authors = Author.objects.filter(id__in=author_ids)
            instance.authors.set(authors)
        
        # Update category if provided
        if category_id is not None:
            category = Category.objects.get(id=category_id)
            instance.categories.set([category])
        
        return instance


class BookCopySerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    
    class Meta:
        model = BookCopy
        fields = '__all__'
        read_only_fields = ('id', 'added_at')


class BookCopyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCopy
        fields = ('inventory_code', 'condition_note', 'available')
        read_only_fields = ('id', 'added_at')


# ==========================
# LOAN REQUEST SERIALIZERS
# ==========================

class LoanRequestItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_isbn = serializers.CharField(source='book.isbn', read_only=True)
    
    class Meta:
        model = LoanRequestItem
        fields = '__all__'
        read_only_fields = ('id', 'loan_request')


class LoanRequestItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanRequestItem
        fields = ('book', 'qty')


class LoanRequestListSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LoanRequest
        fields = (
            'id', 'requester', 'requester_name', 'requester_username', 
            'status', 'status_display', 'rejection_reason', 'secretary',
            'created_at', 'decision_at', 'items_count'
        )
        read_only_fields = ('id', 'created_at', 'decision_at')

    def get_items_count(self, obj):
        return obj.items.count()


class LoanRequestDetailSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    secretary_name = serializers.CharField(source='secretary.get_full_name', read_only=True, allow_null=True)
    items = LoanRequestItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = LoanRequest
        fields = (
            'id', 'requester', 'requester_name', 'requester_username', 
            'status', 'status_display', 'rejection_reason', 'secretary', 'secretary_name',
            'created_at', 'decision_at', 'items'
        )
        read_only_fields = ('id', 'created_at', 'decision_at')


class LoanRequestCreateSerializer(serializers.ModelSerializer):
    items = LoanRequestItemCreateSerializer(many=True)

    class Meta:
        model = LoanRequest
        fields = ('items',)
        read_only_fields = ('id', 'requester', 'status', 'created_at')

    def validate(self, data):
        # Vérifier que la demande contient au moins un livre
        if not data.get('items') or len(data['items']) == 0:
            raise serializers.ValidationError("La demande doit contenir au moins un livre.")
        
        # Vérifier que l'utilisateur n'est pas suspendu
        user = self.context['request'].user
        if user.is_suspended:
            raise serializers.ValidationError("Votre compte est suspendu. Vous ne pouvez pas faire de demande de prêt.")
        
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        loan_request = LoanRequest.objects.create(
            requester=self.context['request'].user,
            status="PENDING"
        )
        
        for item_data in items_data:
            LoanRequestItem.objects.create(
                loan_request=loan_request,
                **item_data
            )
        
        return loan_request


class LoanRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanRequest
        fields = ('status', 'rejection_reason')
        read_only_fields = ('id', 'requester', 'created_at')

    def validate(self, data):
        # Validation pour le rejet
        if data.get('status') == 'REJECTED' and not data.get('rejection_reason'):
            raise serializers.ValidationError("Un motif de rejet est requis.")
        return data


# ==========================
# LOAN SERIALIZERS
# ==========================

class LoanItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book_copy.book.title', read_only=True)
    inventory_code = serializers.CharField(source='book_copy.inventory_code', read_only=True)
    condition_out_display = serializers.SerializerMethodField()
    condition_in_display = serializers.SerializerMethodField()
    
    class Meta:
        model = LoanItem
        fields = '__all__'
        read_only_fields = ('id', 'loan')

    def get_condition_out_display(self, obj):
        return obj.condition_out or "Non spécifié"
    
    def get_condition_in_display(self, obj):
        return obj.condition_in or "Non retourné"


class LoanListSerializer(serializers.ModelSerializer):
    borrower_name = serializers.CharField(source='borrower.get_full_name', read_only=True)
    borrower_username = serializers.CharField(source='borrower.username', read_only=True)
    secretary_name = serializers.CharField(source='secretary.get_full_name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    days_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Loan
        fields = (
            'id', 'borrower', 'borrower_name', 'borrower_username',
            'secretary', 'secretary_name', 'loan_date', 'due_date',
            'return_date', 'status', 'status_display', 'items_count',
            'is_overdue', 'days_overdue'
        )
        read_only_fields = ('id', 'loan_date')

    def get_items_count(self, obj):
        return obj.items.count()

    def get_is_overdue(self, obj):
        if obj.status == 'ACTIVE' and obj.due_date < timezone.now().date():
            return True
        return False

    def get_days_overdue(self, obj):
        if obj.status == 'ACTIVE' and obj.due_date < timezone.now().date():
            return (timezone.now().date() - obj.due_date).days
        return 0


class LoanDetailSerializer(serializers.ModelSerializer):
    borrower_name = serializers.CharField(source='borrower.get_full_name', read_only=True)
    borrower_username = serializers.CharField(source='borrower.username', read_only=True)
    secretary_name = serializers.CharField(source='secretary.get_full_name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items = LoanItemSerializer(many=True, read_only=True)
    is_overdue = serializers.SerializerMethodField()
    days_overdue = serializers.SerializerMethodField()
    penalties = serializers.SerializerMethodField()
    
    class Meta:
        model = Loan
        fields = (
            'id', 'borrower', 'borrower_name', 'borrower_username',
            'secretary', 'secretary_name', 'loan_date', 'due_date',
            'return_date', 'status', 'status_display', 'items',
            'is_overdue', 'days_overdue', 'penalties'
        )
        read_only_fields = ('id', 'loan_date')

    def get_is_overdue(self, obj):
        if obj.status == 'ACTIVE' and obj.due_date < timezone.now().date():
            return True
        return False

    def get_days_overdue(self, obj):
        if obj.status == 'ACTIVE' and obj.due_date < timezone.now().date():
            return (timezone.now().date() - obj.due_date).days
        return 0

    def get_penalties(self, obj):
        penalties = obj.penalties.all()
        return PenaltySerializer(penalties, many=True).data


class LoanCreateSerializer(serializers.ModelSerializer):
    book_copy_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True
    )

    class Meta:
        model = Loan
        fields = ('borrower', 'due_date', 'book_copy_ids')
        read_only_fields = ('id', 'loan_date', 'secretary', 'status')

    def validate(self, data):
        # Vérifier que l'emprunteur n'est pas suspendu
        if data['borrower'].is_suspended:
            raise serializers.ValidationError("L'emprunteur est suspendu et ne peut pas emprunter de livres.")
        
        # Vérifier que tous les exemplaires sont disponibles
        book_copy_ids = data['book_copy_ids']
        unavailable_copies = BookCopy.objects.filter(
            id__in=book_copy_ids, 
            available=False
        )
        
        if unavailable_copies.exists():
            raise serializers.ValidationError(
                f"{unavailable_copies.count()} exemplaire(s) ne sont pas disponibles."
            )
        
        return data

    def create(self, validated_data):
        book_copy_ids = validated_data.pop('book_copy_ids')
        loan = Loan.objects.create(
            **validated_data,
            secretary=self.context['request'].user
        )
        
        # Ajouter les exemplaires au prêt
        for copy_id in book_copy_ids:
            book_copy = BookCopy.objects.get(id=copy_id)
            LoanItem.objects.create(
                loan=loan,
                book_copy=book_copy,
                condition_out="Bon état"
            )
            # Marquer l'exemplaire comme indisponible
            book_copy.available = False
            book_copy.save()
        
        return loan


class LoanReturnSerializer(serializers.Serializer):
    condition_in = serializers.DictField(
        child=serializers.CharField(),
        help_text="Dict with loan_item_id as key and condition description as value"
    )

    def validate(self, data):
        loan = self.context['loan']
        condition_in = data.get('condition_in', {})
        
        # Vérifier que tous les items du prêt sont présents
        loan_item_ids = loan.items.values_list('id', flat=True)
        for item_id in condition_in.keys():
            try:
                uuid.UUID(item_id)
            except ValueError:
                raise serializers.ValidationError(f"ID d'item invalide: {item_id}")
            
            if uuid.UUID(item_id) not in loan_item_ids:
                raise serializers.ValidationError(f"Item {item_id} n'appartient pas à ce prêt")
        
        return data


# ==========================
# PENALTY SERIALIZERS
# ==========================

class PenaltySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    validated_by_name = serializers.CharField(source='validated_by.get_full_name', read_only=True, allow_null=True)
    loan_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Penalty
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

    def get_loan_info(self, obj):
        if obj.loan:
            return {
                'id': obj.loan.id,
                'loan_date': obj.loan.loan_date,
                'due_date': obj.loan.due_date
            }
        return None


class PenaltyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Penalty
        fields = ('user', 'loan', 'reason', 'days_late', 'amount', 'note')
        read_only_fields = ('id', 'created_at', 'payment_status')


class PenaltyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Penalty
        fields = ('payment_status', 'note')
        read_only_fields = ('id', 'user', 'loan', 'reason', 'days_late', 'amount', 'created_at')


# ==========================
# SUSPENSION SERIALIZERS
# ==========================

class SuspensionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = Suspension
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'created_by')

    def get_is_active(self, obj):
        today = timezone.now().date()
        return obj.start_date <= today <= obj.end_date


class SuspensionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suspension
        fields = ('user', 'start_date', 'end_date', 'reason')
        read_only_fields = ('id', 'created_at', 'created_by')

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("La date de début doit être avant la date de fin.")
        return data


# ==========================
# NOTIFICATION SERIALIZERS
# ==========================

class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    is_read = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'sent_at')

    def get_is_read(self, obj):
        return obj.read_at is not None


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('user', 'type', 'title', 'message', 'channel')
        read_only_fields = ('id', 'created_at', 'sent_at', 'read_at')


# ==========================
# AUDIT LOG SERIALIZERS
# ==========================

class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    actor_username = serializers.CharField(source='actor.username', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


# ==========================
# DASHBOARD SERIALIZERS
# ==========================

class DashboardStatsSerializer(serializers.Serializer):
    total_books = serializers.IntegerField()
    total_copies = serializers.IntegerField()
    available_copies = serializers.IntegerField()
    total_users = serializers.IntegerField()
    active_loans = serializers.IntegerField()
    overdue_loans = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    total_authors = serializers.IntegerField()
    total_categories = serializers.IntegerField()


class ReaderDashboardSerializer(serializers.Serializer):
    active_loans = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    unpaid_penalties_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    recent_loans = LoanListSerializer(many=True)
    recent_notifications = NotificationSerializer(many=True)


class SecretaryDashboardSerializer(serializers.Serializer):
    pending_requests = serializers.IntegerField()
    active_loans = serializers.IntegerField()
    overdue_loans = serializers.IntegerField()
    recent_requests = LoanRequestListSerializer(many=True)
    recent_loans = LoanListSerializer(many=True)
    unpaid_penalties = PenaltySerializer(many=True)
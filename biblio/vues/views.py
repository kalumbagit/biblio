from rest_framework import viewsets,pagination,response,status  
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework import permissions
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from ..models import (
     Author, Category, Book, BookCopy, 
    LoanRequest, LoanRequestItem, Loan, LoanItem,
    Penalty, Suspension, Notification, AuditLog
)

from ..serializers import (
    AuthorSerializer, CategorySerializer, BookWriteSerializer, LoanRequestCreateSerializer,BookListSerializer, BookDetailSerializer,
    LoanRequestDetailSerializer, LoanRequestItemSerializer, LoanRequestUpdateSerializer, LoanItemSerializer,
    PenaltySerializer, SuspensionSerializer,LoanRequestListSerializer, NotificationSerializer, AuditLogSerializer,LoanRequestSecretaryResponseSerializer
)


from ..permissions import (
    IsAdmin, IsSecretary, IsReader, IsOwnerOrSecretary
)




# ==========================
# UTILITY FUNCTIONS AND CLASSES
# ==========================

def create_audit_log(actor, action, entity_type, entity_id, old_value=None, new_value=None):
    """Helper function to create audit logs"""
    AuditLog.objects.create(
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value
    )

class CustomPagination(pagination.PageNumberPagination):
    # Paramètres configurables
    page_size = 20  # Valeur par défaut
    page_size_query_param = 'page_size'  # Paramètre pour changer la taille de page
    max_page_size = 100  # Taille maximale autorisée
    page_query_param = 'page'  # Paramètre pour spécifier le numéro de page

    def get_paginated_response(self, data):
        return response.Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'results': data
        })

    def get_page_size(self, request):
        if self.page_size_query_param:
            try:
                page_size = int(request.query_params.get(self.page_size_query_param, self.page_size))
                if page_size > 0:
                    return min(page_size, self.max_page_size)
            except (TypeError, ValueError):
                pass
        return self.page_size

# ==========================
# CATALOG VIEWS
# ==========================

class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsSecretary]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsSecretary]


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().prefetch_related('authors', 'category')
    serializer_class = None
    pagination_class=CustomPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self, *args, **kwargs):
        if self.action in ["create", "update", "partial_update"]:
            return BookWriteSerializer
        elif self.action == "list":
            return BookListSerializer
        elif self.action == "retrieve":
            return BookDetailSerializer
        return BookListSerializer 
    
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [] # accès public
        return [IsSecretary()]

# ==========================
# LOAN REQUEST VIEWS
# ==========================

class LoanRequestViewSet(viewsets.ModelViewSet):

    serializer_class = None

    def get_queryset(self):
        user = self.request.user
        queryset = LoanRequest.objects.all().select_related("requester", "secretary").prefetch_related("items", "items__book")
        
        if user.role in ["SECRETARY", "ADMIN"]:
            return queryset
        return queryset.filter(requester=user)
    
    def get_serializer_class(self):
        if self.action in ['create']:
            return LoanRequestCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LoanRequestUpdateSerializer
        elif self.action == 'retrieve':
            return LoanRequestDetailSerializer
        elif self.action in ['approve', 'reject']:
            return LoanRequestSecretaryResponseSerializer
        return LoanRequestListSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated(), IsOwnerOrSecretary()]
        elif self.action in ['update', 'partial_update','create']:
            return [IsReader()]
        return [IsSecretary()]
    
    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)


    @action(detail=True, methods=['post'], permission_classes=[IsReader])
    def cancel(self, request, pk=None):
        loan_request = self.get_object()
        
        if loan_request.status != "PENDING":
            return Response(
                {"error": "Impossible d’annuler une demande déjà traitée."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        loan_request.status = "CANCELED"
        loan_request.save()

        # notifier le lecteur
        Notification.objects.create(
            user=loan_request.requester,
            type="CANCELATION",
            title="Demande annulée",
            message="Votre demande de prêt a été annulée avec succès.",
            channel="IN_APP"
        )

        serializer = self.get_serializer(loan_request)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsSecretary])
    def approve(self, request, pk=None):
        """
        cette methode permet de valider une demande de pret
        et de creer un pret associe avec les exemplaires disponibles
        1. verifier que la demande est en attente
        2. creer le pret avec une date de retour a 14 jours
        3. ajouter les exemplaires disponibles au pret
        4. mettre a jour le statut de la demande
        5. creer une notification pour l'utilisateur
        6. retourner la demande avec le statut mis a jour 
        """
        loan_request = self.get_object()
        
        if loan_request.status != 'PENDING':
            return Response(
                {'error': 'Cette demande a déjà été traitée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # creation du pret
        loan = Loan.objects.create(
            borrower=loan_request.requester,
            secretary=request.user,
            due_date=timezone.now().date() + timedelta(days=14)
        )
        
        # ajout des exemplaires disponibles au pret avec leur quantité
        for item in loan_request.items.all():
            # chercher les exemplaires disponibles
            available_stocks = item.book.stocks.filter(available_quantity__gte=item.qty)
            if not available_stocks.exists():
                return Response(
                    {"error": f"Pas assez d'exemplaires disponibles pour {item.book.title}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            stock = available_stocks.first()

            
            stock.borrow(item.qty)

            LoanItem.objects.create(
                loan=loan,
                book_stock=stock,
                condition_out="Bon état"
            )

        
        # Update request status
        loan_request.status = 'APPROVED'
        loan_request.secretary = request.user
        loan_request.decision_at = timezone.now()
        loan_request.save()
        
        # Create notification
        Notification.objects.create(
            user=loan_request.requester,
            type='APPROVAL',
            title='Demande approuvée',
            message=f'Votre demande de prêt a été approuvée. Vous pouvez récupérer vos livres.',
            channel='IN_APP'
        )
        
        serializer = self.get_serializer(loan_request)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsSecretary])
    def reject(self, request, pk=None):
        loan_request = self.get_object()
        reason = request.data.get('reason', '')
        
        if loan_request.status != 'PENDING':
            return Response(
                {'error': 'Cette demande a déjà été traitée.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update request status
        loan_request.status = 'REJECTED'
        loan_request.secretary = request.user
        loan_request.rejection_reason = reason
        loan_request.decision_at = timezone.now()
        loan_request.save()
        
        # Create notification
        Notification.objects.create(
            user=loan_request.requester,
            type='REJECTION',
            title='Demande rejetée',
            message=f'Votre demande de prêt a été rejetée. Raison: {reason}',
            channel='IN_APP'
        )
        
        serializer = self.get_serializer(loan_request)
        return Response(serializer.data)


# pas encore terminé dans l'implementation^^^^^^^^^^^^^^$$$$$$$$$$$$$$$$$$$$$$$$$

# ==========================
# LOAN VIEWS
# ==========================

class LoanViewSet(viewsets.ModelViewSet):
    serializer_class = LoanSerializer
    
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ["SECRETARY", "ADMIN"]:
            return Loan.objects.all().prefetch_related('items')
        return Loan.objects.filter(borrower=user).prefetch_related('items')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated(), IsOwnerOrSecretary()]
        return [IsSecretary()]
    
    @action(detail=True, methods=['post'], permission_classes=[IsSecretary])
    def return_loan(self, request, pk=None):
        loan = self.get_object()
        
        if loan.status != 'ACTIVE':
            return Response(
                {'error': 'Ce prêt n\'est pas actif.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update items condition and availability
        for item in loan.items.all():
            condition_in = request.data.get(f'condition_in_{item.id}')
            if condition_in:
                item.condition_in = condition_in
                item.save()
            
            # Make copy available again
            item.book_copy.available = True
            item.book_copy.save()
        
        # Update loan status
        loan.return_date = timezone.now().date()
        
        # Check if late return
        if loan.due_date < loan.return_date:
            loan.status = "LATE_RETURNED"
            
            # Create penalty for late return
            days_late = (loan.return_date - loan.due_date).days
            penalty_amount = days_late * 0.50  # 0.50€ per day late
            
            Penalty.objects.create(
                user=loan.borrower,
                loan=loan,
                reason="LATE_RETURN",
                days_late=days_late,
                amount=penalty_amount,
                note=f"Retard de {days_late} jour(s) sur le prêt {loan.id}"
            )
        else:
            loan.status = "RETURNED"
        
        loan.save()
        
        serializer = self.get_serializer(loan)
        return Response(serializer.data)


class LoanItemViewSet(viewsets.ModelViewSet):
    queryset = LoanItem.objects.all().select_related('loan', 'book_copy')
    serializer_class = LoanItemSerializer
    permission_classes = [IsSecretary]


# ==========================
# PENALTY & SUSPENSION VIEWS
# ==========================

class PenaltyViewSet(viewsets.ModelViewSet):
    serializer_class = PenaltySerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ["SECRETARY", "ADMIN"]:
            return Penalty.objects.all().select_related('user', 'loan')
        return Penalty.objects.filter(user=user).select_related('user', 'loan')
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated(), IsOwnerOrSecretary()]
        return [IsSecretary()]
    
    @action(detail=True, methods=['post'], permission_classes=[IsSecretary])
    def mark_paid(self, request, pk=None):
        penalty = self.get_object()
        
        penalty.payment_status = 'PAID'
        penalty.validated_by = request.user
        penalty.validated_at = timezone.now()
        penalty.save()
        
        serializer = self.get_serializer(penalty)
        return Response(serializer.data)


class SuspensionViewSet(viewsets.ModelViewSet):
    queryset = Suspension.objects.all().select_related('user', 'created_by')
    serializer_class = SuspensionSerializer
    permission_classes = [IsAdmin, IsSecretary]


# ==========================
# NOTIFICATION & AUDIT VIEWS
# ==========================

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, read_at__isnull=True).count()
        return Response({'count': count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.read_at = timezone.now()
        notification.save()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(
            user=request.user, 
            read_at__isnull=True
        ).update(read_at=timezone.now())
        
        return Response({'status': 'all notifications marked as read'})

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().select_related('actor')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ['action', 'entity_type']
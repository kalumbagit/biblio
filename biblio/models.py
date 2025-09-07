from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# ==========================
# USER & AUTHENTICATION
# ==========================

class User(AbstractUser):
    """
    Utilisateur de la plateforme.
    Peut être :
      - Lecteur (emprunteur de livres)
      - Secrétaire (gère les prêts, validations, sanctions)
      - Admin (supervision, paramétrages)
    """
    ROLE_CHOICES = [
        ("READER", "Lecteur"),
        ("SECRETARY", "Secrétaire"),
        ("ADMIN", "Administrateur"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="READER")

    # Suspension pour cause de trop nombreuses pénalités
    is_suspended = models.BooleanField(default=False)
    suspension_start = models.DateField(null=True, blank=True)
    suspension_end = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


# ==========================
# BOOKS / CATALOG
# ==========================

class Author(models.Model):
    """Auteur d’un ou plusieurs livres"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=120)
    birth_date = models.DateField(null=True, blank=True)
    death_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.full_name


class Category(models.Model):
    """Catégorie ou genre littéraire (Roman, Essai, BD, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=80, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Book(models.Model):
    """Ouvrage bibliographique (indépendant des exemplaires physiques)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    isbn = models.CharField(max_length=20, unique=True, blank=True, null=True)
    title = models.CharField(max_length=200)

    image_couverture = models.ImageField(
        upload_to='livres/',   # dossier de stockage dans MEDIA_ROOT
        null=True,             # facultatif : autoriser l'absence d'image
        blank=True             # facultatif : champ non obligatoire
    )

    summary = models.TextField(blank=True, null=True)
    language = models.CharField(max_length=10, help_text="Code langue ISO 639-1", default="fr")
    publisher = models.CharField(max_length=120, blank=True, null=True)
    publication_year = models.PositiveIntegerField(blank=True, null=True)

    categories = models.ForeignKey(Category,on_delete=models.CASCADE,related_name="books", blank=True)
    authors = models.ManyToManyField(Author, related_name="books", blank=True)

    def __str__(self):
        return self.title
    
    @property
    def available_copies(self):
        """Retourne le nombre d’exemplaires disponibles"""
        return self.copies.filter(available=True).count()

    @property
    def is_available(self):
        """Retourne True si au moins 2 exemplaires sont disponible car il doit toujours rester un exemplaire en bibliothèque"""
        return self.available_copies > 0


class BookCopy(models.Model):
    """Exemplaire physique d’un livre (inventaire)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="copies")
    inventory_code = models.CharField(max_length=50, unique=True)  # Code interne ou étiquette
    condition_note = models.CharField(max_length=255, blank=True, null=True)
    available = models.BooleanField(default=True)  # est à True si l'exemplaire n'est pas prêté
    added_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.book.title} [{self.inventory_code}]"

# ==========================
# LOAN REQUESTS
# ==========================

class LoanRequest(models.Model):
    """Demande d’emprunt soumise par un lecteur"""
    STATUS_CHOICES = [
        ("PENDING", "En attente"),
        ("APPROVED", "Approuvée"),
        ("REJECTED", "Rejetée"),
        ("CANCELED", "Annulée"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="loan_requests")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    secretary = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="processed_requests"
    )
    rejection_reason = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    decision_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Request {self.id} by {self.requester.username} - {self.status}"


class LoanRequestItem(models.Model):
    """Livre(s) demandé(s) dans une demande de prêt"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    loan_request = models.ForeignKey(LoanRequest, on_delete=models.CASCADE, related_name="items")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="requested_items")
    qty = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.book.title} (x{self.qty})"


# ==========================
# LOANS
# ==========================

class Loan(models.Model):
    """Emprunt validé et remis au lecteur"""
    STATUS_CHOICES = [
        ("ACTIVE", "En cours"),
        ("RETURNED", "Rendu"),
        ("LATE_RETURNED", "Rendu en retard"),
        ("LOST", "Perdu"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    borrower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="loans")
    secretary = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="loans_processed"
    )
    loan_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()  # Date limite de retour
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")

    def __str__(self):
        return f"Loan {self.id} - {self.borrower.username}"


class LoanItem(models.Model):
    """Exemplaire spécifique inclus dans un emprunt"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name="items")
    book_copy = models.ForeignKey(BookCopy, on_delete=models.CASCADE, related_name="loan_items")
    condition_out = models.CharField(max_length=255, blank=True, null=True)  # État au prêt
    condition_in = models.CharField(max_length=255, blank=True, null=True)   # État au retour

    def __str__(self):
        return f"{self.book_copy.inventory_code} for Loan {self.loan.id}"


# ==========================
# PENALTIES & PAYMENTS
# ==========================

class Penalty(models.Model):
    """Sanction appliquée pour retard, perte ou dégradation"""
    REASON_CHOICES = [
        ("LATE_RETURN", "Retard"),
        ("LOST_ITEM", "Perte"),
        ("DAMAGED_ITEM", "Dégradation"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("UNPAID", "Non payé"),
        ("PAID", "Payé"),
        ("WAIVED", "Annulé"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="penalties")
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name="penalties")
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, default="LATE_RETURN")
    days_late = models.PositiveIntegerField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.CharField(max_length=255, blank=True, null=True)

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="UNPAID")
    validated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="penalties_validated"
    )
    validated_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Penalty {self.id} for {self.user.username}"


# ==========================
# SUSPENSIONS
# ==========================

class Suspension(models.Model):
    """Suspension temporaire d’un utilisateur après trop de pénalités"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="suspensions")
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.CharField(max_length=255)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="suspensions_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Suspension {self.user.username} ({self.start_date} - {self.end_date})"


# ==========================
# NOTIFICATIONS
# ==========================

class Notification(models.Model):
    """Messages envoyés aux utilisateurs (approbation, rejet, rappel, etc.)"""
    TYPE_CHOICES = [
        ("APPROVAL", "Demande approuvée"),
        ("REJECTION", "Demande rejetée"),
        ("DUE_REMINDER", "Rappel de retour"),
        ("PENALTY", "Notification de pénalité"),
        ("SUSPENSION", "Notification de suspension"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=120)
    message = models.TextField()
    channel = models.CharField(max_length=30, default="IN_APP")  # Email, SMS, etc.
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification {self.type} for {self.user.username}"


# ==========================
# AUDIT LOGS
# ==========================

class AuditLog(models.Model):
    """Historique des actions effectuées (traçabilité)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs")
    action = models.CharField(max_length=50)  # Exemple : REQUEST_APPROVED, LOAN_CREATED
    entity_type = models.CharField(max_length=50)  # Exemple : LoanRequest, Loan
    entity_id = models.UUIDField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Audit {self.action} on {self.entity_type} ({self.entity_id})"

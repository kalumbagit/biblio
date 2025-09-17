import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { STORAGE_KEYS } from '../utils/constants';

const resources = {
  fr: {
    translation: {
      // Common
      common: {
        loading: 'Chargement...',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        view: 'Voir',
        search: 'Rechercher',
        filter: 'Filtrer',
        reset: 'Réinitialiser',
        submit: 'Soumettre',
        confirm: 'Confirmer',
        yes: 'Oui',
        no: 'Non',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        close: 'Fermer',
        welcome: 'Bienvenue',
        error: 'Erreur',
        success: 'Succès',
        warning: 'Attention',
        info: 'Information'
      },

      // Navigation
      nav: {
        home: 'Accueil',
        books: 'Livres',
        dashboard: 'Tableau de bord',
        requests: 'Demandes',
        loans: 'Prêts',
        profile: 'Profil',
        admin: 'Administration',
        logout: 'Déconnexion',
        login: 'Connexion',
        register: 'Inscription'
      },

      // Authentication
      auth: {
        login: 'Connexion',
        register: 'Inscription',
        logout: 'Déconnexion',
        username: 'pseudo nom de connexion',
        email: 'E-mail',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        firstName: 'Prénom',
        lastName: 'Nom',
        rememberMe: 'Se souvenir de moi',
        forgotPassword: 'Mot de passe oublié ?',
        alreadyHaveAccount: 'Vous avez déjà un compte ?',
        dontHaveAccount: 'Vous n\'avez pas de compte ?',
        loginSuccess: 'Connexion réussie',
        loginError: 'Erreur de connexion',
        registerSuccess: 'Inscription réussie',
        registerError: 'Erreur d\'inscription',
        invalidCredentials: 'Identifiants invalides',
        accountSuspended: 'Votre compte est suspendu'
      },

      // Books
      books: {
        title: 'Livres',
        addBook: 'Ajouter un livre',
        editBook: 'Modifier le livre',
        bookTitle: 'Titre',
        author: 'Auteur',
        isbn: 'ISBN',
        description: 'Description',
        publishYear: 'Année de publication',
        category: 'Catégorie',
        totalCopies: 'Nombre total d\'exemplaires',
        availableCopies: 'Exemplaires disponibles',
        availability: 'Disponibilité',
        available: 'Disponible',
        unavailable: 'Non disponible',
        requestLoan: 'Demander un prêt',
        bookDetails: 'Détails du livre',
        noBooksFound: 'Aucun livre trouvé',
        searchPlaceholder: 'Rechercher par titre, auteur ou ISBN...'
      },

      // Loans
      loans: {
        title: 'Prêts',
        myLoans: 'Mes prêts',
        loanDate: 'Date de prêt',
        dueDate: 'Date d\'échéance',
        returnDate: 'Date de retour',
        status: 'Statut',
        active: 'Actif',
        returned: 'Retourné',
        overdue: 'En retard',
        lost: 'Perdu',
        renew: 'Renouveler',
        return: 'Retourner',
        renewalCount: 'Nombre de renouvellements',
        maxRenewals: 'Renouvellements maximum',
        noLoansFound: 'Aucun prêt trouvé',
        overdueWarning: 'Ce prêt est en retard'
      },

      // Requests
      requests: {
        title: 'Demandes de prêt',
        myRequests: 'Mes demandes',
        newRequest: 'Nouvelle demande',
        requestDate: 'Date de demande',
        requestedDueDate: 'Date d\'échéance souhaitée',
        status: 'Statut',
        pending: 'En attente',
        approved: 'Approuvée',
        rejected: 'Rejetée',
        cancelled: 'Annulée',
        approve: 'Approuver',
        reject: 'Rejeter',
        cancel: 'Annuler',
        responseMessage: 'Message de réponse',
        noRequestsFound: 'Aucune demande trouvée'
      },

      // Users
      users: {
        title: 'Utilisateurs',
        role: 'Rôle',
        reader: 'Lecteur',
        secretary: 'Secrétaire',
        admin: 'Administrateur',
        isActive: 'Actif',
        isSuspended: 'Suspendu',
        registrationDate: 'Date d\'inscription',
        lastLogin: 'Dernière connexion',
        suspend: 'Suspendre',
        unsuspend: 'Lever la suspension',
        changeRole: 'Changer le rôle'
      },

      // Penalties
      penalties: {
        title: 'Pénalités',
        type: 'Type',
        amount: 'Montant',
        status: 'Statut',
        dueDate: 'Date d\'échéance',
        paidDate: 'Date de paiement',
        pending: 'En attente',
        paid: 'Payée',
        waived: 'Annulée',
        lateReturn: 'Retour en retard',
        lostBook: 'Livre perdu',
        damagedBook: 'Livre endommagé',
        markAsPaid: 'Marquer comme payée',
        waive: 'Annuler'
      },

      // Notifications
      notifications: {
        title: 'Notifications',
        markAsRead: 'Marquer comme lu',
        markAllAsRead: 'Tout marquer comme lu',
        noNotifications: 'Aucune notification',
        unread: 'Non lu',
        read: 'Lu'
      },

      // Dashboard
      dashboard: {
        title: 'Tableau de bord',
        welcome: 'Bienvenue, {{name}}',
        activeLoans: 'Prêts actifs',
        overdueLoans: 'Prêts en retard',
        pendingRequests: 'Demandes en attente',
        totalPenalties: 'Pénalités totales',
        recentActivity: 'Activité récente',
        quickActions: 'Actions rapides'
      },

      // Forms
      forms: {
        required: 'Ce champ est requis',
        invalidEmail: 'E-mail invalide',
        passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
        passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
        invalidIsbn: 'ISBN invalide',
        invalidYear: 'Année invalide',
        selectBook: 'Sélectionner un livre',
        selectUser: 'Sélectionner un utilisateur'
      },

      // Messages
      messages: {
        confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
        confirmLogout: 'Êtes-vous sûr de vouloir vous déconnecter ?',
        operationSuccess: 'Opération réussie',
        operationError: 'Erreur lors de l\'opération',
        networkError: 'Erreur de réseau',
        unauthorized: 'Non autorisé',
        forbidden: 'Accès interdit',
        notFound: 'Non trouvé',
        serverError: 'Erreur du serveur'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
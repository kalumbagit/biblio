# -*- coding: utf-8 -*-
import logging
from rest_framework.permissions import BasePermission


logger = logging.getLogger(__name__)

class AnyOf(BasePermission):
    """
    Autorise l'accès si au moins une des permissions fournies est valide.
    Supporte les classes de permission et les instances préconfigurées.

    Exemple:
    >>> permission_classes = [AnyOf(IsAdmin, IsObjectOwner)]
    """
    def __init__(self, *perms):
        self.perms = [perm() if isinstance(perm, type) else perm for perm in perms]

    def has_permission(self, request, view):
        return any(p.has_permission(request, view) for p in self.perms)

    def has_object_permission(self, request, view, obj):
        return any(
            not hasattr(p, 'has_object_permission') or 
            p.has_object_permission(request, view, obj)
            for p in self.perms
        )

    def get_failed_permissions(self, request, view, obj=None):
        """Utilitaire pour déboguer les permissions échouées."""
        return [
            getattr(p, '__name__', p.__class__.__name__)
            for p in self.perms
            if not (
                p.has_permission(request, view) and (
                    not hasattr(p, 'has_object_permission') or 
                    (obj is None or p.has_object_permission(request, view, obj))
                )
            )
        ]

class AllOf(BasePermission):
    def __init__(self, *perms):
        self.perms = [perm() if isinstance(perm, type) else perm for perm in perms]
    def has_permission(self, request, view):
        return all(p.has_permission(request, view) for p in self.perms)

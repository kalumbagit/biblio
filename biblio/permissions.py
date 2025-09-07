from rest_framework import permissions

# ==========================
# PERMISSION CLASSES
# ==========================

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ADMIN"


class IsSecretary(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == "SECRETARY" or request.user.role == "ADMIN"
        )


class IsReader(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "READER"


class IsOwnerOrSecretary(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'requester'):
            return obj.requester == request.user or request.user.role in ["SECRETARY", "ADMIN"]
        elif hasattr(obj, 'borrower'):
            return obj.borrower == request.user or request.user.role in ["SECRETARY", "ADMIN"]
        elif hasattr(obj, 'user'):
            return obj.user == request.user or request.user.role in ["SECRETARY", "ADMIN"]
        return False
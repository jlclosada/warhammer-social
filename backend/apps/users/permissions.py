from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """Only allow admin role users."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsPremiumOrAdmin(permissions.BasePermission):
    """Allow premium or admin role users."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'premium')


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow object owner or admin."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj == request.user or getattr(obj, 'user', None) == request.user


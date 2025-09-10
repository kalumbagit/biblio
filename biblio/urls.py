"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path,include
from rest_framework import routers

from .vues.views import (
    AuthorViewSet, CategoryViewSet, BookViewSet,
    LoanRequestViewSet, LoanViewSet,
    PenaltyViewSet, SuspensionViewSet,
    NotificationViewSet, AuditLogViewSet
)

from .vues.user import (
    UserViewSet, CustomAuthToken,CookieTokenBlacklistView, CookieTokenRefreshView
)

router = routers.DefaultRouter()

# ========== ENTITÉS DE BASE ==========
router.register(r'authors', AuthorViewSet, basename='author')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'books', BookViewSet, basename='book')

# ========== DEMANDES & PRÊTS ==========
router.register(r'loan-requests', LoanRequestViewSet, basename='loan-request')
router.register(r'loans', LoanViewSet, basename='loan')

# ========== SANCTIONS ==========
router.register(r'penalties', PenaltyViewSet, basename='penalty')
router.register(r'suspensions', SuspensionViewSet, basename='suspension')

# ========== NOTIFS & AUDIT ==========
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('auth/logout/', CookieTokenBlacklistView.as_view(), name='api_token_blacklist'),
    path('auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('users/', include(([
        path('', UserViewSet.as_view({'get': 'list', 'post': 'create'}), name='user-list'),
        path('<uuid:pk>/', UserViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='user-detail'),
        path('profile/', UserViewSet.as_view({'get': 'profile'}), name='user-profile'),
    ], 'users'))),
]
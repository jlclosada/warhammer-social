from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    UserMeView,
    ChangePasswordView,
    LogoutView,
    CheckEmailView,
    UserSearchView,
)

urlpatterns = [
    # Auth
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('register/check-email/', CheckEmailView.as_view(), name='check_email'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # User
    path('me/', UserMeView.as_view(), name='user_me'),
    path('me/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/search/', UserSearchView.as_view(), name='user_search'),
]


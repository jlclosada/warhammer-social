from rest_framework import generics, status, permissions, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint - returns JWT tokens and user info."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new user account."""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer

    @swagger_auto_schema(
        operation_description="Register a new user account",
        responses={201: UserSerializer()},
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens for immediate login after registration
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)

        return Response({
            'user': user_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Account created successfully.',
        }, status=status.HTTP_201_CREATED)


class UserMeView(generics.RetrieveUpdateAPIView):
    """Get or update the current authenticated user."""
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change the current user's password."""
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(
        request_body=ChangePasswordSerializer,
        responses={200: openapi.Response('Password changed successfully')},
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Logout - blacklist the refresh token."""
    permission_classes = (permissions.IsAuthenticated,)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['refresh'],
            properties={
                'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token'),
            },
        ),
        responses={200: openapi.Response('Logged out successfully')},
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'error': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CheckEmailView(APIView):
    """Check if an email address is already registered."""
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email to check'),
            },
        ),
        responses={200: openapi.Response('Email availability status')},
    )
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response(
                {'error': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        available = not User.objects.filter(email__iexact=email).exists()
        return Response({'available': available}, status=status.HTTP_200_OK)


class UserSearchView(APIView):
    """Search users by username or name. GET /auth/users/search/?q=<query>"""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        from django.db.models import Q
        from apps.collections.models import Follow

        q = request.query_params.get('q', '').strip()
        if not q or len(q) < 2:
            return Response([])

        users = (
            User.objects
            .filter(is_active=True)
            .filter(
                Q(username__icontains=q)
                | Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
            )
            .exclude(pk=request.user.pk)
            [:20]
        )

        following_ids = set(
            Follow.objects
            .filter(follower=request.user)
            .values_list('following_id', flat=True)
        )

        results = []
        for u in users:
            results.append({
                'id': u.id,
                'username': u.username,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'avatar': request.build_absolute_uri(u.avatar.url) if u.avatar else None,
                'bio': u.bio[:100] if u.bio else '',
                'is_following': u.id in following_ids,
            })

        return Response(results)


class EnvironmentView(APIView):
    """GET /auth/env/ — Return current environment info."""
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        from django.conf import settings
        return Response({
            'environment': getattr(settings, 'ENVIRONMENT', 'unknown'),
            'debug': settings.DEBUG,
            'version': '1.0.0',
        })



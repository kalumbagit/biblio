from rest_framework import viewsets, permissions,status,exceptions,views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

# JWT dependencies
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from ..permissions import IsAdmin



from ..serializers import (
    LoginSerializer, UserSerializer, UserRegistrationSerializer,UserProfileSerializer
)

from ..models import (
    User
)


# ==========================
# AUTHENTICATION VIEWS
# ==========================

def extract_refresh_token(request):
    """
    Extract the refresh token from either cookie or authorization header.
    
    Args:
        request: HttpRequest object containing cookies and headers
    
    Returns:
        str: The refresh token if found, None otherwise
    
    Note:
        Priority is given to cookie storage, with header as fallback.
        Header format should be: 'X-Refresh-Token: Bearer <token>'
    """
    # 1. Primary extraction from cookie
    refresh = request.COOKIES.get('refresh_token')
    
    # 2. Fallback to custom header if cookie not present
    if not refresh and 'X-Refresh-Token' in request.headers:
        auth_header = request.headers['X-Refresh-Token'].split()
        if len(auth_header) == 2 and auth_header[0] == 'Bearer':
            refresh = auth_header[1]
    
    return refresh

class CustomAuthToken(TokenObtainPairView):
    """
    Custom JWT token obtain view that sets tokens in secure HTTP-only cookies.
    
    Inherits from TokenObtainPairView and adds cookie handling functionality.
    Uses LoginSerializer for credential validation.
    """
    
    serializer_class = LoginSerializer
    def post(self, request, *args, **kwargs):
        """
        Handle POST request for token generation.
        
        1. Validates credentials using CustomTokenSerializer
        2. On success, sets tokens in secure cookies
        3. Returns token data in response body
        
        Security Features:
        - HTTP-only cookies prevent XSS attacks
        - Secure flag ensures HTTPS-only transmission
        - SameSite=Lax prevents CSRF attacks
        - Short-lived access token (5 minutes)
        - Long-lived refresh token (7 days) stored securely
        """
        
        data = request.data
        serializer = self.get_serializer(data=data)

        try:
            serializer.is_valid(raise_exception=True)
        except exceptions.ValidationError as ve:
            message = ve.detail.get("non_field_errors", ["Erreur inconnue"])[0]
            return Response(
               { "message":str(message)}, 
               status=status.HTTP_400_BAD_REQUEST
            )
            
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access = response.data.get("access")
            refresh = response.data.get("refresh")
            
            # Get user data from validated serializer
            user = response.data.get("user")
            user_data = UserSerializer(user).data

            # Set access token cookie (short-lived)
            response.set_cookie(
                key="access_token",
                value=access,
                httponly=True,  # Prevent JavaScript access
                secure=True,     # HTTPS only
                max_age=300,    # 5 minutes expiration
                samesite='Lax'   # Balance security and usability
            )

            # Set refresh token cookie (long-lived)
            response.set_cookie(
                key="refresh_token",
                value=refresh,
                httponly=True,
                secure=True,
                max_age=604800,  # 7 days expiration
                samesite='Lax'
            )

            # Include tokens in response body for initial consumption
            response.data = {
                "access_token": access,
                "refresh_token": refresh,
                "user": user_data
            }

        return response

class CookieTokenRefreshView(TokenRefreshView):
    """
    Custom JWT token refresh view that retrieves refresh token from cookie or header.
    
    Extends TokenRefreshView to support cookie-based token refresh flow.
    """
    def post(self, request, *args, **kwargs):
        """
        Handle POST request for token refresh.
        
        1. Extracts refresh token from cookie or header
        2. Validates and processes refresh token
        3. Returns new access token
        
        Note: The new refresh token (if rotation enabled) will need to be handled
        by the client via response body or subsequent cookie set.
        """
        refresh = extract_refresh_token(request)
        data=request.data.copy()

        if not refresh:
            return Response(
                {"detail": "Refresh token missing in cookies or headers."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Inject into request body for standard JWT processing
        data['refresh'] = refresh
        serializer=self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
        except exceptions.ValidationError as ve:
            message = ve.detail.get("detail", ["Erreur inconnue"])[0]
            return Response(
               { "message":str(message)}, 
               status=status.HTTP_400_BAD_REQUEST
            )
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class CookieTokenBlacklistView(views.APIView):
    """
    JWT token revocation endpoint that handles cookie-based logout.
    
    This view:
    1. Extracts refresh token from cookie/header
    2. Blacklists the token
    3. Clears auth cookies from client
    
    Note: Uses 205 Reset Content status to indicate successful logout with
    cookie clearing instructions.
    """
  
    def post(self, request, *args, **kwargs):
        """
        Handle POST request for token invalidation.
        
        Security Considerations:
        - Immediately invalidates refresh token
        - Clears client-side tokens
        - Prevents token reuse after logout
        """
        refresh = extract_refresh_token(request)

        if refresh is None:
            return Response(
                {"detail": "Refresh token required for logout."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh)
            token.blacklist()
            
        except TokenError as e:
           
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create response with cookie clearing instructions
        response = Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_205_RESET_CONTENT
        )
        
        # Clear auth cookies
        response.delete_cookie(
            "access_token",
            path='/',
            domain=None,
            samesite='Lax'
        )
        response.delete_cookie(
            "refresh_token",
            path='/',
            domain=None,
            samesite='Lax'
        )
        
        return response

class UserViewSet(viewsets.ModelViewSet):
    """ cette classe donne à l'admin le droit de voir tous les enregistrements,
        mais : chaque utilisateur doit pouvoir effectuer son crud personnel
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action == 'profile':
            return UserProfileSerializer
        return UserSerializer
    
    def get_permissions(self):
        """
        - Admin : accès complet
        - Les autres : accès uniquement à leur propre instance (CRUD personnel)
        """
        if self.action in ['list', 'destroy']:
            permission_classes = [IsAdmin]  # Seul l'admin peut lister ou supprimer
        elif self.action in ['retrieve', 'update', 'partial_update','profile']:
            permission_classes = [permissions.IsAuthenticated]  # Chacun sur soi-même
        elif self.action == 'create':
            permission_classes = []  # Créer son compte utilisateur est ouvert à tous
        else:  # profile ou autres actions personnalisées
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
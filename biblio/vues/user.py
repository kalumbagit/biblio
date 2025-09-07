from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
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

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        user_data = UserSerializer(user).data
        
        return Response({
            'token': token.key,
            'user': user_data
        })


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
        elif self.action in ['retrieve', 'update', 'partial_update']:
            permission_classes = [permissions.IsAuthenticated]  # Chacun sur soi-même
        elif self.action == 'create':
            permission_classes = []  # Créer son compte utilisateur est ouvert à tous
        else:  # profile ou autres actions personnalisées
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
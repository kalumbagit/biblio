
# -*- coding: utf-8 -*-

# Standard Library
import logging


# Django REST Framework SimpleJWT
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
       
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)


class CookieOrTokenJWTAuthentication(JWTAuthentication):
    """
    Authentification JWT basée sur un cookie 'access_token' (fallback sur header Authorization).

    Exemple:
    - Cookie: `access_token=<JWT>`
    - Header: `Authorization: Bearer <JWT>`
    """

    def authenticate(self, request):
    	
        # 1. Extraction depuis le cookie
        token = request.COOKIES.get('access_token')

        # 2. Fallback: Header Authorization (Bearer)
        if not token and 'Authorization' in request.headers:
            auth_header = request.headers['Authorization'].split()
            if len(auth_header) == 2 and auth_header[0] == 'Bearer':
                token = auth_header[1]

        if not token:
            return None

        # 3. Validation
        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            logger.info(f"User {user.fullname} authentifié via JWT")
            return user, validated_token
        except InvalidToken as e:
            logger.warning(f"Token invalide: {e}")
            raise AuthenticationFailed("Token invalide ou expiré.")
 



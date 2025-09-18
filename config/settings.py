"""
Django settings for config project.

Projet généré avec 'django-admin startproject' en utilisant Django 5.2.6.

📚 Documentation utile :
- Paramètres généraux : https://docs.djangoproject.com/en/5.2/topics/settings/
- Liste complète des options : https://docs.djangoproject.com/en/5.2/ref/settings/
"""

import os
from pathlib import Path
import environ
from datetime import timedelta
from corsheaders.defaults import default_headers


# ========================================================================================
# 📂 VARIABLES D’ENVIRONNEMENT
# ========================================================================================
# Chargement des variables depuis le fichier .env
# 👉 Bonne pratique : ne jamais exposer les infos sensibles (secret key, tokens, DB, etc.)
env = environ.Env()
environ.Env.read_env()


# ========================================================================================
# 📂 BASE DU PROJET
# ========================================================================================
# BASE_DIR pointe vers le dossier racine du projet
BASE_DIR = Path(__file__).resolve().parent.parent


# ========================================================================================
# 🔐 CONFIGURATION SÉCURITÉ
# ========================================================================================
SECRET_KEY = env("SECRET_KEY")  # ⚠️ À garder secret en production
DEBUG = env.bool("DEBUG", default=True)  # True en dev, False en prod
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])  # Domaines autorisés pour la prod
CORS_ALLOW_HEADERS=list(default_headers) + env.list("CORS_ALLOW_HEADERS")


# ========================================================================================
# 📦 APPLICATIONS
# ========================================================================================
INSTALLED_APPS = [
    # Applications Django natives (core)
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Applications tierces (externes)
    'rest_framework',       # API REST
    'corsheaders',          # Gestion du CORS
    'rest_framework_simplejwt',                # Authentification JWT (stateless)
    'rest_framework_simplejwt.token_blacklist', # Gestion des tokens invalidés

    # Applications internes (créées par le développeur)
    'biblio.apps.BiblioConfig',
]


# ========================================================================================
# 🧱 MIDDLEWARES
# ========================================================================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',

    # CORS doit être placé avant CommonMiddleware (cf. doc django-cors-headers)
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# ========================================================================================
# 🔑 AUTHENTIFICATION & JWT
# ========================================================================================

# Authentification via JWT pour les API
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

# Backends d'authentification disponibles, tous les backends personnalisés doivent etre mis en premier avant celui qui est là
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# Configuration de JWT (durée de vie et options)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=env.int("ACCESS_TOKEN_LIFETIME", default=5)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=env.int("REFRESH_TOKEN_LIFETIME", default=1)),
    'ROTATE_REFRESH_TOKENS': env.bool("ROTATE_REFRESH_TOKENS", default=False),
    'BLACKLIST_AFTER_ROTATION': env.bool("BLACKLIST_AFTER_ROTATION", default=True),
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# ========================================================================================
# 🌐 CORS (Cross-Origin Resource Sharing)
# ========================================================================================
# Permet aux applications front (ex: Angular, React) d’accéder à l’API Django
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])


# ========================================================================================
# 🌍 ROUTAGE & TEMPLATES
# ========================================================================================
ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],   # Répertoires supplémentaires de templates (si besoin)
        'APP_DIRS': True,  # Recherche auto dans les répertoires "templates" des apps
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',  # Injection auto des infos de requête
                'django.contrib.auth.context_processors.auth', # Infos utilisateur
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# ========================================================================================
# 🗄️ BASE DE DONNÉES
# ========================================================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',  # ⚠️ Dev uniquement — utiliser Postgres/MySQL en prod
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
    }
}


# ========================================================================================
# 🔐 VALIDATION DES MOTS DE PASSE
# ========================================================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},   # Longueur minimale
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'}, # Pas de mots de passe trop communs
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},# Pas de mot de passe uniquement numérique
]


# ========================================================================================
# 🌐 LOCALISATION
# ========================================================================================
LANGUAGE_CODE = 'fr'           # Langue par défaut : Français
TIME_ZONE = 'Africa/Douala'    # Fuseau horaire : Cameroun
USE_I18N = True                # Internationalisation activée
USE_TZ = True                  # Utilisation du temps UTC interne (recommandée)


# ========================================================================================
# 🗂️ FICHIERS STATIQUES & MÉDIAS
# ========================================================================================
# Fichiers statiques (CSS, JS, images non-uploadées)
STATIC_URL = 'static/'

# Fichiers uploadés par les utilisateurs (images, docs…)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# ========================================================================================
# 🗝️ CLÉ PRIMAIRE PAR DÉFAUT
# ========================================================================================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


#=======================================================================================
# 👤 MODÈLE D’UTILISATEUR PERSONNALISÉ
#=======================================================================================
# Permet d’utiliser un modèle User personnalisé défini dans l’application 'biblio'
AUTH_USER_MODEL = "biblio.User"


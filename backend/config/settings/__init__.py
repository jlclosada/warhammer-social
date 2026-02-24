"""
Django settings for warhammer_portal project.
Environment-aware configuration: DEV | QA | PROD

Usage:
  Default (.env):           python manage.py runserver
  QA (.env.qa):             ENV_FILE=.env.qa python manage.py runserver
  Production (.env.prod):   ENV_FILE=.env.prod python manage.py runserver
"""

import os
from pathlib import Path
from datetime import timedelta
from decouple import Config, RepositoryEnv, config as _decouple_config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ═══════════════════════════════════════════
# LOAD THE CORRECT .env FILE
# ═══════════════════════════════════════════
# Priority: ENV_FILE env var → .env (default)
_env_file = os.environ.get('ENV_FILE', '.env')
_env_path = BASE_DIR / _env_file

if _env_path.is_file():
    config = Config(RepositoryEnv(str(_env_path)))
else:
    # Fallback to python-decouple defaults
    config = _decouple_config

# ═══════════════════════════════════════════
# ENVIRONMENT DETECTION
# ═══════════════════════════════════════════
ENVIRONMENT = config('ENVIRONMENT', default='dev').lower()  # dev | qa | prod
assert ENVIRONMENT in ('dev', 'qa', 'prod'), (
    f"Invalid ENVIRONMENT '{ENVIRONMENT}'. Must be dev, qa, or prod."
)

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=(ENVIRONMENT == 'dev'), cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    # Local apps
    'apps.users',
    'apps.collections',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_yasg',
    'allauth',
    'allauth.account',
]

SITE_ID = 1

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='warhammer_portal'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Custom user model
AUTH_USER_MODEL = 'users.User'

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# ═══════════════════════════════════════════
# REST FRAMEWORK — varies by environment
# ═══════════════════════════════════════════
_THROTTLE_RATES = {
    'dev':  {'anon': '200/minute', 'user': '500/minute'},
    'qa':   {'anon': '60/minute',  'user': '200/minute'},
    'prod': {'anon': '30/minute',  'user': '100/minute'},
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': _THROTTLE_RATES.get(ENVIRONMENT, _THROTTLE_RATES['dev']),
}

# ═══════════════════════════════════════════
# JWT — varies by environment
# ═══════════════════════════════════════════
_JWT_CONFIG = {
    'dev':  {'access': timedelta(hours=2),    'refresh': timedelta(days=30)},
    'qa':   {'access': timedelta(minutes=30), 'refresh': timedelta(days=7)},
    'prod': {'access': timedelta(minutes=15), 'refresh': timedelta(days=3)},
}
_jwt = _JWT_CONFIG.get(ENVIRONMENT, _JWT_CONFIG['dev'])

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': _jwt['access'],
    'REFRESH_TOKEN_LIFETIME': _jwt['refresh'],
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# django-allauth
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_EMAIL_VERIFICATION = 'mandatory' if ENVIRONMENT == 'prod' else 'none'

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Swagger / drf-yasg
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'Enter: Bearer <token>',
        }
    },
    'USE_SESSION_AUTH': True,
    'JSON_EDITOR': True,
}

# ═══════════════════════════════════════════
# SECURITY — production only
# ═══════════════════════════════════════════
if ENVIRONMENT == 'prod':
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ═══════════════════════════════════════════
# LOGGING — varies by environment
# ═══════════════════════════════════════════
_LOG_LEVEL = {'dev': 'DEBUG', 'qa': 'INFO', 'prod': 'WARNING'}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{levelname}] {asctime} [{module}] {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': _LOG_LEVEL.get(ENVIRONMENT, 'INFO'),
    },
}

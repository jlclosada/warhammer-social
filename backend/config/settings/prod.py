"""
Production settings.
Usage: DJANGO_SETTINGS_MODULE=config.settings.prod
"""
from .base import *  # noqa: F401,F403

ENVIRONMENT = 'prod'
DEBUG = False

# Security
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=True, cast=bool)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Strict throttling
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '30/minute',
    'user': '100/minute',
}

# Short token lifetimes for security
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=15)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=3)

# Require email verification in production
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'

# Production logging — only warnings and above
LOGGING['root']['level'] = 'WARNING'

# Disable Swagger in production
SWAGGER_SETTINGS['DEFAULT_API_URL'] = None


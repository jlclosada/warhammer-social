"""
Development settings.
Usage: DJANGO_SETTINGS_MODULE=config.settings.dev
"""
from .base import *  # noqa: F401,F403

ENVIRONMENT = 'dev'
DEBUG = True

# More relaxed throttling for development
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '200/minute',
    'user': '500/minute',
}

# Longer tokens for development convenience
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(hours=2)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=30)

# No email verification in dev
ACCOUNT_EMAIL_VERIFICATION = 'none'

# Debug logging
LOGGING['root']['level'] = 'DEBUG'


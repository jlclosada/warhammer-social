"""
QA / Staging settings.
Usage: DJANGO_SETTINGS_MODULE=config.settings.qa
"""
from .base import *  # noqa: F401,F403

ENVIRONMENT = 'qa'
DEBUG = config('DEBUG', default=False, cast=bool)

# QA uses its own database
DATABASES['default']['NAME'] = config('DB_NAME', default='warhammer_portal_qa')

# Moderate throttling
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '60/minute',
    'user': '200/minute',
}

# Standard token lifetimes
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(minutes=30)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=7)

# No email verification in QA (but could be enabled for testing)
ACCOUNT_EMAIL_VERIFICATION = 'none'

# Logging
LOGGING['root']['level'] = 'INFO'


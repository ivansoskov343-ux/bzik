#!/bin/bash
set -e

# Исходная строка подключения
ORIG_DATABASE_URL="${DATABASE_URL}"
HOST=$(echo "$ORIG_DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')

if [ -n "$HOST" ]; then
    echo "Original host: $HOST"
    IPV4=$(nslookup -type=A "$HOST" 2>/dev/null | grep -A1 'Name:' | grep 'Address:' | awk '{print $2}' | grep -v ':' | head -1)
    if [ -n "$IPV4" ]; then
        echo "Resolved to IPv4: $IPV4"
        NEW_DATABASE_URL=$(echo "$ORIG_DATABASE_URL" | sed "s/$HOST/$IPV4/")
    else
        echo "Could not resolve IPv4, using original host"
        NEW_DATABASE_URL="$ORIG_DATABASE_URL"
    fi
else
    NEW_DATABASE_URL="$ORIG_DATABASE_URL"
fi

if [[ "$NEW_DATABASE_URL" != *"sslmode"* ]]; then
    if [[ "$NEW_DATABASE_URL" == *"?"* ]]; then
        NEW_DATABASE_URL="${NEW_DATABASE_URL}&sslmode=require"
    else
        NEW_DATABASE_URL="${NEW_DATABASE_URL}?sslmode=require"
    fi
fi

export DATABASE_URL="$NEW_DATABASE_URL"
export SECRET_KEY="${SECRET_KEY}"
export DEBUG="${DEBUG:-False}"
export DJANGO_SETTINGS_MODULE="my_settings"

echo "=== Using DATABASE_URL: ${DATABASE_URL:0:80}... ==="

cat > /app/backend/my_settings.py <<'EOL'
import os
import dj_database_url

DATABASES = {
    'default': dj_database_url.parse(os.environ['DATABASE_URL'])
}
SECRET_KEY = os.environ['SECRET_KEY']
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
    'ideas',
    'notifications',
    'rewards',
    'tasks',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [{
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
}]

WSGI_APPLICATION = 'config.wsgi.application'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = '/app/backend/staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'accounts.User'

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('EMAIL_HOST_USER', '')

# Celery
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', '')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_BROKER_URL', '')

# Frontend URL for email links
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://wwhcoque-bzik.hf.space')
EOL

echo "=== Applying migrations with my_settings ==="
python3 /app/backend/manage.py migrate --settings=my_settings --noinput

echo "=== Starting Supervisor ==="
exec /usr/bin/supervisord -n

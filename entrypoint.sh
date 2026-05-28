#!/bin/bash
set -e

export DATABASE_URL="${DATABASE_URL}"
export SECRET_KEY="${SECRET_KEY}"
export DEBUG="${DEBUG:-False}"
export DJANGO_SETTINGS_MODULE="config.settings"

echo "=== DATABASE_URL (first 60): ${DATABASE_URL:0:60} ==="
echo "=== DJANGO_SETTINGS_MODULE = ${DJANGO_SETTINGS_MODULE} ==="

# Проверка парсинга переменной
python3 <<EOF
import os, sys, dj_database_url
url = os.environ.get('DATABASE_URL')
if not url:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)
print("Parsing DATABASE_URL...")
config = dj_database_url.parse(url)
print("Got config:", config)
if 'ENGINE' not in config:
    print("ERROR: ENGINE not in config")
    sys.exit(1)
EOF

# Принудительно создаём settings.py прямо в процессе (на всякий случай)
mkdir -p /app/backend/config
cat > /app/backend/config/settings.py <<'EOL'
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
EOL

# Проверим, что наш settings.py работает
echo "Checking created settings.py..."
python3 -c "
import sys, os
sys.path.insert(0, '/app/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.conf import settings
print('DATABASES ENGINE:', settings.DATABASES['default']['ENGINE'])
print('HOST:', settings.DATABASES['default']['HOST'])
"

echo "Applying migrations..."
python3 /app/backend/manage.py migrate --noinput

echo "Starting Supervisor..."
exec /usr/bin/supervisord -n

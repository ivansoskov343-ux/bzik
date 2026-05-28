#!/bin/bash
set -e

# Получаем оригинальную строку подключения
ORIG_DATABASE_URL="${DATABASE_URL}"

# Извлекаем хост (часть между @ и :порт)
HOST=$(echo "$ORIG_DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
if [ -n "$HOST" ]; then
    echo "Original host: $HOST"
    # Пытаемся получить IPv4 адрес этого хоста
    IPV4=$(getent ahosts "$HOST" | head -1 | awk '{print $1}')
    if [[ "$IPV4" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "Resolved to IPv4: $IPV4"
        # Заменяем хост на его IPv4 адрес
        NEW_DATABASE_URL=$(echo "$ORIG_DATABASE_URL" | sed "s/$HOST/$IPV4/")
    else
        echo "Could not resolve IPv4, using original host"
        NEW_DATABASE_URL="$ORIG_DATABASE_URL"
    fi
else
    NEW_DATABASE_URL="$ORIG_DATABASE_URL"
fi

# Добавляем sslmode=require (обязательно для Supabase)
if [[ "$NEW_DATABASE_URL" != *"sslmode"* ]]; then
    NEW_DATABASE_URL="${NEW_DATABASE_URL}?sslmode=require"
fi

export DATABASE_URL="$NEW_DATABASE_URL"
export SECRET_KEY="${SECRET_KEY}"
export DEBUG="${DEBUG:-False}"
export DJANGO_SETTINGS_MODULE="my_settings"

echo "=== Using DATABASE_URL: ${DATABASE_URL:0:80}... ==="

# Создаём my_settings.py с полным списком приложений
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

# Если в проекте используется своя модель пользователя
AUTH_USER_MODEL = 'accounts.User'
EOL

echo "=== Applying migrations with my_settings ==="
python3 /app/backend/manage.py migrate --settings=my_settings --noinput

echo "=== Starting Supervisor ==="
exec /usr/bin/supervisord -n

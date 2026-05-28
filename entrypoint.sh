#!/bin/bash
set -e

echo "=== DIAGNOSTIC START ==="
echo "DATABASE_URL is set: ${DATABASE_URL:0:50}..."
echo "=== DIAGNOSTIC END ==="

echo "=== PYTHON ENVIRONMENT CHECK ==="
python3 -c "
import os, sys
print('DATABASE_URL from os.environ:', os.environ.get('DATABASE_URL', 'NOT FOUND')[:60])
try:
    import dj_database_url
    print('dj_database_url imported OK')
except ImportError:
    print('ERROR: dj_database_url not installed')
    sys.exit(1)
"

echo "Waiting for database (5s)..."
sleep 5

echo "Applying migrations..."
python3 /app/backend/manage.py migrate --noinput

echo "Collecting static files..."
python3 /app/backend/manage.py collectstatic --noinput

echo "Starting Supervisor..."
exec /usr/bin/supervisord -n

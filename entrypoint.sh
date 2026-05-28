#!/bin/bash
set -e

echo "=== DIAGNOSTIC START ==="
echo "Checking DATABASE_URL variable..."
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is NOT set in environment!"
else
    echo "DATABASE_URL is set (first 30 chars): ${DATABASE_URL:0:30}..."
fi
echo "=== DIAGNOSTIC END ==="

echo "Waiting for database..."
sleep 5

echo "Applying migrations..."
python3 /app/backend/manage.py migrate --noinput

echo "Collecting static files..."
python3 /app/backend/manage.py collectstatic --noinput

echo "Starting Supervisor..."
exec /usr/bin/supervisord -n

#!/bin/bash
set -e

echo "=== DIAGNOSTIC START ==="
echo "DATABASE_URL is set: ${DATABASE_URL:0:50}..."
echo "=== DIAGNOSTIC END ==="

echo "Waiting for database (5s)..."
sleep 5

echo "Applying migrations..."
python3 /app/backend/manage.py migrate --noinput

echo "Collecting static files..."
python3 /app/backend/manage.py collectstatic --noinput

echo "Starting Supervisor..."
exec /usr/bin/supervisord -n

#!/bin/bash
set -e

echo "Waiting for database..."
sleep 5

echo "Applying migrations..."
python3 /app/backend/manage.py migrate --noinput

echo "Collecting static files..."
python3 /app/backend/manage.py collectstatic --noinput

echo "Starting Supervisor..."
exec /usr/bin/supervisord -n

#!/bin/bash
set -e

echo "Waiting for database..."
sleep 5

echo "Applying migrations..."
python /app/backend/manage.py migrate --noinput

echo "Collecting static files..."
python /app/backend/manage.py collectstatic --noinput

echo "Starting Supervisor..."
exec /usr/bin/supervisord -n

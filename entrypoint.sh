#!/bin/sh

echo "Waiting for PostgreSQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.5
done
echo "PostgreSQL is ready."

echo "Running migrations..."
python manage.py migrate --noinput

exec "$@"

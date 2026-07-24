#!/bin/sh
set -e

cd /var/www/html

# Cache con env vars de runtime
php artisan config:cache
php artisan route:cache

# Esperar DB (max 90s)
echo "Esperando base de datos..."
i=0
until php artisan migrate:status > /dev/null 2>&1 || [ $i -ge 90 ]; do
    i=$((i+1))
    sleep 1
done

# Ejecutar migraciones (idempotente — seguro en cada restart)
php artisan migrate --force && echo "[OK] Migraciones completadas" || echo "[WARN] Migraciones fallaron"

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

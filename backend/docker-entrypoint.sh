#!/bin/sh
set -eu

if [ -z "${APP_KEY:-}" ]; then
    mkdir -p /var/lib/scholarspace
    if [ -s /var/lib/scholarspace/app-key ]; then
        APP_KEY="$(cat /var/lib/scholarspace/app-key)"
    else
        APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
        printf '%s' "$APP_KEY" > /var/lib/scholarspace/app-key
    fi
    export APP_KEY
fi

php artisan migrate --force
php artisan db:seed --force

exec "$@"

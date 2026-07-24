FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    nginx supervisor curl git zip unzip \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    oniguruma-dev libxml2-dev icu-dev libzip-dev \
    $PHPIZE_DEPS

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip xml opcache intl \
 && pecl install redis \
 && docker-php-ext-enable redis

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
 && php artisan config:cache \
 && php artisan route:cache \
 && php artisan view:cache \
 && chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

EXPOSE 80
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

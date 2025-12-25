FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    postgresql-dev \
    git \
    unzip \
    libzip-dev \
    zip \
    icu-dev \
    oniguruma-dev

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    intl \
    mbstring \
    zip

# Setup Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www
COPY . .

# Install dependencies and optimize
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

# The fix: Clear config cache first, wait 5 seconds, then migrate and serve
CMD php artisan config:clear && sleep 5 && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
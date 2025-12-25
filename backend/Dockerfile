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

# We copy the code, but we will delete any existing .env to force Render's vars
COPY . .
RUN rm -f .env

# Install dependencies and optimize
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

# The fix: 
# 1. Clear all caches
# 2. Print the DB_HOST to the logs (for debugging)
# 3. Wait 10 seconds for the network
# 4. Migrate and Serve
CMD php artisan config:clear && \
    echo "DEBUG: Connecting to DB_HOST: $DB_HOST" && \
    sleep 10 && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=8000
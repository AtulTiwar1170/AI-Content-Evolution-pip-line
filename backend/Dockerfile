FROM php:8.2-fpm-alpine

# Install system dependencies for PostgreSQL and PHP extensions
RUN apk add --no-cache \
    postgresql-dev \
    git \
    unzip \
    libzip-dev \
    zip \
    icu-dev \
    oniguruma-dev

# Install PHP extensions required for Laravel & PostgreSQL
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    intl \
    mbstring \
    zip

# Fix for Composer: Copy the binary from the official image instead of using curl
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . .

# Adjust permissions for Laravel storage and cache
RUN composer install --no-dev --optimize-autoloader --no-interaction
RUN chown -R www-data:www-data /var/www/storage /var/www/cache 2>/dev/null || true

# Expose port 8000
EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
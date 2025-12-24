# Use PHP with FPM (Fast Process Manager)
FROM php:8.2-fpm-alpine

# Install system dependencies for PostgreSQL and Composer
RUN apk add --no-cache \
    postgresql-dev \
    libpq-dev \
    git \
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql

# Set working directory
WORKDIR /var/www

# Copy existing application directory
COPY . .

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Expose port 8000 for 'php artisan serve'
EXPOSE 8000

# Start Laravel
CMD php artisan serve --host=0.0.0.0 --port=8000
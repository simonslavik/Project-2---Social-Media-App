#!/bin/bash

# Production Deployment Script for Social Media Microservices
# Usage: ./scripts/deploy.sh [environment]

set -e  # Exit on any error

ENVIRONMENT=${1:-production}
echo "🚀 Deploying to $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment file exists
ENV_FILE=".env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file $ENV_FILE not found!"
    print_warning "Please copy .env.prod.template to $ENV_FILE and configure it."
    exit 1
fi

print_status "Environment file found: $ENV_FILE"

# Load environment variables
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Check if required environment variables are set
required_vars=("JWT_SECRET" "MONGODB_URI")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set in $ENV_FILE"
        exit 1
    fi
done

print_status "Required environment variables are set"

# Build and deploy based on environment
case $ENVIRONMENT in
    "production")
        COMPOSE_FILE="docker-compose.prod.yml"
        ;;
    "staging")
        COMPOSE_FILE="docker-compose.staging.yml"
        ;;
    *)
        COMPOSE_FILE="docker-compose.yml"
        ;;
esac

print_status "Using compose file: $COMPOSE_FILE"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE down

# Pull latest images (if using registry)
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Pulling latest images..."
    # docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE pull
fi

# Build and start containers
print_status "Building and starting containers..."
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Health check
print_status "Performing health checks..."

# Check API Gateway
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "✅ API Gateway is healthy"
else
    print_error "❌ API Gateway health check failed"
    exit 1
fi

# Check Identity Service
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_status "✅ Identity Service is healthy"
else
    print_error "❌ Identity Service health check failed"
    exit 1
fi

# Show running containers
print_status "Deployment complete! Running containers:"
docker-compose -f $COMPOSE_FILE ps

print_status "🎉 Deployment to $ENVIRONMENT successful!"
print_status "API Gateway: http://localhost:3000"
print_status "Identity Service: http://localhost:3001"

# Show logs command
print_warning "To view logs, run: docker-compose -f $COMPOSE_FILE logs -f"
print_warning "To stop services, run: docker-compose -f $COMPOSE_FILE down"
# 🚀 VPS Deployment Guide

## Prerequisites

### 1. GitHub Secrets Setup

Add these secrets to your GitHub repository:

- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub access token
- `VPS_SSH_PRIVATE_KEY` - Your VPS SSH private key

### 2. VPS Setup

On your VPS (62.72.30.37), ensure you have:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone your repository
cd /home/root/projects/nodejsfullcourse/
git clone https://github.com/your-username/Project-2---Social-Media-App.git NodeJS-Microservices
cd NodeJS-Microservices
```

### 3. Environment Variables

Create `.env` file on your VPS with production values:

```bash
# Production Environment Variables
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_production_password_here
MONGO_DATABASE=social_media

JWT_SECRET=your_super_secure_jwt_secret_for_production
JWT_EXPIRES_IN=1d

REDIS_URL=redis://redis:6379

RABBITMQ_USER=admin
RABBITMQ_PASSWORD=your_production_rabbitmq_password
RABBITMQ_URL=amqp://admin:your_production_rabbitmq_password@rabbitmq:5672

# Service URLs
IDENTITY_SERVICE_URL=http://identity-service:3001
POST_SERVICE_URL=http://post-service:3002
MEDIA_SERVICE_URL=http://media-service:3003
SEARCH_SERVICE_URL=http://search-service:3004

NODE_ENV=production
```

## 🔧 Configuration Updates Needed

### 1. Update Docker Hub Username

Replace `your-dockerhub-username` in:

- `docker-compose.yml`
- `docker-compose.production.yml`
- `.github/workflows/deploy.yml`

### 2. Update VPS Path

In `.github/workflows/deploy.yml`, update this path to match your VPS:

```yaml
cd /home/root/projects/nodejsfullcourse/NodeJS-Microservices
```

## 🚀 Deployment Process

### Automatic Deployment

1. Push to `main` branch
2. GitHub Actions will:
   - Build Docker images
   - Push to Docker Hub
   - SSH into VPS
   - Pull latest code
   - Deploy with docker-compose

### Manual Deployment

On your VPS:

```bash
cd /home/root/projects/nodejsfullcourse/NodeJS-Microservices
git pull origin main
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

## 📋 Ports & Access

### Production Ports:

- **API Gateway**: Port 80 (http://62.72.30.37)
- **Identity Service**: Port 3001
- **Post Service**: Port 3002
- **Media Service**: Port 3003
- **Search Service**: Port 3004
- **RabbitMQ Management**: Port 15672
- **MongoDB**: Port 27017 (internal)
- **Redis**: Port 6379 (internal)

### Health Checks:

```bash
# Check all services
docker-compose ps

# Check logs
docker-compose logs api-gateway
docker-compose logs identity-service
```

## 🔒 Security Considerations

### 1. Firewall Setup

```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS (if using SSL)
ufw enable
```

### 2. SSL Certificate (Optional)

Consider setting up SSL with Let's Encrypt:

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

### 3. Production Secrets

- Use strong, unique passwords
- Rotate secrets regularly
- Consider using Docker secrets for sensitive data

## 📊 Monitoring

### Basic Monitoring:

```bash
# Check resource usage
docker stats

# View logs
docker-compose logs -f

# Check service health
curl http://62.72.30.37/health
```

## 🔄 Troubleshooting

### Common Issues:

1. **Service won't start**:

   ```bash
   docker-compose logs service-name
   ```

2. **Database connection issues**:

   ```bash
   docker exec -it social_media_mongodb mongo
   ```

3. **Port conflicts**:

   ```bash
   sudo netstat -tulpn | grep :80
   ```

4. **Rebuild images**:
   ```bash
   docker-compose build --no-cache
   ```

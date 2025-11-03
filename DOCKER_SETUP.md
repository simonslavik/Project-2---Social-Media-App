# Docker Setup Guide

This project provides two Docker configurations to accommodate different development needs:

## Option 1: Complete Local Development (Recommended)

**File:** `docker-compose.yml`

**Includes:**

- Redis (local container)
- MongoDB (local container)
- API Gateway (local container)
- Identity Service (local container)

**Advantages:**

- ✅ Works completely offline
- ✅ No external dependencies
- ✅ Easy for team collaboration
- ✅ Consistent across all environments
- ✅ No API key management needed
- ✅ Fast database access (no internet latency)

**Usage:**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs

# Stop all services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

**Database Access:**

- **MongoDB:** `mongodb://admin:password123@localhost:27017/social_media?authSource=admin`
- **Redis:** `redis://localhost:6379`

## Option 2: MongoDB Atlas (Cloud Database)

**File:** `docker-compose.atlas.yml`

**Includes:**

- Redis (local container)
- API Gateway (local container)
- Identity Service (local container)
- MongoDB (MongoDB Atlas cloud)

**Advantages:**

- ✅ Persistent data across container rebuilds
- ✅ Professional database management
- ✅ Automatic backups and scaling

**Disadvantages:**

- ❌ Requires internet connection
- ❌ Team needs access to same Atlas cluster
- ❌ API key management required

**Usage:**

```bash
# Start with Atlas configuration
docker-compose -f docker-compose.atlas.yml up -d

# Update your MongoDB URI in the file
# Replace the MONGODB_URI with your Atlas connection string
```

## Environment Variables

The Docker containers use these environment variables:

```env
# MongoDB (local setup)
MONGODB_URI=mongodb://admin:password123@mongodb:27017/social_media?authSource=admin

# MongoDB (Atlas setup)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE

# Redis
REDIS_URL=redis://redis:6379

# Services
IDENTITY_SERVICE_URL=http://identity-service:3001
JWT_SECRET=your_jwt_secret_key_docker_env
PORT=3001 # for identity-service
PORT=3000 # for api-gateway
```

## API Endpoints

Once running, these endpoints are available:

- `POST http://localhost:3000/v1/auth/register` - User registration
- `POST http://localhost:3000/v1/auth/login` - User login
- `POST http://localhost:3000/v1/auth/refresh-token` - Token refresh
- `POST http://localhost:3000/v1/auth/logout` - User logout

## Team Collaboration Recommendation

**For team development, use the local MongoDB setup (`docker-compose.yml`):**

1. All developers get identical environments
2. No API key sharing required
3. Works offline
4. Fast and reliable
5. Easy to reset/clean database

Each developer just needs to run:

```bash
git clone <repo>
cd <repo>
docker-compose up -d
```

## Switching Between Configurations

```bash
# Use local MongoDB (recommended for development)
docker-compose up -d

# Use MongoDB Atlas (for production-like testing)
docker-compose -f docker-compose.atlas.yml up -d
```

## Troubleshooting

**MongoDB Connection Issues:**

```bash
# Check if MongoDB container is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Reset database
docker-compose down -v && docker-compose up -d
```

**Redis Connection Issues:**

```bash
# Check Redis logs
docker-compose logs redis

# Test Redis connection
docker exec -it social_media_redis redis-cli ping
```

**Service Communication Issues:**

```bash
# Check all container logs
docker-compose logs

# Restart specific service
docker-compose restart identity-service
```

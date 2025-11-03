# Database Management for Developers

As a developer working on this project, you need ways to inspect the database to see registered users, debug issues, and understand the data structure.

## 🗄️ Quick Database Inspection

### Method 1: Database Management Script (Recommended)

We've created a convenient script for common database operations:

```bash
# Show all registered users
./scripts/db-manager.sh users

# Show database statistics
./scripts/db-manager.sh stats

# Show active refresh tokens
./scripts/db-manager.sh tokens

# Clear all data (WARNING: destructive)
./scripts/db-manager.sh clear
```

**Example Output:**

```
📋 All Registered Users:
ID: 6908ab942de894209d7f1be3 | Username: localuser | Email: local@example.com | Created: Mon Nov 03 2025 13:18:12 GMT+0000 (Coordinated Universal Time)

Total Users: 1
```

### Method 2: Direct MongoDB Commands

```bash
# Connect to MongoDB container
docker exec -it social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin

# Then run these commands:
use social_media
db.users.find().pretty()                    # Show all users
db.users.countDocuments()                   # Count users
db.refreshtokens.find().pretty()            # Show refresh tokens
show collections                             # List all collections
```

### Method 3: One-liner Commands

```bash
# Quick user count
docker exec social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin social_media --eval "db.users.countDocuments()"

# Show all users (formatted)
docker exec social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin social_media --eval "db.users.find({}, {username: 1, email: 1, createdAt: 1}).pretty()"

# Show latest 5 users
docker exec social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin social_media --eval "db.users.find({}, {username: 1, email: 1, createdAt: 1}).sort({createdAt: -1}).limit(5).pretty()"
```

## 🎯 Common Development Scenarios

### Scenario 1: "How many users are registered?"

```bash
./scripts/db-manager.sh stats
```

### Scenario 2: "Show me all user accounts"

```bash
./scripts/db-manager.sh users
```

### Scenario 3: "I need to reset the database for testing"

```bash
./scripts/db-manager.sh clear
```

### Scenario 4: "Check if a specific user exists"

```bash
docker exec social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin social_media --eval "db.users.findOne({email: 'test@example.com'})"
```

### Scenario 5: "What's the database structure?"

```bash
docker exec social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin social_media --eval "
print('Collections:');
db.getCollectionNames().forEach(collection => {
  print('\\n=== ' + collection + ' ===');
  print('Sample document:');
  printjson(db[collection].findOne());
  print('Document count: ' + db[collection].countDocuments());
});
"
```

## 🔍 GUI Options

### Option 1: MongoDB Compass (Recommended)

1. Install: `brew install --cask mongodb-compass`
2. Connect to: `mongodb://admin:password123@localhost:27017/social_media?authSource=admin`
3. Browse collections visually

### Option 2: Docker Desktop

1. Open Docker Desktop
2. Go to Containers → `social_media_mongodb`
3. Limited view of files/logs (not actual data)

### Option 3: VS Code Extensions

- **MongoDB for VS Code**: Connect and query directly from VS Code
- **Database Client**: Multi-database support including MongoDB

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId("..."),
  username: "string",
  email: "string",
  password: "hashed_string",
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### RefreshTokens Collection

```javascript
{
  _id: ObjectId("..."),
  token: "string",
  user: ObjectId("..."), // References users._id
  expiresAt: ISODate("..."),
  createdAt: ISODate("...")
}
```

## 🚀 Pro Tips

1. **Regular Monitoring**: Use `./scripts/db-manager.sh stats` regularly
2. **Clean Testing**: Use `./scripts/db-manager.sh clear` between test runs
3. **User Lookup**: Search by email or username for debugging
4. **Token Management**: Monitor active refresh tokens for security
5. **Performance**: Use `.explain()` for query optimization

## 🔧 Troubleshooting

**Can't connect to MongoDB?**

```bash
# Check if container is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Restart if needed
docker-compose restart mongodb
```

**Script not working?**

```bash
# Make sure it's executable
chmod +x ./scripts/db-manager.sh

# Check Docker containers
docker-compose ps
```

**Want to backup data?**

```bash
# Export users
docker exec social_media_mongodb mongodump --username admin --password password123 --authenticationDatabase admin --db social_media --collection users

# Import users (if needed)
docker exec social_media_mongodb mongorestore --username admin --password password123 --authenticationDatabase admin
```

This setup gives you complete visibility into your user data while maintaining a professional development workflow!

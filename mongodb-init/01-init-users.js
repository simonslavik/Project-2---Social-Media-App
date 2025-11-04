// MongoDB initialization script
// This script runs when MongoDB starts for the first time

// Switch to admin database to create users
db = db.getSiblingDB('admin');

// Create root user (should already exist, but ensuring it's there)
try {
  db.createUser({
    user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
    roles: [
      { role: 'userAdminAnyDatabase', db: 'admin' },
      { role: 'readWriteAnyDatabase', db: 'admin' },
      { role: 'dbAdminAnyDatabase', db: 'admin' }
    ]
  });
  print('Root user created successfully');
} catch (e) {
  print('Root user already exists or error occurred: ' + e);
}

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'social_media');

// Create application user for the social media database
try {
  db.createUser({
    user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD,
    roles: [
      { role: 'readWrite', db: process.env.MONGO_INITDB_DATABASE || 'social_media' },
      { role: 'dbAdmin', db: process.env.MONGO_INITDB_DATABASE || 'social_media' }
    ]
  });
  print('Application user created successfully for database: ' + (process.env.MONGO_INITDB_DATABASE || 'social_media'));
} catch (e) {
  print('Application user already exists or error occurred: ' + e);
}

// Create initial collections
db.createCollection('users');
db.createCollection('refresh_tokens');
db.createCollection('posts');

print('MongoDB initialization completed');
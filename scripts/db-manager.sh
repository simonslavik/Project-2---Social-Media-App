#!/bin/bash
# MongoDB Database Management Script for Developers

echo "🗄️  MongoDB Database Management"
echo "================================="

function show_users() {
    echo "📋 All Registered Users:"
    docker exec social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin social_media --eval "
    db.users.find({}, {username: 1, email: 1, createdAt: 1}).forEach(function(user) {
        print('ID: ' + user._id + ' | Username: ' + user.username + ' | Email: ' + user.email + ' | Created: ' + user.createdAt);
    });
    print('\\nTotal Users: ' + db.users.countDocuments());
    "
}

function show_refresh_tokens() {
    echo "🔑 Active Refresh Tokens:"
    docker exec social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin social_media --eval "
    db.refreshtokens.find({}, {user: 1, expiresAt: 1, createdAt: 1}).forEach(function(token) {
        print('User ID: ' + token.user + ' | Expires: ' + token.expiresAt + ' | Created: ' + token.createdAt);
    });
    print('\\nTotal Active Tokens: ' + db.refreshtokens.countDocuments());
    "
}

function clear_all_users() {
    echo "⚠️  WARNING: This will delete ALL users and tokens!"
    read -p "Are you sure? (yes/no): " confirm
    if [[ $confirm == "yes" ]]; then
        docker exec social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin social_media --eval "
        db.users.deleteMany({});
        db.refreshtokens.deleteMany({});
        print('✅ All users and tokens deleted');
        "
    else
        echo "❌ Operation cancelled"
    fi
}

function show_database_stats() {
    echo "📊 Database Statistics:"
    docker exec social_media_mongodb mongosh --username admin --password password123 --authenticationDatabase admin social_media --eval "
    print('Database: social_media');
    print('Collections:');
    db.getCollectionNames().forEach(function(name) {
        print('  - ' + name + ': ' + db[name].countDocuments() + ' documents');
    });
    "
}

case "$1" in
    "users")
        show_users
        ;;
    "tokens")
        show_refresh_tokens
        ;;
    "stats")
        show_database_stats
        ;;
    "clear")
        clear_all_users
        ;;
    *)
        echo "Usage: $0 {users|tokens|stats|clear}"
        echo ""
        echo "Commands:"
        echo "  users  - Show all registered users"
        echo "  tokens - Show all active refresh tokens"
        echo "  stats  - Show database statistics"
        echo "  clear  - Clear all users and tokens (WARNING: destructive)"
        echo ""
        echo "Examples:"
        echo "  $0 users"
        echo "  $0 stats"
        ;;
esac
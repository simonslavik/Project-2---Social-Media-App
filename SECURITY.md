# 🔐 Security Setup Guide

## ⚠️ IMPORTANT: Environment Variables Security

### 🚨 **If credentials are already on GitHub:**

1. **IMMEDIATELY** change all passwords:
   - MongoDB Atlas password
   - RabbitMQ credentials  
   - JWT secrets
   - Cloudinary API keys

2. **Remove sensitive commits from GitHub:**
   ```bash
   # Remove .env files from git history
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env*' \
   --prune-empty --tag-name-filter cat -- --all
   
   # Force push to rewrite history
   git push origin --force --all
   ```

### ✅ **Secure Setup Process:**

1. **Copy example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your real credentials in .env:**
   - Use strong, unique passwords
   - Generate secure JWT secrets (32+ characters)
   - Use production MongoDB Atlas URI for production

3. **Verify .env is ignored:**
   ```bash
   git status  # Should NOT show .env files
   ```

4. **Production deployment:**
   - Use environment variables in hosting platform
   - Never use .env files in production
   - Use secrets management services

### 🔧 **Generate Secure Credentials:**

```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate strong password
openssl rand -base64 32
```

### 📋 **Environment Variables Checklist:**

- [ ] .env files are in .gitignore
- [ ] Real credentials are not in code
- [ ] Strong passwords are used
- [ ] JWT secrets are 32+ characters
- [ ] Production uses different credentials
- [ ] Team members have their own .env files
- [ ] No credentials in docker-compose.yml

### 🚫 **Never Do This:**
- Commit .env files to Git
- Put credentials directly in code
- Share .env files via email/chat
- Use weak passwords
- Use same credentials for dev/prod
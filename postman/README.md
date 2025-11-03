# Postman API Testing Collection

This directory contains comprehensive Postman collections and environments for testing the Social Media Microservices API.

## Files Included

### Collections

- `Social-Media-Microservices.postman_collection.json` - Complete API test collection

### Environments

- `Local-Development.postman_environment.json` - Local development environment (Docker)
- `Production.postman_environment.json` - Production environment template

## Import Instructions

### 1. Import Collection

1. Open Postman
2. Click "Import" button
3. Select `Social-Media-Microservices.postman_collection.json`
4. Click "Import"

### 2. Import Environment

1. In Postman, click the gear icon (⚙️) in top right
2. Click "Import"
3. Select `Local-Development.postman_environment.json`
4. Repeat for `Production.postman_environment.json` if needed
5. Select the appropriate environment from the dropdown

## Collection Structure

### Identity Service Endpoints

- **User Registration** - `POST /v1/auth/register`
- **User Login** - `POST /v1/auth/login`
- **Refresh Token** - `POST /v1/auth/refresh-token`
- **User Logout** - `POST /v1/auth/logout`

### Error Scenarios

- **Duplicate User Registration** - Tests validation errors
- **Invalid Login Credentials** - Tests authentication failures
- **Rate Limit Test** - Tests API rate limiting (100 req/15min)

### Health Checks

- **API Gateway Health** - Basic connectivity test

## Testing Workflow

### Recommended Test Sequence

1. **Start Your Services**

   ```bash
   docker-compose up
   ```

2. **Run Tests in Order:**

   - User Registration (creates test user + stores tokens)
   - User Login (validates login + updates tokens)
   - Refresh Token (tests token refresh mechanism)
   - User Logout (cleans up tokens)

3. **Error Testing:**
   - Try registering duplicate user
   - Try invalid login credentials
   - Test rate limiting (run login request 100+ times)

### Automated Testing Features

#### Token Management

- Tokens are automatically stored after successful registration/login
- Tokens are automatically used in subsequent requests
- Tokens are cleared after logout

#### Test Assertions

- Status code validation
- Response structure validation
- Success/error message validation
- Response time validation (< 5 seconds)

#### Random Data Generation

- Uses `{{$randomInt}}` for unique usernames/emails
- Prevents duplicate user conflicts during testing

## Environment Variables

### Local Development

- `baseURL`: `http://localhost:3000` (API Gateway)
- `identityServiceURL`: `http://localhost:3001` (Direct service access)
- `userEmail`: Default test user email
- `userPassword`: Default test user password

### Production

- Update `baseURL` to your production API Gateway URL
- Update credentials for production testing

## Advanced Usage

### Running Collection via CLI

Install Newman (Postman CLI):

```bash
npm install -g newman
```

Run collection:

```bash
newman run Social-Media-Microservices.postman_collection.json \
  -e Local-Development.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export test-results.html
```

### Continuous Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: API Tests
  run: |
    npm install -g newman
    newman run postman/Social-Media-Microservices.postman_collection.json \
      -e postman/Local-Development.postman_environment.json \
      --reporters junit \
      --reporter-junit-export test-results.xml
```

## Troubleshooting

### Common Issues

1. **Connection Refused (ECONNREFUSED)**

   - Ensure Docker containers are running: `docker-compose ps`
   - Check service logs: `docker-compose logs api-gateway identity-service`

2. **Rate Limit Errors**

   - Expected after 100 requests in 15 minutes
   - Wait 15 minutes or restart Redis: `docker-compose restart redis`

3. **Invalid Tokens**

   - Tokens expire after 1 hour (configurable)
   - Use refresh token endpoint or re-login

4. **Database Connection Issues**
   - Check MongoDB container: `docker-compose logs mongodb`
   - Verify environment variables in docker-compose.yml

### Service Status Check

```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs api-gateway
docker-compose logs identity-service
docker-compose logs mongodb
docker-compose logs redis
```

## Customization

### Adding New Requests

1. Create new request in Postman
2. Add to appropriate folder (Identity Service, Error Scenarios, etc.)
3. Add test scripts for validation
4. Export updated collection

### Environment Variables

Add new variables in environment files:

```json
{
  "key": "newVariable",
  "value": "defaultValue",
  "type": "default",
  "enabled": true
}
```

### Test Scripts

Add custom validation in the "Tests" tab:

```javascript
pm.test("Custom validation", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.customField).to.exist;
});
```

## Security Notes

- Never commit production credentials to version control
- Use Postman Vault or environment variables for sensitive data
- Rotate test credentials regularly
- Use different credentials for different environments

## Support

For issues related to:

- **API endpoints**: Check service logs and documentation
- **Postman usage**: Refer to [Postman Documentation](https://learning.postman.com/)
- **Docker services**: Check `docker-compose.yml` and service configurations

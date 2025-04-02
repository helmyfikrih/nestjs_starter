# NestJS Starter Kit

A comprehensive, production-ready starter kit for NestJS applications with built-in authentication, enhanced security, database integration, and industry best practices.

## Features

- **Advanced Authentication**
  - JWT-based authentication with refresh tokens
  - Two-factor authentication (2FA) with encrypted secrets
  - API key authentication
  
- **Security Enhancements**
  - AES-256-CBC encryption for sensitive data
  - Secure password handling with bcrypt
  - Protection against common web vulnerabilities
  - Rate limiting and throttling
  
- **Authorization**
  - Role-based access control
  - Public/private route decorators
  
- **Database Integration**
  - TypeORM with PostgreSQL
  - Entity inheritance with BaseEntity
  - Efficient pagination
  
- **API Documentation**
  - Swagger/OpenAPI with rich metadata
  - Detailed endpoint descriptions
  - Authentication examples
  
- **Environment Configuration**
  - Environment-specific configurations
  - Strong validation with Joi
  - Sensible defaults
  
- **Request Validation**
  - Comprehensive DTO validation with class-validator
  - Detailed error messages
  - Request transformation
  
- **Error Handling**
  - Global exception filters
  - Standardized error responses
  - JWT-specific error handling
  
- **Developer Experience**
  - Hot module replacement
  - Well-organized project structure
  - Extensive documentation

## Security Features

### Encrypted 2FA Secrets

This starter kit implements industry-standard encryption for 2FA secrets, addressing a common security vulnerability. Features include:

- **AES-256-CBC Encryption**: Military-grade encryption for 2FA secrets
- **Unique Initialization Vectors**: Each secret gets a unique IV for enhanced security
- **Transparent Encryption/Decryption**: Handled automatically by the system
- **Error Handling**: Robust error handling for cryptographic operations

### Enhanced Authentication

- Multiple authentication strategies (JWT, API Key)
- Automatic token refresh mechanism
- Configurable token expiration
- Protection against common authentication attacks

### Data Protection

- All sensitive data is properly encrypted or hashed
- Passwords are hashed using bcrypt with proper salt rounds
- Personal information is protected according to best practices

## Prerequisites

- Node.js (>=14.x)
- PostgreSQL
- npm or yarn

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nest-starter-kit.git
   cd nest-starter-kit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.development`:
     ```bash
     cp .env.example .env.development
     ```
   - Update the values in `.env.development` with your configuration
   - **Important**: Replace all placeholder secrets with strong, unique values

4. Run database migrations:
   ```bash
   npm run migration:run
   ```
   This will create the initial database schema with a `users` table for authentication.

5. Start the development server:
   ```bash
   npm run start:dev
   ```

6. Access the API documentation at: `http://localhost:3000/api/docs`

## Project Structure

```
src/
├── app/                  # Application core
│   ├── common/           # Common utilities and helpers
│   │   ├── decorators/   # Custom decorators
│   │   ├── docs/         # API documentation
│   │   ├── entities/     # Base entities
│   │   ├── dto/          # Common DTOs
│   │   ├── services/     # Common services like encryption
│   │   └── exception/    # Exception filters
│   └── modules/          # Feature modules
│       ├── auth/         # Authentication module
│       ├── user/         # User management module
│       └── shared/       # Shared services and utilities
├── config/               # Configuration settings
├── database/             # Database setup and migrations
└── main.ts               # Application entry point
```

## Authentication Flow

The starter kit provides several authentication methods:

1. **JWT Authentication**
   - Login with email/password to receive JWT token
   - Use token for subsequent authenticated requests
   - Automatic handling of token expiration and refresh

2. **Two-Factor Authentication (2FA)**
   - Enable 2FA for enhanced security
   - 2FA secrets are securely encrypted in the database
   - TOTP-based verification (compatible with apps like Google Authenticator)

3. **API Key Authentication**
   - Alternative authentication for service-to-service communication
   - Unique per-user API keys with fine-grained permissions

## Customizing the Starter Kit

### Adding a New Module

1. Create a new directory in `src/app/modules/`
2. Create the necessary files (module, controller, service, entity, etc.)
3. Import the new module in `app.module.ts`

### Database Migrations

Generate a new migration:
```bash
npm run migration:generate -- -n MigrationName
```

Run migrations:
```bash
npm run migration:run
```

Revert the latest migration:
```bash
npm run migration:revert
```

## Security Best Practices

This starter kit follows these security best practices:

1. **No Sensitive Data in Plain Text**: All sensitive data is encrypted or hashed
2. **Properly Configured JWT**: Secure signing, appropriate expiration
3. **Rate Limiting**: Protection against brute force attacks
4. **Input Validation**: All input is validated before processing
5. **Content Security**: Headers are properly set for security
6. **Error Handling**: No sensitive information in error messages
7. **Database Security**: Parameterized queries to prevent SQL injection

## Production Deployment

Before deploying to production:

1. Create a `.env.production` file with secure settings
2. Generate strong, unique secrets for JWT and encryption
3. Set appropriate rate limiting and security settings
4. Disable Swagger in production (`SWAGGER_ENABLED=false`)
5. Set up proper SSL/TLS for all communications

Build the application:
```bash
npm run build
```

Start in production mode:
```bash
npm run start:prod
```

## Testing

Run unit tests:
```bash
npm run test
```

Run end-to-end tests:
```bash
npm run test:e2e
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

**Nest.js Starter Kit** - Created by [Karimov Farda](https://github.com/latreon)
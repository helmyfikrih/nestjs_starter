# NestJS Secure Starter Kit - Setup Guide

This guide will walk you through setting up and running the NestJS Secure Starter Kit.

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- PostgreSQL database (optional - can run without database)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root of the project based on `.env.example`:

```bash
# Application
NODE_ENV=development
PORT=3000
DATABASE_ENABLED=false  # Set to true if you want to use a database

# Database Configuration (required only if DATABASE_ENABLED=true)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=nest_starter

# JWT Configuration
JWT_SECRET=your_secret_key
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRATION=7d

# Throttling
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Swagger
SWAGGER_ENABLED=true
```

### 3. Running Without a Database

You can run the application without a database by setting:

```
DATABASE_ENABLED=false
```

In this mode, the application will use in-memory data with a mock user:
- Email: demo@example.com
- Password: password
- API Key: demo-api-key

This is useful for quick testing and development. Note that in this mode, most write operations (create/update/delete) will be disabled.

### 4. Running With a Database (Optional)

If you want to use a database:

1. Set `DATABASE_ENABLED=true` in your `.env` file

2. Create a PostgreSQL database with the name specified in your `.env` file:

```bash
psql -U postgres
CREATE DATABASE nest_starter;
\q
```

3. Run database migrations:

```bash
npm run migration:run
```

### 5. Build and Run the Application

For development:
```bash
npm run start:dev
```

For production:
```bash
npm run build
npm run start:prod
```

### 6. Access the API Documentation

When running in development mode, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## API Endpoints

### Authentication Endpoints

The starter kit includes the following authentication endpoints:

| Method | Endpoint             | Description                     | Protected |
|--------|----------------------|---------------------------------|-----------|
| POST   | /auth/login          | User login                      | No        |
| POST   | /auth/logout         | Logout user                     | Yes       |
| POST   | /auth/refresh        | Refresh access token            | No        |
| GET    | /auth/env            | Get authentication environment  | No        |
| POST   | /auth/2fa/enable     | Enable two-factor authentication| Yes       |
| POST   | /auth/2fa/validate   | Validate 2FA code               | Yes       |

### User Endpoints

The starter kit includes the following user management endpoints:

| Method | Endpoint             | Description                     | Protected |
|--------|----------------------|---------------------------------|-----------|
| POST   | /users               | Create a new user               | Yes       |
| GET    | /users               | Get all users                   | Yes       |
| GET    | /users/{id}          | Get user by ID                  | Yes       |
| PUT    | /users/{id}          | Update user                     | Yes       |
| DELETE | /users/{id}          | Delete user                     | Yes       |
| GET    | /users/profile       | Get current user profile        | Yes       |
| PUT    | /users/profile       | Update current user profile     | Yes       |

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify your database credentials in the `.env` file
- Make sure the specified database exists
- Consider setting `DATABASE_ENABLED=false` to run without a database

### Authentication Issues

- Check that JWT secrets are properly set in the `.env` file
- Verify user credentials when making API calls

## Additional Commands

- **Run tests**: `npm run test`
- **Run e2e tests**: `npm run test:e2e`
- **Generate migrations**: `npm run migration:generate -- -n MigrationName`
- **Revert migrations**: `npm run migration:revert` 
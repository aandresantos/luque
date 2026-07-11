# Spec: Auth Module

## Goal

Implement authentication and session management for Luque.

The Auth module is responsible for verifying user credentials, issuing access tokens, managing refresh sessions, and revoking authenticated sessions.

Authentication credentials must remain separate from the `User` domain model.

## Context

A `User` represents a person registered inside Luque.

The Auth module represents how that person proves their identity and accesses the platform.

For the initial version, Luque will support authentication through email and password.

The registration flow must create:

1. A `User`
2. A password credential associated with that User

Both operations must succeed or fail together.

## Acceptance Criteria

* [ ] A person can register using name, email, password, and User type
* [ ] Registration creates both User and AuthCredential atomically
* [ ] A registered User can authenticate with email and password
* [ ] Successful authentication returns an access token and a refresh token
* [ ] An authenticated User can renew their access token
* [ ] A User can terminate their current session
* [ ] Passwords are never stored in plain text
* [ ] Password hashes are never returned by the API
* [ ] Refresh tokens are not stored in plain text
* [ ] A deactivated User cannot authenticate
* [ ] Invalid credentials return a generic authentication error
* [ ] A revoked or expired refresh session cannot issue new tokens

## Data Shapes

### AuthCredential

Represents a password credential associated with a User.

```typescript
AuthCredential {
  id: uuid (PK)
  userId: uuid (FK → users.id)
  provider: 'PASSWORD'
  passwordHash: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### AuthSession

Represents a renewable authenticated session.

```typescript
AuthSession {
  id: uuid (PK)
  userId: uuid (FK → users.id)
  refreshTokenHash: string
  expiresAt: timestamp
  revokedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

| Method | Path           | Description                         |
| ------ | -------------- | ----------------------------------- |
| POST   | /auth/register | Create User and password credential |
| POST   | /auth/login    | Authenticate and create session     |
| POST   | /auth/refresh  | Renew authenticated tokens          |
| POST   | /auth/logout   | Revoke current session              |
| GET    | /auth/me       | Return current authenticated User   |

## Request Shapes

### Register

```typescript
RegisterRequest {
  name: string
  email: string
  password: string
  type: 'CANDIDATE' | 'COMPANY_USER'
}
```

### Login

```typescript
LoginRequest {
  email: string
  password: string
}
```

### Refresh

```typescript
RefreshTokenRequest {
  refreshToken: string
}
```

## Response Shapes

### Authentication Response

```typescript
AuthenticationResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: uuid
    name: string
    email: string
    type: 'CANDIDATE' | 'COMPANY_USER'
    status: 'ACTIVE' | 'DEACTIVATED'
  }
}
```

## Business Rules

### Registration

* Email must be unique across the platform.
* Email must be normalized before persistence.
* Password must satisfy the minimum security requirements.
* Registration must create the User and AuthCredential inside the same database transaction.
* If User creation succeeds but credential creation fails, the entire operation must be rolled back.
* User status defaults to `ACTIVE`.
* User type must be provided during registration.
* Authentication credentials must not be stored in the `users` table.

### Credentials

* Passwords must never be stored in plain text.
* Passwords must be hashed using an appropriate password-hashing algorithm.
* AuthCredential must reference an existing User.
* A User may have only one password credential in the initial version.
* Password hashes must never appear in logs, API responses, errors, or events.

### Login

* Login requires a valid email and password.
* Authentication must fail when:

  * The email does not exist.
  * The password is incorrect.
  * The User is deactivated.
* Authentication errors must not reveal whether the email or password was incorrect.
* Successful login creates a new AuthSession.
* Successful login issues:

  * A short-lived access token.
  * A longer-lived refresh token.

### Access Token

* Access tokens must have a short expiration time.
* The access token must identify the authenticated User.
* The token payload should contain only the minimum required claims.

Example:

```typescript
AccessTokenPayload {
  sub: userId
  type: 'CANDIDATE' | 'COMPANY_USER'
  sessionId: uuid
}
```

* Company-specific roles must not be stored permanently inside the access token.
* Company roles must be resolved through `CompanyMembership` for the active Company context.

### Refresh Token

* Refresh tokens must have a longer expiration time than access tokens.
* Refresh tokens must be associated with an AuthSession.
* Refresh tokens must not be stored in plain text in the database.
* Refreshing a session must validate:

  * The refresh token.
  * The corresponding AuthSession.
  * Session expiration.
  * Session revocation status.
  * Current User status.
* An expired, revoked, or invalid refresh token must not generate a new access token.

### Logout

* Logout revokes the current AuthSession.
* Revoking a session does not delete the User or AuthCredential.
* A revoked session cannot be refreshed.
* Existing access tokens may remain valid until expiration unless a centralized revocation mechanism is introduced later.

### User Deactivation

* A deactivated User cannot log in.
* A deactivated User cannot refresh an existing session.
* Existing refresh sessions should be revoked when the User is deactivated.
* User data and historical records are not physically deleted.

## Module Interactions

### User Module

Auth depends on User to:

* Create a User during registration.
* Find a User by normalized email.
* Verify the current User status.
* Return basic authenticated User information.

Auth must not update User business data directly outside of the registration workflow.

### CompanyMembership Module

Auth does not define Company roles.

After authentication, Company-specific roles must be loaded through CompanyMembership using:

```text
userId + companyId
```

The same `COMPANY_USER` may have different roles in different Companies.

## Transaction Rules

The registration workflow must be atomic:

```text
BEGIN

Create User

Create AuthCredential

COMMIT
```

If either operation fails:

```text
ROLLBACK
```

Session creation during login should contain only the required credential verification and AuthSession persistence.

External calls, notifications, analytics, and emails must not run inside authentication transactions.

## Security Requirements

* Authentication endpoints must use HTTPS in production.
* Login and refresh endpoints should be protected by rate limiting.
* Sensitive tokens and credentials must not be logged.
* Authentication errors should use generic messages.
* Password comparison must use the password-hashing library's secure verification function.
* Refresh tokens should preferably be delivered through secure, `HttpOnly` cookies in the web application.
* Production cookies should use:

  * `HttpOnly`
  * `Secure`
  * an appropriate `SameSite` policy

## Suggested Initial Token Strategy

* Access token:

  * JWT
  * Short-lived
  * Returned to the client
* Refresh token:

  * Random opaque token
  * Stored as a hash in AuthSession
  * Sent through an `HttpOnly` cookie

This keeps authorization requests fast while allowing sessions to be revoked through the database.

## Out of Scope for This Spec

* Email verification
* Password reset
* Password change
* OAuth providers
* Social login
* Multi-factor authentication
* Magic links
* Device management
* Suspicious login detection
* Global logout from all devices
* Account recovery
* Custom token revocation infrastructure
* Authorization and Company permission checks


Recommended Technical Stack

The following libraries are recommended for the initial implementation of the Auth module.

These choices aim to keep the implementation simple, secure, and aligned with the current architecture.

Password Hashing

Package

argon2

Responsibilities:

Hash user passwords.
Verify password hashes.
Never store passwords in plain text.
JWT Authentication

Package

@fastify/jwt

Responsibilities:

Generate access tokens.
Verify authenticated requests.
Store only the minimum required claims.

Suggested payload:

{
  sub: userId,
  type: userType,
  sessionId: authSessionId
}
Cookie Management

Package

@fastify/cookie

Responsibilities:

Store Refresh Tokens as HttpOnly cookies.
Configure Secure and SameSite attributes.

Refresh Tokens should never be stored in Local Storage.

Rate Limiting

Package

@fastify/rate-limit

Protect endpoints such as:

POST /auth/login
POST /auth/register
POST /auth/refresh

The goal is to reduce brute-force attacks.

Security Headers

Package

@fastify/helmet

Responsibilities:

Configure secure HTTP headers.
Apply common browser security protections.
Cross-Origin Requests

Package

@fastify/cors

Responsibilities:

Configure frontend access.
Allow credentials when using HttpOnly cookies.
Restrict allowed origins in production.
Token Generation

Use the native Node.js Crypto API.

import { randomBytes, createHash } from 'node:crypto'

Responsibilities:

Generate secure Refresh Tokens.
Hash Refresh Tokens before persisting them.

Refresh Tokens should never be stored in plain text.

Persistence

Current persistence layer:

PostgreSQL
Drizzle ORM

The Auth module persists:

AuthCredential
AuthSession

No additional session libraries are required.

Validation

Use the same validation strategy adopted by the rest of the project.

Recommended options:

TypeBox (preferred if already used)
Zod (if already adopted by the project)

Avoid duplicating validation logic across multiple schemas.

Initial Project Dependencies
@fastify/jwt
@fastify/cookie
@fastify/rate-limit
@fastify/helmet
@fastify/cors
argon2

Node.js built-in modules:

node:crypto

Persistence:

PostgreSQL
Drizzle ORM
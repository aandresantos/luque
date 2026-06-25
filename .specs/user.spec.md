# Spec: User Module

## Goal

Implement basic user account management for `User` — the person registered inside Luque.

A User represents the identity of a person within the platform. It does not store authentication credentials directly.

Authentication data such as password hashes, login providers, sessions, and refresh tokens belong to the Auth module.

## Context

Users can interact with Luque in one of two platform contexts:

- **Candidate** — users looking for job opportunities.
- **Company User** — users acting on behalf of one or more Companies.

A Company User may belong to multiple Companies through `CompanyMembership`, where they receive a Company-specific role such as Recruiter, Recruiter Manager, or Admin.

A Candidate cannot belong to a Company.

The User module is responsible only for account identity and lifecycle.

## Acceptance Criteria

- [ ] A User can be created
- [ ] A User can fetch their own account information
- [ ] A User can update basic account information
- [ ] A User can be deactivated without being physically deleted
- [ ] Email must be unique
- [ ] A User type must be defined on creation
- [ ] Deactivated Users cannot access the platform
- [ ] User records are never physically deleted
- [ ] User does not store authentication credentials

## Data Shape

```typescript
User {
  id: uuid (PK)
  name: string (min 1, max 120)
  email: string (unique)
  type: 'CANDIDATE' | 'COMPANY_USER'
  status: 'ACTIVE' | 'DEACTIVATED'
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

| Method | Path                 | Description              |
| ------ | -------------------- | ------------------------ |
| GET    | /users/me            | Get current user account |
| POST   | /users               | Create a new user        |
| PUT    | /users/me            | Update current user      |
| PATCH  | /users/me/deactivate | Deactivate current user  |

## Business Rules

- `status` defaults to `ACTIVE` on creation.
- User `type` must be defined during account creation.
- User name must be between 1 and 120 characters.
- Email must be unique.
- Email must be valid.
- A deactivated User cannot access the platform.
- User records are never physically deleted.
- Deactivating a User does not delete related CandidateProfile, CompanyMembership, CandidatePositionHistory, messages, or audit records.
- A `CANDIDATE` User cannot belong to a Company.
- A `COMPANY_USER` may belong to one or more Companies through `CompanyMembership`.
- Company roles (`RECRUITER`, `RECRUITER_MANAGER`, `ADMIN`) are managed by the `CompanyMembership` module.
- Passwords, credentials, sessions, refresh tokens, OAuth providers, and login flows are handled exclusively by the Auth module.

## Out of Scope for This Spec

- Password management
- Login/session management
- Password reset
- Email verification
- OAuth / Social login
- Multi-factor authentication
- CandidateProfile management
- CompanyMembership management
- Authorization / Permission checks

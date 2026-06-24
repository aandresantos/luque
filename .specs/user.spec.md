# Spec: User Module

## Goal

Implement basic user account management for `User` — the person registered inside Luque.

A User represents the identity of a person in the platform. It does not store authentication credentials directly.

Authentication data such as password hash, login provider, sessions, and refresh tokens belong to the Auth module.

## Context

Users can interact with Luque in different ways.

A User may create a Candidate Profile to become available for hiring opportunities.

A User may also belong to one or more Companies through CompanyMembership, where they can receive roles such as Recruiter, Recruiter Manager, or Admin.

The User module should focus only on account identity and basic account lifecycle.

## Acceptance Criteria

- [ ] A User can be created
- [ ] A User can fetch their own account information
- [ ] A User can update basic account information
- [ ] A User can be deactivated without being physically deleted
- [ ] Email must be unique
- [ ] Deactivated Users cannot use the platform
- [ ] User records are not physically deleted
- [ ] User does not store password or authentication credentials

## Data Shape

```typescript
User {
  id: uuid (PK)
  name: string (min 1, max 120)
  email: string (unique)
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
- User name must be between 1 and 120 characters.
- Email must be unique.
- Email must be valid.
- A deactivated User cannot access the platform.
- Deactivating a User does not delete related CandidateProfile, CompanyMembership, CandidatePositionHistory, messages, or audit records.
- User does not directly define whether someone is a Candidate, Recruiter, Recruiter Manager, or Admin.
  - Candidate behavior comes from CandidateProfile.
  - Company-related roles come from CompanyMembership.

- Passwords, credentials, sessions, refresh tokens, OAuth providers, and login flows are handled by the Auth module.

## Out of Scope for This Spec

- Password management
- Login/session management
- Password reset
- Email verification
- OAuth/social login
- Multi-factor authentication
- CandidateProfile management
- CompanyMembership management
- Authorization/permission checks

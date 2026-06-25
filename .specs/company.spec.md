# Spec: Company Module

## Goal

Implement CRUD operations for `Company` — the organization that owns users, teams, and hiring workflows inside the platform.

A Company acts as the main organizational boundary of the system.

## Context

A Company represents an organization using Luque to manage its recruiting process.

A Company may contain multiple users through `CompanyMembership`, multiple Teams, and each Team may own multiple Positions.

The Company itself does not execute recruiting actions. Actions are executed by Users through roles such as Recruiter, Recruiter Manager, or Admin.

## Acceptance Criteria

- [ ] A user can create a new Company
- [ ] A user can list Companies they belong to
- [ ] A user can fetch a single Company by ID
- [ ] A user can update Company information
- [ ] A user can archive a Company without deleting it
- [ ] Archived Companies are excluded from default listings unless explicitly requested
- [ ] A Company name must be provided
- [ ] A Company slug must be unique
- [ ] Creating a Company should also create an initial CompanyMembership for the creator as `ADMIN`

## Data Shape

```typescript
Company {
  id: uuid (PK)
  name: string (min 1, max 120)
  slug: string (unique)
  description: string | null
  logoUrl: string | null
  status: 'ACTIVE' | 'ARCHIVED'
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

| Method | Path                   | Description             |
| ------ | ---------------------- | ----------------------- |
| GET    | /companies             | List companies for user |
| GET    | /companies/:id         | Get a single company    |
| POST   | /companies             | Create a new company    |
| PUT    | /companies/:id         | Update company info     |
| PATCH  | /companies/:id/archive | Archive a company       |

## Business Rules

- `status` defaults to `ACTIVE` on creation.
- Company name must be between 1 and 120 characters.
- Company slug must be unique.
- Archived Companies cannot receive new Teams.
- Archiving a Company does not physically delete its Teams, Positions, Users, or historical data.
- `GET /companies` returns only ACTIVE companies by default.
  - Query param `?includeArchived=true` returns all.

- When a Company is created, the creator should become an `ADMIN` member of that Company.
- Creating a Company automatically creates the first CompanyMembership.
- The creator of the Company becomes the first active `ADMIN`.
- A Company itself does not perform actions; Users perform actions through CompanyMembership roles.

## Out of Scope for This Spec

- Team management
- Position management
- CompanyMembership management
- Authorization/permission checks
- Billing/subscription management
- Company invitations
- Pagination

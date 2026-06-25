# Spec: CompanyMembership Module

## Goal

Implement membership management for `CompanyMembership` — the relationship between a `User` and a `Company`.

A CompanyMembership represents the organizational relationship between a Company and a Company User.

It is responsible for defining:

- which users belong to a Company
- which role they have inside that Company
- the lifecycle of that membership

## Context

A User with type `COMPANY_USER` may belong to one or more Companies.

Inside each Company, a Company User receives a Company-specific role.

Supported roles:

- `ADMIN`
- `RECRUITER`
- `RECRUITER_MANAGER`

A User with type `CANDIDATE` cannot belong to a Company.

The first CompanyMembership created during Company creation automatically becomes the first active `ADMIN`.

## Acceptance Criteria

- [ ] A CompanyMembership can be created for a valid Company and User
- [ ] A Company can list all of its members
- [ ] A Company User can list all Companies they belong to
- [ ] A CompanyMembership can be fetched by ID
- [ ] A member role can be updated
- [ ] A CompanyMembership can be deactivated without being physically deleted
- [ ] Only Users with type `COMPANY_USER` can have CompanyMembership
- [ ] A User cannot have duplicate active memberships for the same Company
- [ ] A CompanyMembership must reference an existing Company
- [ ] A CompanyMembership must reference an existing User

## Data Shape

```typescript
CompanyMembership {
  id: uuid (PK)
  companyId: uuid (FK → companies.id)
  userId: uuid (FK → users.id)
  role: 'ADMIN' | 'RECRUITER' | 'RECRUITER_MANAGER'
  status: 'ACTIVE' | 'DEACTIVATED'
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

| Method | Path                                | Description                      |
| ------ | ----------------------------------- | -------------------------------- |
| GET    | /companies/:companyId/memberships   | List Company members             |
| GET    | /users/:userId/company-memberships  | List Companies a User belongs to |
| GET    | /company-memberships/:id            | Get a single CompanyMembership   |
| POST   | /companies/:companyId/memberships   | Create a CompanyMembership       |
| PATCH  | /company-memberships/:id/role       | Update member role               |
| PATCH  | /company-memberships/:id/deactivate | Deactivate a CompanyMembership   |

## Business Rules

### Membership

- `status` defaults to `ACTIVE` on creation.
- `role` must be one of:
  - `ADMIN`
  - `RECRUITER`
  - `RECRUITER_MANAGER`

- A CompanyMembership must reference an existing Company.
- A CompanyMembership must reference an existing User.
- Only Users with type `COMPANY_USER` can have CompanyMembership.
- Users with type `CANDIDATE` cannot belong to a Company.
- A User cannot have more than one active CompanyMembership for the same Company.
- A User may belong to multiple Companies.
- A User may have different roles in different Companies.

### Company Administration

- Creating a Company automatically creates its first CompanyMembership.
- The User who creates the Company automatically becomes its first active `ADMIN`.
- Every Company must always have at least one active `ADMIN`.
- The last active `ADMIN` of a Company cannot be deactivated.
- The last active `ADMIN` of a Company cannot have its role changed to another role until another active `ADMIN` exists.
- Only an `ADMIN` can:
  - Create CompanyMemberships.
  - Change another member's role.
  - Deactivate a CompanyMembership.

### Queries

- Deactivated CompanyMemberships are excluded from default listings.
- Query parameter `?includeDeactivated=true` returns all memberships.

## Out of Scope for This Spec

- User creation
- Company creation
- Authentication
- Authorization implementation
- Invitation flow
- Email invitations
- Custom roles
- Role hierarchy
- Audit logs
- Notifications
- Pagination

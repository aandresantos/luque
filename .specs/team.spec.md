# Spec: Team Module

## Goal

Implement CRUD operations for `Team` — a business unit within a Company responsible for owning and managing job Positions.

A Team acts as the organizational boundary where hiring happens.

## Context

A Company may contain multiple Teams.

Examples:

- Platform Engineering
- Backend Engineering
- Frontend Engineering
- Mobile Engineering

Each Team can own multiple Positions.

Teams help organize recruiting efforts and hiring responsibilities across different areas of the Company.

## Acceptance Criteria

- [ ] A recruiter can create a new Team under a Company
- [ ] A recruiter can list all Teams belonging to a Company
- [ ] A recruiter can fetch a single Team by ID
- [ ] A recruiter can update Team information
- [ ] A recruiter can archive a Team without deleting it
- [ ] Archived Teams are excluded from default listings unless explicitly requested
- [ ] A Team must belong to a valid Company (foreign key constraint)
- [ ] Team names must be unique within the same Company

## Data Shape

```typescript
Team {
  id: uuid (PK)
  companyId: uuid (FK → companies.id)
  name: string
  description: string | null
  status: 'ACTIVE' | 'ARCHIVED'
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

| Method | Path                        | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | /companies/:companyId/teams | List teams for a company |
| GET    | /teams/:id                  | Get a single team        |
| POST   | /companies/:companyId/teams | Create a new team        |
| PUT    | /teams/:id                  | Update a team            |
| PATCH  | /teams/:id/archive          | Archive a team           |

## Business Rules

- `status` defaults to `ACTIVE` on creation.
- Team names must be unique within a Company.
- A Team must belong to a valid Company.
- Archived Teams cannot receive new Positions.
- Archiving a Team does not archive existing Positions.
- `GET /companies/:companyId/teams` returns only ACTIVE teams by default.
  - Query param `?includeArchived=true` returns all.

## Out of Scope for This Spec

- Position management
- Recruiter assignment to Teams
- Authorization/permission checks
- Team hierarchy (parent/child teams)
- Pagination

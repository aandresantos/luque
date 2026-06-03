# Spec: Position Module

## Goal

Implement CRUD operations for `Position` — an open job position owned by a `Team`.
This is the core entity that candidates will eventually be matched against.

## Context

A `Team` (within a `Company`) opens a `Position` when they want to hire.
A `Position` has a title, description, and status.
Recruiters manage positions. Candidates are linked to positions via `CandidatePosition`.

## Acceptance Criteria

- [ ] A recruiter can create a new Position under a Team
- [ ] A recruiter can list all Positions belonging to a Team
- [ ] A recruiter can fetch a single Position by ID
- [ ] A recruiter can update the title or description of a Position
- [ ] A recruiter can close (soft-delete) a Position — it becomes inactive but is not deleted
- [ ] Closed positions are excluded from default listings unless explicitly requested
- [ ] A Position must belong to a valid Team (foreign key constraint)

## Data Shape

```typescript
Position {
  id: uuid (PK)
  teamId: uuid (FK → teams.id)
  title: string (min 1, max 120)
  description: string | null
  status: 'OPEN' | 'CLOSED'
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

| Method | Path                     | Description                        |
| ------ | ------------------------ | ---------------------------------- |
| GET    | /teams/:teamId/positions | List open positions for a team     |
| GET    | /positions/:id           | Get a single position              |
| POST   | /teams/:teamId/positions | Create a new position under a team |
| PUT    | /positions/:id           | Update title or description        |
| PATCH  | /positions/:id/close     | Close a position                   |

## Business Rules

- `status` defaults to `OPEN` on creation.
- `PATCH /positions/:id/close` sets `status = 'CLOSED'` and updates `updatedAt`.
- `GET /teams/:teamId/positions` returns only `OPEN` positions by default.
  - Query param `?includesClosed=true` returns all.
- Position title must be between 1 and 120 characters.

## Out of Scope for This Spec

- CandidatePosition (matching) — separate spec
- Authorization/permission checks — separate spec
- Pagination — can be added later

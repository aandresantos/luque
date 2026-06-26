# Spec: CandidatePosition Module

## Goal

Implement the hiring relationship between a `CandidateProfile` and a `Position`.

`CandidatePosition` represents the current state of a candidate inside a specific hiring process.

This module is responsible for supporting the initial hunting flow, where recruiters can select or discard candidates for a Position.

## Context

A `Position` represents an open hiring opportunity owned by a Team.

A `CandidateProfile` represents a candidate available for hunting.

When a recruiter selects or discards a candidate for a Position, the system creates or updates a `CandidatePosition`.

`CandidatePosition` is the source of truth for the candidate's current status inside that Position.

Every status change must generate an immutable history record through `CandidatePositionHistory`.

## Acceptance Criteria

- [ ] A recruiter can select a CandidateProfile for a Position
- [ ] A recruiter can discard a CandidateProfile for a Position
- [ ] A recruiter can list CandidatePositions for a Position
- [ ] A recruiter can fetch a single CandidatePosition by ID
- [ ] A recruiter can move a CandidatePosition to another valid status
- [ ] A CandidateProfile cannot be linked more than once to the same Position
- [ ] A CandidatePosition must reference a valid Position
- [ ] A CandidatePosition must reference a valid CandidateProfile
- [ ] A Position must be `OPEN` to receive new CandidatePositions
- [ ] A CandidateProfile must be `ACTIVE` to be linked to a Position
- [ ] Every status change creates a CandidatePositionHistory record
- [ ] CandidatePositionHistory is created automatically by this module

## Data Shape

```typescript
CandidatePosition {
  id: uuid (PK)
  positionId: uuid (FK → positions.id)
  candidateProfileId: uuid (FK → candidate_profiles.id)
  status:
    | 'SHORTLISTED'
    | 'DISCARDED'
    | 'UNDER_REVIEW'
    | 'INTERVIEW'
    | 'OFFER'
    | 'HIRED'
    | 'REJECTED'
  decidedByUserId: uuid | null (FK → users.id)
  decidedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

## CandidatePositionHistory Data Shape

```typescript
CandidatePositionHistory {
  id: uuid (PK)
  candidatePositionId: uuid (FK → candidate_positions.id)
  fromStatus:
    | 'SHORTLISTED'
    | 'DISCARDED'
    | 'UNDER_REVIEW'
    | 'INTERVIEW'
    | 'OFFER'
    | 'HIRED'
    | 'REJECTED'
    | null
  toStatus:
    | 'SHORTLISTED'
    | 'DISCARDED'
    | 'UNDER_REVIEW'
    | 'INTERVIEW'
    | 'OFFER'
    | 'HIRED'
    | 'REJECTED'
  changedByUserId: uuid (FK → users.id)
  createdAt: timestamp
}
```

## API Endpoints

| Method | Path                                                          | Description                              |
| ------ | ------------------------------------------------------------- | ---------------------------------------- |
| GET    | /positions/:positionId/candidate-positions                    | List CandidatePositions for a Position   |
| GET    | /candidate-positions/:id                                      | Get a single CandidatePosition           |
| POST   | /positions/:positionId/candidates/:candidateProfileId/select  | Select a candidate for a Position        |
| POST   | /positions/:positionId/candidates/:candidateProfileId/discard | Discard a candidate for a Position       |
| PATCH  | /candidate-positions/:id/status                               | Move CandidatePosition to another status |
| GET    | /candidate-positions/:id/history                              | Get CandidatePosition status history     |

## Business Rules

### Relationship Rules

- A CandidatePosition represents the relationship between one CandidateProfile and one Position.
- A CandidateProfile cannot have more than one CandidatePosition for the same Position.
- The pair `(positionId, candidateProfileId)` must be unique.
- A CandidatePosition must reference an existing Position.
- A CandidatePosition must reference an existing CandidateProfile.
- A new CandidatePosition can only be created if the Position status is `OPEN`.
- A new CandidatePosition can only be created if the CandidateProfile status is `ACTIVE`.

### Status Rules

- Selecting a candidate creates or moves CandidatePosition to `SHORTLISTED`.
- Discarding a candidate creates or moves CandidatePosition to `DISCARDED`.
- Every CandidatePosition must have one current status.
- Every status change must create a CandidatePositionHistory record.
- CandidatePositionHistory records are immutable.
- CandidatePositionHistory records cannot be updated or deleted through the public API.
- The first history record uses `fromStatus = null`.

### Valid Status Transitions

Initial MVP transitions:

```text
null → SHORTLISTED
null → DISCARDED

SHORTLISTED → UNDER_REVIEW
SHORTLISTED → DISCARDED

UNDER_REVIEW → INTERVIEW
UNDER_REVIEW → REJECTED

INTERVIEW → OFFER
INTERVIEW → REJECTED

OFFER → HIRED
OFFER → REJECTED
```

Invalid transitions should be rejected.

Examples:

```text
HIRED → REJECTED
REJECTED → INTERVIEW
DISCARDED → HIRED
```

### Idempotency Rules

- If the same recruiter selects an already `SHORTLISTED` CandidatePosition, the operation should return success without creating a duplicate record.
- If the same recruiter discards an already `DISCARDED` CandidatePosition, the operation should return success without creating a duplicate record.
- Repeating the same action with the same resulting status must not create a new CandidatePositionHistory record.
- Database uniqueness must be enforced through a unique constraint on `(positionId, candidateProfileId)`.

### Concurrency Rules

- If two recruiters try to create a CandidatePosition for the same Position and CandidateProfile at the same time, only one CandidatePosition must be created.
- If two recruiters perform the same decision at the same time, the final state should remain consistent and only one current CandidatePosition should exist.
- If two recruiters perform conflicting decisions at the same time, the first committed decision wins for the MVP.
- Conflicting decisions after a CandidatePosition has already been decided should return `409 Conflict`.
- CandidatePositions in `UNDER_REVIEW`, `INTERVIEW`, `OFFER`, `HIRED`, or `REJECTED` cannot be changed back to `SHORTLISTED` or `DISCARDED` through swipe endpoints.

### Transaction Rules

- Creating or updating CandidatePosition and creating CandidatePositionHistory must happen in the same database transaction.
- The transaction must be short and contain only critical writes.
- Side effects such as notifications, analytics, emails, cache invalidation, and async jobs must not run inside the transaction.

## Future Architecture Considerations

- Swipe decisions must be persisted synchronously in PostgreSQL.
- BullMQ may be introduced later for side effects such as notifications, analytics, emails, and cache invalidation.
- Redis cache may be introduced later after measuring slow reads or repeated queries.
- BullMQ must not be used as the source of truth for CandidatePosition decisions.
- CandidatePosition may be created by different workflows in the future, such as:
  - recruiter hunting
  - candidate applying to a Position

- The module should avoid naming and rules that assume only recruiters can create CandidatePosition.

## Out of Scope for This Spec

- Candidate application flow
- Candidate swipe over Positions
- Chat between recruiter and candidate
- Notifications
- Email sending
- Analytics
- Cache
- BullMQ jobs
- Authorization implementation
- Advanced matching algorithm
- Pagination

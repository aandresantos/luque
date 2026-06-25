# Spec: CandidateProfile Module

## Goal

Implement profile management for `CandidateProfile` — the professional profile of a User with type `CANDIDATE`.

A CandidateProfile represents the public candidate information used during hunting, filtering, and initial evaluation.

## Context

A User with type `CANDIDATE` may create one CandidateProfile to become visible to recruiters.

The profile should start simple and flexible, allowing the platform to support the first hunting flow without modeling a complete CV upfront.

Recruiters will use CandidateProfile data to quickly decide whether to select or discard a candidate for a Position.

## Acceptance Criteria

- [ ] A Candidate User can create their CandidateProfile
- [ ] A Candidate User can fetch their own CandidateProfile
- [ ] A Candidate User can update their CandidateProfile
- [ ] Recruiters can list CandidateProfiles for hunting
- [ ] Recruiters can fetch a single CandidateProfile by ID
- [ ] Only Users with type `CANDIDATE` can create a CandidateProfile
- [ ] A User can have only one CandidateProfile
- [ ] CandidateProfiles can be deactivated without being physically deleted
- [ ] Deactivated CandidateProfiles are excluded from default hunting listings

## Data Shape

```typescript
CandidateProfile {
  id: uuid (PK)
  userId: uuid (FK → users.id)
  fullName: string (min 1, max 120)
  headline: string | null
  summary: string | null
  location: string | null
  photoUrl: string | null
  seniority: 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'STAFF' | null
  availabilityStatus: 'OPEN_TO_WORK' | 'NOT_LOOKING'
  status: 'ACTIVE' | 'DEACTIVATED'
  createdAt: timestamp
  updatedAt: timestamp
}
```

## API Endpoints

| Method | Path                              | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET    | /candidate-profiles               | List active candidate profiles       |
| GET    | /candidate-profiles/me            | Get current user candidate profile   |
| GET    | /candidate-profiles/:id           | Get a single candidate profile       |
| POST   | /candidate-profiles               | Create candidate profile             |
| PUT    | /candidate-profiles/me            | Update current candidate profile     |
| PATCH  | /candidate-profiles/me/deactivate | Deactivate current candidate profile |

## Business Rules

- Only Users with type CANDIDATE can create a CandidateProfile.
- A User can have only one CandidateProfile.
- `status` defaults to `ACTIVE` on creation.
- `availabilityStatus` defaults to `OPEN_TO_WORK` on creation.
- `fullName` is required.
- `fullName` must be between 1 and 120 characters.
- `headline`, `summary`, `location`, and `photoUrl` are optional.
- Deactivated CandidateProfiles are excluded from default listings.
- CandidateProfile is used for hunting and initial candidate evaluation.
- A CandidateProfile does not represent a complete CV in the MVP.

## Hunting Rules

- Recruiters can list active CandidateProfiles.
- Recruiters should only see CandidateProfiles with status = ACTIVE.
- CandidateProfiles with availabilityStatus = NOT_LOOKING may still exist but can be excluded from default hunting results later.
- Filtering by seniority, location, and availability can be added later.

## Out of Scope for This Spec

- CandidateSkill
- CandidateExperience
- CandidateEducation
- CandidateResume
- CandidateLinks
- Salary expectation
- Remote work preferences
- Advanced filtering
- CandidatePosition
- Matching algorithm
- Authorization/permission checks
- Pagination

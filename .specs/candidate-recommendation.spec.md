# Candidate Recommendation — Backend Specification

## 1. Description

The `candidate-recommendation` module represents a candidate suggestion for a position.

A recommendation indicates that the system considers a `CandidateProfile` potentially relevant to a `Position`, but it does not mean the candidate has officially entered the hiring process.

```text
CandidateProfile
    ↓ matching, seed, or manual inclusion
CandidateRecommendation
    ↓ recruiter acceptance
CandidatePosition
```

This separation exists because:

- a recommendation is a hypothesis produced by the system;
- `CandidatePosition` represents actual participation in the hiring process;
- a position may receive hundreds of recommendations and accept only a few;
- future matching runs may recalculate scores without modifying the hiring pipeline;
- human decisions must not be overwritten by automated jobs.

---

## 2. Goal

Allow:

- candidates to be recommended for positions;
- recommendations to feed the swipe screen;
- recruiters to accept, reject, or postpone a recommendation;
- accepting a recommendation to create a `CandidatePosition`;
- rejecting or reviewing later not to create a `CandidatePosition`;
- future jobs to update scores without erasing human decisions;
- the system to preserve integrity, idempotency, and concurrency safety.

---

## 3. Scope

This specification covers:

- a new `candidate-recommendation` module;
- table and enums;
- migration;
- individual and batch creation;
- listing by position;
- pagination;
- acceptance;
- rejection;
- review later;
- transactional integration with `CandidatePosition`;
- support for future matching upserts;
- authorization;
- history;
- seeds;
- tests.

It does not cover:

- matching algorithm implementation;
- embeddings;
- workers;
- queues;
- scheduler;
- frontend;
- recruiter notes;
- candidate editing;
- AI ranking.

---

## 4. Location

```text
back-end/src/modules/candidate-recommendation/
```

Suggested structure:

```text
candidate-recommendation/
├── candidate-recommendation.schema.ts
├── candidate-recommendation.dto.ts
├── candidate-recommendation.repository.ts
├── candidate-recommendation.service.ts
├── candidate-recommendation.controller.ts
├── candidate-recommendation.routes.ts
├── candidate-recommendation.errors.ts
└── candidate-recommendation.test.ts
```

Follow the existing repository conventions. Do not introduce new layers only for this module.

---

## 5. Dependencies

Current dependencies:

```text
Position
CandidateProfile
CandidatePosition
CompanyMembership
Auth
```

Future dependencies:

```text
CandidateSkill
PositionSkill
MatchingJob
MatchingPolicy
Observability
```

---

## 6. Domain Model

### CandidateRecommendation

Represents:

> A candidate suggested for a position who has not yet officially entered the hiring process.

Responsible for:

- suggested candidate;
- related position;
- recommendation status;
- score;
- source;
- matching version;
- recommendation reason;
- recruiter decision.

### CandidatePosition

Represents:

> A candidate who has effectively entered the hiring process.

An accepted recommendation creates this relationship.

---

## 7. Status

```typescript
export const candidateRecommendationStatusEnum = pgEnum(
  "candidate_recommendation_status",
  [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "REVIEW_LATER",
  ],
);
```

Semantics:

```text
PENDING
    not yet reviewed by a recruiter

ACCEPTED
    accepted; must have a corresponding CandidatePosition

REJECTED
    discarded by a recruiter

REVIEW_LATER
    temporarily removed from the primary queue
```

---

## 8. Source

```typescript
export const candidateRecommendationSourceEnum = pgEnum(
  "candidate_recommendation_source",
  [
    "MANUAL",
    "SEED",
    "MATCHING_JOB",
  ],
);
```

---

## 9. Table

```typescript
export const candidateRecommendations = pgTable(
  "candidate_recommendations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    positionId: uuid("position_id")
      .notNull()
      .references(() => positions.id, {
        onDelete: "cascade",
      }),

    candidateProfileId: uuid("candidate_profile_id")
      .notNull()
      .references(() => candidateProfiles.id, {
        onDelete: "cascade",
      }),

    status: candidateRecommendationStatusEnum("status")
      .notNull()
      .default("PENDING"),

    source: candidateRecommendationSourceEnum("source")
      .notNull()
      .default("MANUAL"),

    score: integer("score"),

    matchingVersion: varchar("matching_version", {
      length: 100,
    }),

    reason: text("reason"),

    generatedAt: timestamp("generated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    decidedAt: timestamp("decided_at", {
      withTimezone: true,
    }),

    decidedByMembershipId: uuid("decided_by_membership_id")
      .references(() => companyMemberships.id, {
        onDelete: "set null",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex(
      "candidate_recommendation_position_candidate_unique",
    ).on(
      table.positionId,
      table.candidateProfileId,
    ),

    index(
      "candidate_recommendation_position_status_idx",
    ).on(
      table.positionId,
      table.status,
    ),

    index(
      "candidate_recommendation_candidate_idx",
    ).on(table.candidateProfileId),
  ],
);
```

---

## 10. Integrity Rules

### Uniqueness

The same candidate may have only one recommendation per position:

```text
UNIQUE(positionId, candidateProfileId)
```

The same candidate may be recommended for different positions.

### Score

When present:

```text
0 <= score <= 100
```

Validation must exist in the DTO and, when possible, in the database.

### Position

Only a `Position` with status `OPEN` may receive new recommendations.

Closing a position must not delete existing recommendations.

### Existing participation

If a `CandidatePosition` already exists for the same:

```text
positionId + candidateProfileId
```

a new pending recommendation must not be created.

### Decision

For statuses other than `PENDING`:

```text
decidedAt must be populated
decidedByMembershipId must be populated
```

---

## 11. State Transitions

### Valid

```text
PENDING → ACCEPTED
PENDING → REJECTED
PENDING → REVIEW_LATER

REVIEW_LATER → ACCEPTED
REVIEW_LATER → REJECTED
REVIEW_LATER → PENDING
```

### Invalid

```text
ACCEPTED → PENDING
ACCEPTED → REJECTED
REJECTED → PENDING
REJECTED → ACCEPTED
```

`ACCEPTED` and `REJECTED` are final states in this first version.

---

## 12. Use Case — Create Recommendation

Creates an individual recommendation.

### Input

```typescript
export interface CreateCandidateRecommendationInput {
  positionId: string;
  candidateProfileId: string;
  source: "MANUAL" | "SEED" | "MATCHING_JOB";
  score?: number;
  matchingVersion?: string;
  reason?: string;
}
```

### Rules

- the position must exist;
- the position must be `OPEN`;
- the candidate must exist;
- the recommendation must not already exist;
- a `CandidatePosition` must not already exist;
- initial status must be `PENDING`;
- the client must not define the status;
- score must be between 0 and 100.

---

## 13. Use Case — Create Recommendations Batch

### Input

```typescript
export interface CreateCandidateRecommendationsBatchInput {
  positionId: string;
  candidateProfileIds: string[];
  source: "MANUAL" | "SEED" | "MATCHING_JOB";
  matchingVersion?: string;
}
```

### Rules

- the position must exist and be open;
- duplicate IDs must be normalized;
- existing recommendations must be ignored;
- candidates already present in `CandidatePosition` must be ignored;
- the operation must be idempotent.

### Result

```typescript
export interface CreateCandidateRecommendationsBatchResult {
  created: number;
  skipped: number;
  recommendationIds: string[];
}
```

---

## 14. Use Case — Upsert From Matching

Used by a future job.

### Input

```typescript
export interface UpsertCandidateRecommendationInput {
  positionId: string;
  candidateProfileId: string;
  score: number;
  matchingVersion: string;
  reason?: string;
}
```

### Rules

If it does not exist:

```text
create as PENDING
source = MATCHING_JOB
```

If it exists as `PENDING`:

```text
update score
update matchingVersion
update reason
update generatedAt
```

If it exists as `REVIEW_LATER`:

```text
update matching data
do not change status
```

If it exists as `ACCEPTED` or `REJECTED`:

```text
do not change status
do not resurrect the recommendation
```

If a `CandidatePosition` already exists:

```text
do not create a pending recommendation
```

---

## 15. Use Case — List By Position

### Endpoint

```http
GET /positions/:positionId/recommendations
```

### Query

```typescript
export const ListCandidateRecommendationsQueryDto = z.object({
  status: z
    .enum([
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "REVIEW_LATER",
    ])
    .optional(),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  cursor: z.uuid().optional(),
});
```

### Rules

- validate access to the position's company;
- filter by status;
- support pagination;
- do not load the entire dataset;
- for swipe, order by score;
- break ties by `createdAt` and `id`.

Initial ordering:

```text
score DESC NULLS LAST
createdAt ASC
id ASC
```

The primary queue uses:

```text
status = PENDING
```

---

## 16. Use Case — Accept Recommendation

### Endpoint

```http
POST /candidate-recommendations/:id/accept
```

### Effect

Accepting a recommendation creates a `CandidatePosition`.

### Required Transaction

```text
1. Fetch recommendation
2. Lock record for update
3. Validate status PENDING or REVIEW_LATER
4. Validate position OPEN
5. Validate membership
6. Validate access to the position's company
7. Check for existing CandidatePosition
8. Create CandidatePosition
9. Update recommendation to ACCEPTED
10. Populate decidedAt
11. Populate decidedByMembershipId
12. Record history
13. Commit
```

If any step fails, nothing must be persisted.

### Result

```typescript
export interface AcceptCandidateRecommendationResult {
  recommendation: CandidateRecommendationResponse;
  candidatePosition: CandidatePositionResponse;
}
```

### Idempotency

If it is already `ACCEPTED` and the `CandidatePosition` exists:

- do not create a duplicate;
- return the existing result or an idempotent conflict according to the project standard.

---

## 17. Use Case — Reject Recommendation

### Endpoint

```http
POST /candidate-recommendations/:id/reject
```

### Rules

- accept only `PENDING` or `REVIEW_LATER`;
- validate access;
- update to `REJECTED`;
- populate `decidedAt`;
- populate `decidedByMembershipId`;
- record history;
- do not create `CandidatePosition`.

---

## 18. Use Case — Review Later

### Endpoint

```http
POST /candidate-recommendations/:id/review-later
```

### Rules

- accept only `PENDING`;
- validate access;
- update to `REVIEW_LATER`;
- populate `decidedAt`;
- populate `decidedByMembershipId`;
- record history;
- do not create `CandidatePosition`;
- remove from the primary queue.

---

## 19. History

Create transition history.

```typescript
export const candidateRecommendationHistory = pgTable(
  "candidate_recommendation_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    recommendationId: uuid("recommendation_id")
      .notNull()
      .references(() => candidateRecommendations.id, {
        onDelete: "cascade",
      }),

    fromStatus: candidateRecommendationStatusEnum(
      "from_status",
    ),

    toStatus: candidateRecommendationStatusEnum(
      "to_status",
    ).notNull(),

    changedByMembershipId: uuid(
      "changed_by_membership_id",
    ).references(() => companyMemberships.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
);
```

Rules:

- initial creation records `PENDING`;
- every transition records history;
- history cannot be edited;
- automated actions may have a null membership.

---

## 20. DTOs

### Params

```typescript
export const CandidateRecommendationParamsDto = z.object({
  id: z.uuid(),
});
```

```typescript
export const PositionRecommendationParamsDto = z.object({
  positionId: z.uuid(),
});
```

### Create

```typescript
export const CreateCandidateRecommendationDto = z.object({
  positionId: z.uuid(),
  candidateProfileId: z.uuid(),

  source: z.enum([
    "MANUAL",
    "SEED",
    "MATCHING_JOB",
  ]),

  score: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional(),

  matchingVersion: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  reason: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .optional(),
});
```

### Response

```typescript
export const CandidateRecommendationResponseDto = z.object({
  id: z.uuid(),
  positionId: z.uuid(),
  candidateProfileId: z.uuid(),

  status: z.enum([
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "REVIEW_LATER",
  ]),

  source: z.enum([
    "MANUAL",
    "SEED",
    "MATCHING_JOB",
  ]),

  score: z.number().int().min(0).max(100).nullable(),
  matchingVersion: z.string().nullable(),
  reason: z.string().nullable(),

  generatedAt: z.string(),
  decidedAt: z.string().nullable(),
  decidedByMembershipId: z.uuid().nullable(),

  createdAt: z.string(),
  updatedAt: z.string(),
});
```

---

## 21. Swipe DTO

The swipe screen list may return enriched data.

```typescript
export const CandidateRecommendationForSwipeResponseDto =
  z.object({
    recommendationId: z.uuid(),

    status: z.literal("PENDING"),

    score: z.number().int().min(0).max(100).nullable(),
    reason: z.string().nullable(),

    candidate: z.object({
      id: z.uuid(),
      name: z.string(),
      headline: z.string().nullable(),
      summary: z.string().nullable(),
      location: z.string().nullable(),
      avatarUrl: z.string().nullable(),

      skills: z.array(
        z.object({
          id: z.uuid(),
          name: z.string(),
        }),
      ),
    }),

    position: z.object({
      id: z.uuid(),
      title: z.string(),
    }),
  });
```

Adjust this DTO to the fields that actually exist in `CandidateProfile`.

Do not invent missing fields.

---

## 22. Repository

Expected operations:

```typescript
findById(id, tx?)
findByPositionAndCandidate(positionId, candidateProfileId, tx?)
listByPosition(filters, tx?)
create(data, tx?)
createMany(data, tx?)
updateDecision(data, tx?)
updateMatchingData(data, tx?)
lockById(id, tx)
```

The implementation also needs to query:

```typescript
candidatePositionRepository.findByPositionAndCandidate(...)
```

---

## 23. Concurrency

Scenario:

```text
Recruiter A accepts
Recruiter B accepts at the same time
```

Expected result:

- only one `CandidatePosition` is created;
- only one effective acceptance occurs;
- the second operation returns a conflict or idempotent result;
- no duplicate is created.

Guarantee:

```text
UNIQUE(positionId, candidateProfileId)
```

must also exist in `CandidatePosition`.

Acceptance must use a pessimistic lock or equivalent mechanism.

---

## 24. Authorization

To view or decide:

- authenticated user;
- active `CompanyMembership`;
- membership belongs to the position's company;
- authorized role.

Conceptual roles:

```text
ADMIN
RECRUITER
RECRUITER_MANAGER
```

Use the project's actual roles.

`decidedByMembershipId` must come from the authenticated context, never from the public request body.

---

## 25. Domain Errors

```text
404
CANDIDATE_RECOMMENDATION_NOT_FOUND
```

```text
409
POSITION_NOT_OPEN
```

```text
409
CANDIDATE_RECOMMENDATION_ALREADY_EXISTS
```

```text
409
CANDIDATE_ALREADY_IN_POSITION
```

```text
409
INVALID_RECOMMENDATION_STATUS_TRANSITION
```

```text
409
CANDIDATE_RECOMMENDATION_ALREADY_PROCESSED
```

```text
403
CANDIDATE_RECOMMENDATION_ACCESS_DENIED
```

```text
400
CANDIDATE_RECOMMENDATION_SCORE_INVALID
```

The frontend must not depend only on textual error messages.

---

## 26. Endpoints

```http
POST /candidate-recommendations
POST /candidate-recommendations/batch

GET /positions/:positionId/recommendations
GET /candidate-recommendations/:id

POST /candidate-recommendations/:id/accept
POST /candidate-recommendations/:id/reject
POST /candidate-recommendations/:id/review-later
```

Avoid:

```http
PATCH /candidate-recommendations/:id/status
```

Explicit commands are preferred because `accept` has the important side effect of creating a `CandidatePosition`.

---

## 27. Future Job

Expected flow:

```text
Position OPEN
    ↓
Job loads requirements
    ↓
Finds eligible candidates
    ↓
Calculates score
    ↓
Applies minimum score
    ↓
Upserts CandidateRecommendation
```

Future rules:

- process in batches;
- be idempotent;
- do not reopen rejected recommendations;
- do not modify accepted recommendations;
- update pending scores;
- update review-later scores without changing status;
- do not recommend candidates who already have `CandidatePosition`;
- record `matchingVersion`.

The actual job is outside this specification.

---

## 28. Seeds

Create a minimum seed:

```text
Company
CompanyMembership
Team
Position OPEN
CandidateProfiles
CandidateRecommendations PENDING
```

Create varied scores:

```text
Candidate A → 92
Candidate B → 81
Candidate C → 67
```

This must allow validation of ordering and the swipe screen.

---

## 29. Required Tests

### DTO

- accepts valid payload;
- rejects score below zero;
- rejects score above 100;
- rejects invalid UUID;
- client cannot define initial status.

### Create

- creates recommendation for open position;
- fails for closed position;
- fails for missing candidate;
- fails on duplicate;
- fails when `CandidatePosition` already exists.

### Batch

- creates multiple recommendations;
- normalizes duplicate IDs;
- ignores existing recommendations;
- ignores candidates already linked;
- is idempotent.

### List

- lists only recommendations from the position;
- filters by status;
- orders by score;
- paginates correctly;
- blocks access from another company.

### Accept

- accepts pending recommendation;
- creates `CandidatePosition`;
- marks recommendation as `ACCEPTED`;
- records actor;
- records timestamp;
- records history;
- executes in the same transaction;
- rolls back on failure;
- does not duplicate under concurrency;
- accepts `REVIEW_LATER`;
- rejects invalid transition.

### Reject

- marks as `REJECTED`;
- does not create `CandidatePosition`;
- records decision;
- does not reject an accepted recommendation.

### Review Later

- marks as `REVIEW_LATER`;
- does not create `CandidatePosition`;
- leaves the primary queue.

### Matching Upsert

- creates missing recommendation;
- updates pending recommendation;
- updates review-later recommendation without changing status;
- preserves rejected recommendation;
- preserves accepted recommendation;
- ignores candidate already in the process.

### Authorization

- blocks without membership;
- blocks membership from another company;
- allows authorized roles.

---

## 30. Acceptance Criteria

The implementation is complete when:

- table and enums exist;
- migration runs successfully;
- uniqueness by position and candidate exists;
- recommendations are created as `PENDING`;
- individual creation works;
- batch creation works;
- listing by position works;
- filtering and pagination work;
- acceptance creates `CandidatePosition` atomically;
- rejection does not create `CandidatePosition`;
- review later removes the recommendation from the primary queue;
- matching does not overwrite human decisions;
- concurrency does not create duplicates;
- authorization is enforced;
- errors have stable codes;
- seed data allows swipe testing;
- typecheck passes;
- lint passes;
- tests pass.

---

## 31. Recommended Implementation Order

### Phase 1 — Persistence

- enums;
- table;
- migration;
- constraints;
- repository;
- schema tests.

### Phase 2 — Creation and Listing

- DTOs;
- create;
- batch;
- list;
- pagination;
- authorization;
- seed.

### Phase 3 — Decisions

- accept;
- reject;
- review later;
- history;
- transaction with `CandidatePosition`;
- concurrency;
- rollback.

### Phase 4 — Future Integration

- matching upsert;
- idempotency;
- preservation of human decisions;
- tests.

---

## 32. Required Final Report

When complete, report:

1. migrations created;
2. tables and enums;
3. files created;
4. files modified;
5. endpoints;
6. domain rules;
7. authorization;
8. concurrency strategy;
9. idempotency strategy;
10. integration with `CandidatePosition`;
11. seeds;
12. tests;
13. commands executed;
14. results;
15. blockers;
16. deviations from this specification and their justification.
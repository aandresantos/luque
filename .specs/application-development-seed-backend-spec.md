# Application Development Seed — Backend Specification

## 1. Description

Create a complete development seed for the TalentMatch application.

The seed must populate the minimum coherent domain graph required to build and test frontend screens using real database records and real API responses.

The seed is intended for local development and automated testing environments only.

It must create data for:

```text
User
Auth Credential
Company
Company Membership
Team
Position
Candidate Profile
Skill
Candidate Skill
Candidate Recommendation
Candidate Position
```

The generated data must support the following frontend flows:

```text
Login
  ↓
Authenticated application shell
  ↓
Company context
  ↓
Team listing
  ↓
Position listing
  ↓
Position details
  ↓
Candidate recommendation swipe
  ↓
Accepted candidates
  ↓
Rejected and review-later recommendations
```

---

## 2. Goal

Allow frontend development without:

- manually inserting database records;
- hardcoding entity IDs;
- mocking domain data inside components;
- recreating the same test scenario after every database reset;
- depending on unfinished onboarding or company registration flows.

After running the seed, a developer must be able to:

- log in with known credentials;
- access a valid company membership;
- browse real teams and positions;
- open an active position;
- load pending candidate recommendations;
- perform swipe decisions;
- inspect accepted candidates represented by `CandidatePosition`;
- develop empty, loading, populated, and partially processed states.

---

## 3. Scope

This specification covers:

- a root application seed command;
- deterministic development data;
- stable seed identifiers when supported;
- password credential creation;
- company and membership relationships;
- teams and positions;
- candidate profiles;
- skills and candidate-skill relationships;
- candidate recommendations;
- candidate positions;
- optional recommendation history;
- idempotency;
- reset behavior;
- execution safety;
- validation output.

This specification does not cover:

- production data migration;
- production bootstrap;
- fake external integrations;
- matching algorithm implementation;
- background workers;
- email delivery;
- object storage;
- billing;
- analytics;
- large-scale performance datasets.

---

## 4. Environment Restrictions

The seed must only run when the environment is explicitly non-production.

Allowed environments:

```text
development
test
local
```

The seed must refuse to run when:

```text
NODE_ENV=production
```

or when the application environment resolves to production by another project-specific mechanism.

Example:

```typescript
if (env.NODE_ENV === "production") {
  throw new Error("Application seed cannot run in production");
}
```

The seed command must never be included in the production startup path.

---

## 5. Command

Provide a repository script equivalent to:

```json
{
  "db:seed": "...",
  "db:seed:reset": "..."
}
```

Expected behavior:

```text
db:seed
    safely creates or updates the development dataset

db:seed:reset
    clears seed-owned records and recreates the dataset
```

Use the repository's existing package manager and database tooling.

Do not introduce a second migration or ORM workflow.

---

## 6. File Organization

Prefer a dedicated seed directory:

```text
back-end/src/database/seed/
├── index.ts
├── seed.config.ts
├── seed.ids.ts
├── seed.utils.ts
├── seed-auth.ts
├── seed-companies.ts
├── seed-teams.ts
├── seed-positions.ts
├── seed-candidates.ts
├── seed-skills.ts
├── seed-recommendations.ts
├── seed-candidate-positions.ts
└── seed.validation.ts
```

Adapt the location to the repository's existing conventions.

Responsibilities:

```text
index.ts
    orchestrates the complete seed

seed.ids.ts
    contains stable identifiers, when UUID injection is supported

seed.utils.ts
    contains reusable seed-only helpers

seed-auth.ts
    creates users, credentials, and authentication-related records

seed-companies.ts
    creates companies and memberships

seed-teams.ts
    creates teams

seed-positions.ts
    creates open and closed positions

seed-candidates.ts
    creates candidate users and profiles

seed-skills.ts
    creates skills and candidate-skill relationships

seed-recommendations.ts
    creates recommendation queues

seed-candidate-positions.ts
    creates candidates already inside hiring processes

seed.validation.ts
    validates the final domain graph
```

Do not place all seed logic in a single large file.

Do not create module-level business rules inside seed files.

---

## 7. Seed Design Principles

The seed must be:

### Deterministic

The same command must create the same logical dataset.

Names, emails, slugs, statuses, and relationships must not change randomly between executions.

### Idempotent

Running the seed multiple times must not create duplicate records.

### Referentially correct

Every foreign key must point to a valid record.

### Domain coherent

The dataset must represent realistic application scenarios, not unrelated random rows.

### Safe to reset

The reset command must delete only records owned by the development seed, unless the project already defines a full development database reset strategy.

### Useful for UI development

The data must include:

- long and short names;
- nullable and populated fields;
- different statuses;
- enough candidates for swipe;
- empty-state scenarios;
- multiple teams and positions;
- different skill combinations;
- partially processed recommendation queues.

---

## 8. Stable Seed Identity

Prefer stable UUIDs when repository APIs allow explicit IDs.

Example:

```typescript
export const seedIds = {
  users: {
    admin: "10000000-0000-4000-8000-000000000001",
    recruiter: "10000000-0000-4000-8000-000000000002",
  },

  companies: {
    luque: "20000000-0000-4000-8000-000000000001",
  },

  teams: {
    engineering: "30000000-0000-4000-8000-000000000001",
    product: "30000000-0000-4000-8000-000000000002",
  },

  positions: {
    seniorBackend: "40000000-0000-4000-8000-000000000001",
    frontend: "40000000-0000-4000-8000-000000000002",
    closedLegacy: "40000000-0000-4000-8000-000000000003",
  },
} as const;
```

Benefits:

- frontend developers can navigate directly to known routes;
- automated tests can use stable references;
- relationships are easier to inspect;
- seed output is reproducible.

If IDs are always database-generated, use stable unique natural keys such as:

```text
user.email
company.slug
team name within company
position seed key
candidate user email
skill normalized name
```

Do not hardcode database-generated IDs after creation.

---

## 9. Development Credentials

Create at least two company users.

### Administrator

```text
Name: André Admin
Email: admin@luque.local
Password: DevPassword123!
Type: COMPANY_USER
Membership role: ADMIN
```

### Recruiter

```text
Name: Marina Recruiter
Email: recruiter@luque.local
Password: DevPassword123!
Type: COMPANY_USER
Membership role: RECRUITER
```

Use the actual membership roles defined by the project.

The password must:

- pass the real password policy;
- be hashed using the production password hashing function;
- never be inserted as plain text;
- be documented in the seed output;
- be used only in non-production environments.

Do not create sessions or refresh tokens by default.

Developers should authenticate through the real login endpoint.

---

## 10. Company Dataset

Create one primary company.

```text
Name: Luque Labs
Slug: luque-labs
Description:
  A seeded technology company used to develop and validate the
  TalentMatch recruiting experience.
Status: ACTIVE
```

If the current company schema contains only:

```text
name
slug
description
logoUrl
status
```

seed only those fields.

Do not invent legal name, CNPJ, address, phone, or segment fields until they exist in the schema.

Create memberships:

```text
André Admin
    → Luque Labs
    → ADMIN
    → ACTIVE

Marina Recruiter
    → Luque Labs
    → RECRUITER
    → ACTIVE
```

The first membership must satisfy the existing rule that the company's first user is an administrator.

---

## 11. Team Dataset

Create at least three teams.

### Engineering

```text
Name: Engineering
Status: ACTIVE
```

### Product

```text
Name: Product
Status: ACTIVE
```

### Archived Operations

```text
Name: Operations
Status: ARCHIVED
```

Use the real team status model.

Purpose:

- Engineering supports populated position screens;
- Product supports additional navigation scenarios;
- Operations supports archived-state UI.

Respect team uniqueness rules.

---

## 12. Position Dataset

Create positions with different states and data density.

### Position A — Main Swipe Scenario

```text
Title: Senior Backend Engineer
Team: Engineering
Status: OPEN
```

Description:

```text
Build and evolve distributed backend services using Node.js,
TypeScript, PostgreSQL, messaging, observability, and cloud
infrastructure.
```

This position must have:

- multiple pending recommendations;
- at least one review-later recommendation;
- at least one rejected recommendation;
- at least one accepted recommendation;
- at least one related `CandidatePosition`.

### Position B — Secondary Open Position

```text
Title: Frontend Engineer
Team: Engineering
Status: OPEN
```

This position must have:

- fewer pending recommendations;
- no accepted candidate initially;
- different required skill emphasis.

### Position C — Empty Queue Scenario

```text
Title: Product Designer
Team: Product
Status: OPEN
```

This position must have:

- no pending recommendations;
- no candidate positions.

It exists to develop empty states.

### Position D — Closed Scenario

```text
Title: Legacy Systems Engineer
Team: Engineering
Status: CLOSED
```

This position must not receive new pending recommendations during normal use.

Use the real position fields and status enum.

Do not add required skills directly to Position unless that relationship already exists.

---

## 13. Candidate User and Profile Dataset

Create at least twelve candidate users and profiles.

Each candidate must have:

- valid `User`;
- type `CANDIDATE`;
- valid `CandidateProfile`;
- realistic name;
- distinct summary;
- different experience level;
- varied optional fields;
- stable email.

Suggested candidates:

```text
1. Ana Souza
2. Bruno Lima
3. Camila Ferreira
4. Daniel Oliveira
5. Elisa Martins
6. Felipe Rocha
7. Gabriela Alves
8. Henrique Costa
9. Isabela Mendes
10. João Ribeiro
11. Karen Santos
12. Lucas Almeida
```

Example candidate variation:

```text
Ana Souza
    Senior Backend Engineer
    Node.js, TypeScript, PostgreSQL, AWS
    7 years of experience
    high backend compatibility

Bruno Lima
    Full Stack Engineer
    React, Node.js, TypeScript
    5 years of experience
    balanced frontend/backend compatibility

Camila Ferreira
    Frontend Engineer
    React, TypeScript, Design Systems
    4 years of experience
    high frontend compatibility

Daniel Oliveira
    Java Backend Engineer
    Java, Spring, Kafka
    8 years of experience
    lower compatibility with Node.js position
```

Use only fields that exist in the current `CandidateProfile` schema.

If fields such as headline, avatar, salary, availability, or location do not exist, do not invent database columns.

---

## 14. Skills

Create a stable skill catalog.

Suggested skills:

```text
Node.js
TypeScript
JavaScript
React
Next.js
PostgreSQL
MySQL
Redis
RabbitMQ
Kafka
AWS
Docker
Kubernetes
Fastify
NestJS
Java
Spring
GraphQL
REST APIs
Observability
System Design
Microservices
CI/CD
Testing
Tailwind CSS
Design Systems
Figma
Product Discovery
```

Skill rules:

- normalize names according to the existing module;
- do not create duplicates with different casing;
- preserve stable names;
- use the real skill uniqueness constraints.

---

## 15. Candidate Skills

Create candidate-skill relationships with enough variation to produce meaningful cards and future matching results.

Example:

```text
Ana Souza
    Node.js — ADVANCED
    TypeScript — ADVANCED
    PostgreSQL — ADVANCED
    AWS — INTERMEDIATE
    RabbitMQ — INTERMEDIATE
    System Design — ADVANCED

Bruno Lima
    React — ADVANCED
    Node.js — INTERMEDIATE
    TypeScript — ADVANCED
    PostgreSQL — INTERMEDIATE
    Testing — INTERMEDIATE

Camila Ferreira
    React — ADVANCED
    TypeScript — ADVANCED
    Tailwind CSS — ADVANCED
    Design Systems — ADVANCED
    Testing — INTERMEDIATE
```

Use the actual candidate-skill schema.

If proficiency level does not exist, create only the relationship.

Do not add a proficiency model solely for the seed.

---

## 16. Candidate Recommendations

Create recommendations for the main open position.

### Senior Backend Engineer

Create at least eight pending recommendations:

```text
Ana Souza       score 94
Bruno Lima      score 83
Felipe Rocha    score 88
Gabriela Alves  score 79
Henrique Costa  score 76
João Ribeiro    score 72
Karen Santos    score 69
Lucas Almeida   score 65
```

Create processed recommendations:

```text
Camila Ferreira
    status: REVIEW_LATER
    score: 61

Daniel Oliveira
    status: REJECTED
    score: 54

Elisa Martins
    status: ACCEPTED
    score: 86
```

For the accepted recommendation:

- create the corresponding `CandidatePosition`;
- ensure both records are coherent;
- populate decision metadata when supported.

### Frontend Engineer

Create at least four pending recommendations:

```text
Camila Ferreira score 95
Bruno Lima      score 87
Isabela Mendes  score 82
Karen Santos    score 74
```

### Product Designer

Create no recommendations.

### Closed Position

Do not create pending recommendations unless required to test historical behavior.

Recommendation fields:

```text
source: SEED
matchingVersion: seed-v1
reason: realistic explanation when the field exists
```

Example reason:

```text
Strong overlap in Node.js, TypeScript, PostgreSQL, and distributed systems.
```

---

## 17. Candidate Positions

Create records representing candidates already inside a hiring process.

For the Senior Backend Engineer position:

### Accepted Recommendation Result

```text
Candidate: Elisa Martins
Initial recommendation: ACCEPTED
CandidatePosition: created
```

Use a valid initial pipeline status from the real `CandidatePosition` enum.

### Additional Pipeline States

When supported by the current enum, create candidates in different states:

```text
SCREENING
INTERVIEW
OFFER
REJECTED
```

Do not invent statuses.

If the current domain supports only a smaller status set, use only those values.

Preserve:

```text
UNIQUE(positionId, candidateProfileId)
```

---

## 18. Candidate Recommendation History

If recommendation history exists, create coherent history.

Examples:

```text
Elisa Martins
    null → PENDING
    PENDING → ACCEPTED

Daniel Oliveira
    null → PENDING
    PENDING → REJECTED

Camila Ferreira
    null → PENDING
    PENDING → REVIEW_LATER
```

Use valid membership IDs for human decisions.

If history has not been implemented yet, do not block the seed.

---

## 19. Optional Candidate Position History

If `CandidatePositionHistory` already exists inside the module, create representative transitions.

Example:

```text
Elisa Martins
    initial status
    → current pipeline status
```

Do not create a separate module when history is already modeled inside `candidate-position`.

---

## 20. Data Scenarios Required for Frontend

The seed must support all of these scenarios.

### Authentication

```text
valid admin login
valid recruiter login
```

### Company Navigation

```text
active company
active memberships
multiple teams
archived team
```

### Position Navigation

```text
open position with recommendations
open position with a small queue
open position with an empty queue
closed position
```

### Swipe

```text
multiple PENDING recommendations
one REVIEW_LATER recommendation
one REJECTED recommendation
one ACCEPTED recommendation
one accepted recommendation linked to CandidatePosition
different scores
different skill sets
nullable candidate fields
```

### Pipeline

```text
at least one CandidatePosition
multiple statuses when supported
```

### UI Text Stress

Include:

- one long candidate summary;
- one short candidate summary;
- one candidate with many skills;
- one candidate with few skills;
- one candidate missing optional profile fields;
- one long position description.

---

## 21. Idempotency Strategy

The seed must be safe to run repeatedly.

Preferred strategies:

### Upsert by stable unique key

Examples:

```text
User by email
Company by slug
Team by companyId + name
Skill by normalized name
Recommendation by positionId + candidateProfileId
CandidatePosition by positionId + candidateProfileId
```

### Stable explicit IDs

Use stable IDs when supported.

### No blind inserts

Avoid inserting records without first relying on a database uniqueness guarantee or upsert.

Application-level existence checks alone are insufficient.

---

## 22. Reset Strategy

Preferred option:

```text
development database reset
    ↓
run migrations
    ↓
run seed
```

If a targeted seed reset is required, mark seed-owned records.

Possible approaches:

- known stable IDs;
- `.local` emails;
- known company slug;
- seed metadata field when already available.

Deletion order must respect foreign keys.

Conceptual order:

```text
Recommendation History
Candidate Position History
Candidate Positions
Candidate Recommendations
Candidate Skills
Candidate Profiles
Skills
Positions
Teams
Company Memberships
Companies
Credentials
Sessions
Users
```

Adapt to real cascade rules.

Do not delete arbitrary developer-created data unless the command explicitly performs a complete local database reset.

---

## 23. Transaction Strategy

The complete seed does not need to run inside one extremely long transaction if that would hold locks unnecessarily.

Prefer transactions by coherent aggregate or phase:

```text
Phase 1
    users and credentials

Phase 2
    company and memberships

Phase 3
    teams and positions

Phase 4
    candidate users and profiles

Phase 5
    skills and candidate skills

Phase 6
    recommendations and candidate positions

Phase 7
    validation
```

Each phase should fail clearly.

The seed command must exit with a non-zero code on failure.

---

## 24. Repository and Service Usage

Prefer using repositories or domain services when they enforce important invariants.

Examples:

- password hashing must use the real auth utility;
- accepted recommendations should use the real acceptance use case when practical;
- membership rules should use existing domain behavior;
- status history should be created consistently.

Direct database insertion may be used when:

- the project convention already uses it for seeds;
- calling services would create external side effects;
- data setup would otherwise become unnecessarily complex;
- all relevant invariants are still explicitly preserved.

Do not call HTTP endpoints from the seed.

---

## 25. External Side Effects

The seed must not:

- send email;
- publish queue messages;
- call external APIs;
- upload files;
- trigger billing;
- dispatch notifications;
- start matching jobs.

Disable or bypass external side effects using existing test/development boundaries.

Do not hide unexpected side effects silently.

---

## 26. Seed Configuration

Allow basic configuration through code or environment variables.

Example:

```typescript
export interface SeedConfig {
  adminPassword: string;
  candidateCount: number;
  resetBeforeSeed: boolean;
}
```

Defaults:

```text
adminPassword: DevPassword123!
candidateCount: 12
resetBeforeSeed: false
```

Do not require configuration for the default local scenario.

---

## 27. Seed Output

At the end, print a concise summary.

Example:

```text
Development seed completed.

Login:
  admin@luque.local / DevPassword123!
  recruiter@luque.local / DevPassword123!

Created:
  14 users
  1 company
  2 memberships
  3 teams
  4 positions
  12 candidate profiles
  28 skills
  64 candidate skills
  15 recommendations
  1 candidate position

Main routes:
  /app/positions/<senior-backend-position-id>
  /app/positions/<senior-backend-position-id>/swipe
```

Never print password hashes, refresh tokens, or session tokens.

---

## 28. Validation

After insertion, validate the graph.

Required checks:

```text
admin user exists
admin credential exists
company exists
admin membership exists
recruiter membership exists
main team exists
main position exists and is OPEN
candidate profiles exist
skills exist
candidate skills reference valid records
pending recommendations exist
accepted recommendation has CandidatePosition
rejected recommendation has no CandidatePosition
review-later recommendation has no CandidatePosition
empty position has no recommendations
closed position has no new pending queue
```

The seed must fail when critical validation fails.

---

## 29. Tests

Create tests for seed helpers and critical behavior when the repository test strategy supports database integration tests.

Required scenarios:

- seed runs on an empty database;
- running twice does not duplicate records;
- known login user has a valid credential;
- memberships reference the seeded company;
- teams reference the company;
- positions reference valid teams;
- candidate profiles reference candidate users;
- candidate skills reference valid skills;
- recommendation uniqueness is preserved;
- accepted recommendation has one `CandidatePosition`;
- rejected recommendation has no `CandidatePosition`;
- review-later recommendation is not returned in the pending queue;
- reset and reseed recreate the expected dataset;
- production execution is blocked.

Do not snapshot the entire database.

Assert important counts, relationships, and invariants.

---

## 30. Acceptance Criteria

The implementation is complete when:

- a `db:seed` command exists;
- a safe reset-and-seed workflow exists;
- production execution is blocked;
- the seed is deterministic;
- the seed is idempotent;
- known development credentials work through the real login flow;
- a valid company and memberships exist;
- multiple teams exist;
- open, closed, populated, and empty positions exist;
- at least twelve candidate profiles exist;
- skills and candidate-skill relationships exist;
- pending recommendations feed the swipe endpoint;
- accepted recommendation data is coherent with `CandidatePosition`;
- rejected and review-later recommendations do not create `CandidatePosition`;
- output prints useful development IDs and credentials;
- validation passes;
- typecheck passes;
- lint passes;
- tests pass;
- the backend starts successfully with the seeded database.

---

## 31. Recommended Implementation Order

### Phase 1 — Discovery

Before implementation:

- inspect every existing schema;
- inspect repository APIs;
- inspect current enums;
- inspect unique constraints;
- inspect auth credential creation;
- inspect the existing seed or migration setup;
- map the dependency order.

Do not invent fields or statuses.

### Phase 2 — Seed Infrastructure

- command;
- environment guard;
- seed configuration;
- stable identifiers;
- helper utilities;
- output summary.

### Phase 3 — Organization Context

- company users;
- credentials;
- company;
- memberships;
- teams;
- positions.

### Phase 4 — Candidate Catalog

- candidate users;
- candidate profiles;
- skills;
- candidate skills.

### Phase 5 — Hiring Scenarios

- candidate recommendations;
- processed recommendation states;
- candidate positions;
- optional history.

### Phase 6 — Validation

- relationship checks;
- idempotency;
- reset behavior;
- tests;
- final output.

---

## 32. Hard Rules

- Do not modify production behavior to make the seed work.
- Do not create schema fields solely for seed convenience.
- Do not bypass password hashing.
- Do not store plain-text credentials in the database.
- Do not create sessions by default.
- Do not call external services.
- Do not use random data for core identifiers or relationships.
- Do not duplicate records on repeated runs.
- Do not create `CandidatePosition` for rejected recommendations.
- Do not create `CandidatePosition` for review-later recommendations.
- Do not create recommendations for candidates already participating in the same position.
- Do not use statuses absent from the current backend.
- Do not claim completion without validating the final domain graph.

---

## 33. Required Final Report

When complete, report:

1. files created;
2. files modified;
3. scripts added;
4. environment protections;
5. seed credentials;
6. entities and counts created;
7. stable IDs or natural keys used;
8. idempotency strategy;
9. reset strategy;
10. domain scenarios covered;
11. recommendation and candidate-position relationships;
12. validation checks;
13. tests created;
14. commands executed;
15. command results;
16. blockers;
17. deviations from this specification and their justification.
# Orchestrator — Luque - Talent Matching Platform

## Project Overview

A B2B/B2C recruiting platform that accelerates the matching between candidates and open positions.
It replaces the inefficient LinkedIn hunting process with a structured, faster flow for both sides.

**Repo layout:**

```
/
├── back-end/    → Fastify API (Node.js + TypeScript + Drizzle ORM + PostgreSQL)
├── front-end/   → React SPA (Vite + TanStack Query + React Router + Zustand)
├── .docs/       → Architecture decisions, conventions, module definitions
└── .specs/      → Feature specs (SDD / VSDD format per feature)
```

---

## Agent Team

| Agent            | Responsibility                                          | When to invoke                         |
| ---------------- | ------------------------------------------------------- | -------------------------------------- |
| `spec-reader`    | Reads and parses `.docs/` and `.specs/`                 | FIRST — before any planning or coding  |
| `architect`      | Produces SDD/VSDD plans from spec summaries             | After `spec-reader`, before any coding |
| `backend-coder`  | Implements backend vertical slices (Fastify + Drizzle)  | After `architect` produces the SDD     |
| `frontend-coder` | Implements frontend vertical slices (React + TanStack)  | After `architect` produces the VSDD    |
| `reviewer`       | Reviews implementation against SDD/VSDD and conventions | After each coder finishes              |
| `test-writer`    | Writes unit/integration tests after review passes       | After `reviewer` returns APPROVED      |

---

## Orchestration Rules

1. **Never skip `spec-reader`** — every task starts by reading the relevant spec and docs.
2. **Never skip `architect`** — every implementation needs a written SDD (and VSDD if UI is involved) first.
3. **Scope strictly** — `backend-coder` only touches `back-end/src/modules/<entity>/`, `frontend-coder` only touches `front-end/src/modules/<entity>/`.
4. **Cross-module changes** — if a task requires touching more than one module, the architect must list each module explicitly. Each module is implemented and reviewed independently.
5. **Spec gaps** — if a spec is missing, ambiguous, or contradicts `.docs/`, STOP and ask the user before proceeding.
6. **Review gate** — `test-writer` is never invoked before `reviewer` returns APPROVED.

---

## Domain Model

### Roles

- **Candidate** — person looking for a job
- **Recruiter** — person who hunts and manages candidates inside a Company
- **Recruiter Manager** — manages recruiters within a Company
- **Admin** — platform-level admin

### Core Entities

| Entity                     | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| `User`                     | Base auth entity. Has a role (Candidate or Recruiter)                 |
| `Company`                  | Holds users and teams. Does not perform actions itself                |
| `CompanyMembership`        | Join table: User ↔ Company                                            |
| `CandidateProfile`         | Extended profile for a User with Candidate role                       |
| `CandidateSkill`           | Join table: CandidateProfile ↔ Skill (for filtering)                  |
| `Skill`                    | Master list of technical skills on the platform                       |
| `RecruiterProfile`         | Extended profile for a User with Recruiter role, belongs to a Company |
| `Team`                     | A team within a Company that wants to hire. Has Positions             |
| `Position`                 | An open job position owned by a Team                                  |
| `CandidatePosition`        | Relation between an active Position and a CandidateProfile            |
| `CandidatePositionStatus`  | Enum: the current step of a Candidate in a Position pipeline          |
| `CandidatePositionHistory` | Audit log of every status change for a CandidatePosition              |

### CandidatePositionStatus values (pipeline stages)

`SHORTLISTED` → `UNDER_REVIEW` → `INTERVIEW` → `OFFER` → `HIRED` | `REJECTED`

Alternative initial decision:

`DISCARDED`

---

## Back-end Architecture

### Module structure (`back-end/src/modules/<entity>/`)

```
<entity>/
  <entity>.routes.ts          → Fastify plugin — registers routes for this module
  <entity>.handler.ts         → Request handlers (thin — delegates to use-case or service)
  <entity>.service.ts         → Business logic / use-case orchestration
  <entity>.repository.ts      → All Drizzle queries. Only file allowed to touch the DB
  <entity>.schema.ts          → Drizzle table schema for this entity
  <entity>.dto.ts             → Zod schemas for request/response validation and TypeScript types
  index.ts           → export module
  <entity>.test.ts   → Integration tests for this module
```

### Conventions

- **Repository Pattern**: `repository.ts` is the only file that imports and queries Drizzle. Services call the repository, never the db directly.
- **Fastify Plugin per module**: every `routes.ts` exports a Fastify plugin via `export default fp(plugin)`.
- **Zod DTOs**: all request bodies and responses are validated with Zod. Types are inferred with `z.infer<typeof Schema>`.
- **No `any`**: TypeScript strict mode. Use `unknown` or proper generics.
- **Early returns**: validate and guard at the top of functions.
- **Naming**: `getUserById`, `isValidEmail`, `createPositionHandler` — verb-first for functions.

### Shared folders

```
back-end/src/
  db/              → Drizzle client instance + migrations
  plugins/         → Global Fastify plugins (auth, cors, error-handler)
  shared/          → Shared types, utils, constants
```

---

## Front-end Architecture

### Module structure (`front-end/src/modules/<entity>/`)

```
<entity>/
  components/        → React components scoped to this entity
  hooks/             → TanStack Query hooks (useQuery / useMutation)
  store/             → Zustand slice for this entity (if local state is needed)
  types.ts           → TypeScript types for this entity (aligned with back-end DTOs)
  api.ts             → Fetch functions called by hooks (axios or fetch wrapper)
```

### Conventions

- **TanStack Query for server state**: all API data lives in `useQuery` / `useMutation`. No manual fetch in components.
- **Zustand for UI/local state only**: not for server data. Slices are thin.
- **React Router for navigation**: loaders and actions when appropriate.
- **No inline styles**: Tailwind CSS utility classes only.
- **Component SRP**: one responsibility per component. Split early.
- **Naming**: `useCandidateProfile`, `PositionCard`, `isLoadingPositions`.

---

## SDD Format (used by `architect` for every backend task)

```
### SDD: <feature name>

- **Module**: `back-end/src/modules/<entity>/`
- **Type**: Feature | Bugfix | Refactor
- **Spec**: `.specs/<filename>`
- **Acceptance criteria**: (from spec)
- **Files to create/modify**:
  - `schema.ts` — (describe changes)
  - `dto.ts` — (request/response shapes)
  - `repository.ts` — (methods to add)
  - `service.ts` — (business logic)
  - `routes.ts` — (endpoints: METHOD /path)
  - `handler.ts` — (handler functions)
- **Cross-module dependencies**: (list or "none")
- **DB migrations needed**: yes | no
```

## VSDD Format (used by `architect` for every frontend task)

```
### VSDD: <feature name>

- **Module**: `front-end/src/modules/<entity>/`
- **Spec**: `.specs/<filename>`
- **Components to create/modify**: (list with purpose)
- **Hooks needed**: (useQuery / useMutation — describe each)
- **Zustand slice**: needed | not needed
- **Routes**: (path and component)
- **States to handle**: loading | empty | error | success
- **Cross-module dependencies**: (list or "none")
```

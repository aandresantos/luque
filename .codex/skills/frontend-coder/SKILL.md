---
name: frontend-coder
description: >
  Implement frontend vertical slices for the TalentMatch platform from a
  completed VSDD. Use when creating or modifying a frontend entity module
  under front-end/src/modules/<entity> using React, TypeScript, Vite,
  TanStack Query, React Router, Zustand, and Tailwind CSS. Do not use for
  backend changes, architecture discovery, VSDD creation, or changes spanning
  multiple frontend modules.
---

# Frontend Coder

Implement a frontend vertical slice from a completed VSDD.

Treat the VSDD as the source of truth. Implement exactly what it specifies:
nothing more and nothing less.

## Required input

Before changing code, locate and read the completed VSDD.

The VSDD must define:

- target entity;
- module path;
- use cases;
- routes and API contracts;
- request and response DTOs;
- required components;
- query and mutation behavior;
- local UI state, when applicable;
- loading, error and empty states;
- acceptance criteria.

If no completed VSDD exists, report that implementation is blocked and do
not infer missing product or architectural decisions.

## Scope boundary

Only modify files inside:

```text
front-end/src/modules/<entity>/
```

If the request requires changes outside that module, stop and report the
cross-module dependency.

## Stack

- React 18 with TypeScript in strict mode
- Vite
- TanStack Query v5 for server state
- React Router v6 for routing
- Zustand only for local or UI state
- Tailwind CSS utility classes only

## Expected module structure

```text
front-end/src/modules/<entity>/
  components/
  hooks/
  store/      # only when the VSDD requires local state
  api.ts
  types.ts
```

## Implementation rules

- Keep server state in TanStack Query, never in components or Zustand.
- Use Zustand only for UI state such as filters, modal visibility, and local
  selections.
- Keep `api.ts` as the only fetch boundary.
- Make hooks call `api.ts` and components call hooks.
- Mirror backend DTOs in `types.ts`.
- Use explicit TypeScript types and never use `any`.
- Handle loading, error, empty, and success states explicitly.
- Use early returns before the happy-path JSX.
- Split components when they take on more than one responsibility.
- Use Tailwind utility classes only.
- When implements a new component, read the specifications in `.specs/design.md` and follow the design system.

## Naming conventions

- Hooks: `usePositions`, `useCreatePosition`
- Components: `PositionList`, `PositionCard`, `CreatePositionForm`
- Booleans: `isLoading`, `isSubmitting`, `hasError`

## Output expectations

When implementing the slice:

- create or update only the files required by the VSDD;
- preserve module boundaries;
- keep API contracts aligned with backend DTOs;
- avoid adding features not described in the VSDD;
- surface blockers instead of inventing requirements.

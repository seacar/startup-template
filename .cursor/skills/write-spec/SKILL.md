---
name: write-spec
description: Writes a build spec grounded in the project's actual patterns. Use when the user says "write a spec", "spec this out", "plan this feature", or "create a build spec for X". Always reads existing code before writing so specs reflect real conventions.
---

# Write Spec

A good spec written here is handed directly to build-from-spec with zero clarification needed. Read first, write second — every spec must reflect real file paths, real patterns, and real conventions found in this codebase.

## Workflow

### Step 1 — Gather requirements

Ask before reading code. Keep it to 3–5 questions:

1. What is the feature and what problem does it solve?
2. Which layers are in scope? (backend / frontend / mobile / agent)
3. Who uses this? (end user, admin, another service, an agent)
4. Any known constraints? ("must use existing auth", "no new tables")
5. Any acceptance criteria already in mind?

### Step 2 — Read the platform docs, then the codebase

Before writing a single line, read the master platform documents first, then investigate the code. The platform docs define the constraints the spec must stay within.

**Read first:**

- `documentation/platform-business.md` — confirm the feature aligns with the product vision, user roles, and business rules. Note any relevant business rules or user journeys that apply.
- `documentation/platform-technical.md` — confirm the planned approach matches the architecture, data model, API conventions, and agent patterns. Note any constraints or prior decisions that apply.

If the feature contradicts either platform doc, flag it explicitly in the Open Questions section of the spec — do not silently deviate.

**Then check the codebase:**

- `ls backend/src/routers/` — naming and structure of existing routers
- `ls backend/tests/` — test file conventions
- `ls frontend/app/` — page/layout structure
- `ls frontend/components/ui/` — existing component patterns
- `ls agents/` — existing graph structure (if relevant)
- `ls documentation/build-specs/` — existing spec depth and format

**For backend features — read:**

- A similar existing router (e.g. `backend/src/routers/auth.py`)
- The test file for it (`backend/tests/test_auth.py`)
- `backend/src/config.py` — env/config access pattern
- `backend/src/main.py` — how routers are registered

**For frontend features — read:**

- A similar existing page (`frontend/app/<feature>/page.tsx`)
- Existing data-fetching pattern (server action vs API route vs Supabase direct)
- `frontend/types/supabase.ts` — generated DB types available

**For agent features — read:**

- An existing graph (`agents/<n>/graph.py`)
- Its State definition and checkpointer
- How the graph is invoked (FastAPI route? background job?)

**For Supabase/data — read:**

- `supabase/migrations/` — migration style
- RLS policies on related tables
- `frontend/types/supabase.ts` — what already exists

### Step 3 — Write the spec

Save to `documentation/build-specs/<feature-name>.md`:

- Frontmatter: name, status (Draft), created, updated, scope (backend | frontend | mobile | agent | full-stack)
- Summary (one or two sentences)
- Problem Statement
- Scope (Backend/Frontend/Mobile/Agent/AI/Database with yes/no and specifics)
- Requirements (numbered, testable)
- Acceptance Criteria (concrete pass/fail checks)
- Technical Outline with real paths only:
  - Database: new tables, RLS, type regen command
  - Backend: router, schemas, main.py, tests — follow existing patterns
  - Frontend: page, components, data access, state if needed
  - Agent (if applicable): location, state, nodes, graph, checkpointer, invocation, HITL
- Framework Constraints (non-negotiable checklist)
- Agent Instructions (explicit, ordered steps for autonomous implementation)
- Open Questions
- Documentation checklist

### Step 4 — Review and confirm

Present to user before saving. Confirm: scope, acceptance criteria, technical paths, and that Agent Instructions are explicit enough for autonomous implementation.

## Checklist

- [ ] Requirements gathered — scope, layers, constraints, acceptance criteria
- [ ] `platform-business.md` read — feature aligns with product vision and business rules
- [ ] `platform-technical.md` read — approach matches architecture and established patterns
- [ ] Codebase read — router, test, component, and schema patterns identified
- [ ] Spec uses real file paths — no invented conventions
- [ ] Framework Constraints section complete
- [ ] Agent Instructions are explicit and in correct order
- [ ] Open Questions listed for ambiguous items or platform doc conflicts
- [ ] Spec reviewed and approved by user
- [ ] Saved to `documentation/build-specs/<feature-name>.md`
- [ ] Ready to hand to build-from-spec

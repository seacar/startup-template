# Cursor Configuration Guide
> Next.js · FastAPI · Supabase · LangGraph · TypeScript · Python

---

## How It All Fits Together

Your `.cursor/` directory is a co-pilot configuration layer that sits on top of every project. Each piece has a distinct job:

```
.cursor/
├── rules/          ← ALWAYS-ON context injected into every agent interaction
├── commands/       ← ON-DEMAND workflows triggered with /slash in Composer
├── skills/         ← HOW-TO knowledge docs that commands reference
├── hooks/          ← AUTOMATION scripts that run after each agent turn
├── plans/          ← Saved implementation plans per feature
├── scratchpad.md   ← Agent working memory across loop iterations
└── hooks.json      ← Wires hook scripts to lifecycle events

documentation/
├── platform-business.md   ← MASTER: what the product is, who it serves, all features
├── platform-technical.md  ← MASTER: full architecture, stack decisions, system design
└── build-specs/           ← Feature-level specs derived from the platform docs
```

**Standard task flow:**
1. Trigger a **command** (`/plan`, `/spec`, `/build-from-spec`)
2. The command loads the relevant **skill** for detailed instructions
3. The agent works within always-on **rules** context
4. Long tasks use a **hook** to loop autonomously until `DONE`

---

## Platform Specs

Before any feature spec or agent instruction, two master documents define the ground truth for the entire product. Every build spec, agent rule, and technical decision flows down from these. They live in `documentation/` and are referenced by the agent whenever context about the broader product is needed.

---

### `documentation/platform-business.md` — Business & Functionality Spec

This is the **product bible**. It captures what the platform is, who it serves, how it works from a user perspective, and what every feature is supposed to do. It is written in business language — no code, no file paths. Agents read this to understand *intent* before implementing anything.

**When to update:** Any time a new feature, user type, workflow, or business rule is defined or changes. Update this before writing a feature build spec.

**Template:**

```markdown
---
name: platform-business
updated: <YYYY-MM-DD>
version: 0.x
---

# <Product Name> — Business & Functionality Spec

## Product Overview
What is this product? One paragraph, written as if explaining to a smart non-technical person.
What problem does it solve? Who benefits and how?

## Vision
Where is this product going? What does it look like at full maturity?

## Users & Roles
Define every type of person who interacts with the platform.

### <Role 1> (e.g. Hiring Manager)
- Who they are
- What they need to accomplish
- What they can see and do
- What they cannot do

### <Role 2>
- ...

## Core Features
Each top-level feature of the platform. No implementation details — describe behavior and outcome only.

### <Feature 1> (e.g. Candidate Evaluation)
**What it does:** ...
**Who uses it:** ...
**How it works (user perspective):** step-by-step from the user's point of view
**Business rules:** any constraints, logic, or edge cases the product must enforce
**Success looks like:** what a user sees when this feature works correctly

### <Feature 2>
...

## User Journeys
End-to-end flows that cut across multiple features. Describe the full experience.

### Journey 1: <Name>
1. User does X
2. System responds with Y
3. User decides Z
...

## Business Rules & Constraints
Rules that apply globally — not tied to one feature.
- ...

## Integrations & External Dependencies
Third-party services the product relies on and what they're used for.
- <Service>: <purpose>

## Out of Scope
What this product explicitly does not do (useful for keeping agents from overbuilding).
- ...

## Glossary
Define any domain-specific terms used throughout.
- **<Term>:** definition
```

---

### `documentation/platform-technical.md` — Technical Platform Spec

This is the **engineering bible**. It captures every architectural decision, the full stack, system design, data model, integration patterns, and the rationale behind key choices. Agents read this before writing any code or spec to ensure new work fits the existing architecture — not a generic pattern they invented.

**When to update:** Any time a stack decision, architectural pattern, data model, or integration changes. Update this before any build spec that introduces a new layer or service.

**Template:**

```markdown
---
name: platform-technical
updated: <YYYY-MM-DD>
version: 0.x
---

# <Product Name> — Technical Platform Spec

## Architecture Overview
Describe the system at the highest level. Include a diagram if possible (ASCII or Mermaid).

```
[Browser] → [Next.js Frontend] → [FastAPI Backend] → [Supabase DB]
                                        ↓
                               [LangGraph Agents]
                                        ↓
                               [Google GenAI / LLMs]
```

Why this architecture? What tradeoffs were made?

## Stack Decisions

### Backend
- **Runtime:** Python 3.10+ — reason: LangGraph/LangChain ecosystem
- **Framework:** FastAPI — reason: async-native, typed, fast
- **Database:** Supabase (Postgres) — reason: auth + RLS + real-time built in
- **Cache/Queue:** Redis (Upstash) — reason: serverless-friendly
- **AI orchestration:** LangGraph — reason: stateful agent loops with HITL
- **LLM provider:** Google GenAI (Gemini) — reason: cost + multimodal capability
- **Logging:** structlog — reason: structured JSON logs for observability

### Frontend
- **Framework:** Next.js 16 App Router — reason: server components, streaming, SEO
- **Language:** TypeScript strict mode
- **Styling:** Tailwind CSS 4
- **UI primitives:** Headless UI
- **State:** Zustand (client-only state; server state via server components)
- **Auth:** Supabase Auth (SSR via `@supabase/ssr`)

### Mobile (if applicable)
- **Framework:** Expo (React Native)
- **Styling:** NativeWind (shared Tailwind tokens)
- **State:** Zustand (shared with web where possible)

### Infrastructure
- **Hosting:** ...
- **CI/CD:** ...
- **Secrets:** ...
- **Monitoring:** ...

## Repository Structure
```
repo-root/
├── backend/
│   └── src/
│       ├── main.py          # FastAPI app, router registration
│       ├── config.py        # pydantic-settings env config
│       ├── routers/         # one file per feature domain
│       ├── schemas/         # Pydantic request/response models
│       ├── services/        # business logic, separated from routing
│       ├── agents/          # LangGraph graphs (or top-level /agents/)
│       └── prompts/         # .txt/.jinja2 prompt templates
├── frontend/
│   ├── app/                 # Next.js App Router pages and layouts
│   ├── components/
│   │   └── ui/              # Headless UI primitives and shared components
│   ├── lib/
│   │   └── supabase/        # server.ts and client.ts Supabase clients
│   ├── stores/              # Zustand stores
│   └── types/
│       └── supabase.ts      # generated — never hand-edit
├── mobile/ (if present)
├── agents/ (if top-level)
├── supabase/
│   └── migrations/          # SQL migration files
└── documentation/
```

## Data Model
Key tables and their relationships. Not a full schema dump — the important shapes and how they connect.

### `<table_name>`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| ... | ... | ... |

**RLS policies:**
- Users can read their own rows
- ...

**Relationships:**
- `<table>` → `<other_table>` via `<foreign_key>`

## API Design
Conventions and key endpoints. Agents must follow these patterns for all new routes.

### Conventions
- All routes prefixed: `/api/v1/`
- Auth: Supabase JWT via `Authorization: Bearer <token>` header
- Error format: `{ "detail": "message" }` (FastAPI default)
- Pagination: `?page=1&limit=20` with `{ data: [], total: n }` response

### Key Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/health | Health check |
| ... | ... | ... |

## Agent Architecture
How LangGraph agents are structured and deployed in this system.

### Agent Conventions
- Each agent lives in `agents/<n>/` with `state.py`, `nodes.py`, `graph.py`, `tools.py`
- State: TypedDict with typed fields, Annotated for append-only lists
- Checkpointer: MemorySaver (dev), AsyncPostgresSaver via Supabase (prod)
- Invocation: FastAPI background task OR direct call from route handler
- Human-in-the-loop: `interrupt()` at approval gates, resumed via `graph.invoke(Command(resume=...))`

### Deployed Agents
| Agent | Purpose | Invocation | HITL? |
|---|---|---|---|
| `<n>` | ... | ... | yes/no |

## Authentication & Authorization
How auth works end-to-end.

- Supabase Auth handles registration, login, session management
- Frontend: `@supabase/ssr` server client validates session in Server Components and middleware
- Backend: FastAPI dependency extracts and validates Supabase JWT on every protected route
- RLS: database-level enforcement — the application layer is a second line of defense, not the first

## Environment Variables
All required env vars across the system.

### Backend (`.env` / `pydantic-settings`)
| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend-only service key |
| `GOOGLE_API_KEY` | Google GenAI / Gemini |
| ... | ... |

### Frontend (`.env.local`)
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| ... | ... |

## Key Technical Decisions & Rationale
Decisions that aren't obvious — document the *why* so future agents don't undo them.

| Decision | Why |
|---|---|
| Server Components by default | Reduces client JS, improves TTFB, enables streaming |
| RLS over app-level auth | Defense in depth; prevents bugs from bypassing auth |
| Pydantic for all schemas | Type safety + validation + auto OpenAPI docs |
| structlog over print/logging | JSON output, structured fields, easy to query in prod |
| ... | ... |

## Known Constraints & Non-Obvious Rules
Things that will bite you if you don't know them.
- ...

## Future Architecture Considerations
Things we know we'll need but haven't built yet.
- ...
```

---

### How the Three Spec Layers Work Together

```
platform-business.md       ← WHY and WHAT (product, users, features, rules)
        ↓
platform-technical.md      ← HOW at system level (architecture, data model, patterns)
        ↓
build-specs/<feature>.md   ← HOW at feature level (specific files, endpoints, tests)
        ↓
/build-from-spec           ← Implementation
```

When writing a build spec with `/spec`, the agent reads both platform docs first to ensure the spec is consistent with the product vision and the established architecture. When implementing with `/build-from-spec`, the agent has the full context chain available.

**Practical rule:** If a decision contradicts `platform-technical.md`, it requires an explicit update to that doc before proceeding. The platform specs are the source of truth — build specs inherit from them, not the other way around.

---

## Rules

Rules live in `.cursor/rules/` as `.mdc` files. They inject persistent context into every interaction — you write them once and never repeat yourself.

### Frontmatter Controls

```yaml
---
description: Shown in Cursor UI
globs: backend/**/*.py     # auto-applies when agent touches matching files
alwaysApply: false         # true = injected into every single prompt
---
```

| Setting | Behavior |
|---|---|
| `alwaysApply: true` | Always injected — use for project-wide standards |
| `alwaysApply: false` + `globs` | Auto-injected when relevant files are touched |
| `alwaysApply: false`, no globs | Manual reference only |

---

### `core-standards.mdc` — `alwaysApply: true`

```markdown
---
description: Core project standards, commands, and workflow
alwaysApply: true
---

# Commands
- Backend: `cd backend && python -m pytest tests/` · `uvicorn src.main:app --reload`
- Frontend: `npm run dev` · `npm run build` · `npm run type-check` · `npm run lint`
- Mobile: `npx expo start` (from `mobile/`)

# Stack
- Backend: Python 3.10+, FastAPI, Supabase, Redis/Upstash, LangChain/LangGraph, Google GenAI
- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Headless UI, Zustand, Supabase
- Mobile: Expo (React Native), NativeWind, Zustand, Supabase
- Docs: All non-README documentation goes in `documentation/` as markdown

# Workflow
- Follow existing patterns in each directory. TypeScript for frontend/mobile, Python for backend.
- After changes: run type-check (frontend) and tests (backend) before marking done.
- API routes: backend in `backend/src/routers/`, frontend in `frontend/app/api/`.
- Prefer planning first, then build, then test, then update docs in `documentation/`.

# Agent-driven work
- "What to build" lives in `documentation/build-specs/`. Use build-from-spec skill to implement.
- For loops: use `.cursor/scratchpad.md` to track progress. Write DONE when goal is met.
```

---

### `backend-python.mdc` — `globs: backend/**/*.py`

```markdown
---
description: Python and FastAPI conventions
globs: backend/**/*.py
alwaysApply: false
---

# Backend (Python / FastAPI)
- Type hints and Pydantic for all request/response models. `src/` package layout.
- Routers in `src/routers/`, config in `src/config.py`.
- Async for all I/O-bound work: `async def` route handlers, `await` for Supabase/HTTP/Redis.
- Structured logging via `structlog` — never use `print()`.
- Tests in `backend/tests/test_<module>.py` with pytest. Fixtures in `conftest.py`.
- Env via `pydantic-settings` — never commit secrets. Reference `backend/.env.example`.
- Rate limiting via `slowapi`, CORS from config, API docs at `/docs`, health check at `/health`.
```

---

### `frontend-typescript.mdc` — `globs: frontend/**/*.ts,tsx`

```markdown
---
description: Next.js and TypeScript conventions
globs: frontend/**/*.ts,frontend/**/*.tsx
alwaysApply: false
---

# Frontend (Next.js / TypeScript)
- App Router: pages in `app/`, layouts in `layout.tsx`, API routes in `app/api/`.
- Server Components by default — add `"use client"` only when interactivity requires it.
- Tailwind for all styling. Headless UI primitives from `@/components/ui/`.
- Zustand for client state. Colocate component logic; keep components focused.
- Run `npm run type-check` after any set of multi-file changes.
```

---

### `agents-langgraph.mdc` — `globs: agents/**/*.py`

```markdown
---
description: LangGraph agent and graph conventions
globs: agents/**/*.py,backend/src/agents/**/*.py
alwaysApply: false
---

# LangGraph Conventions
- Always define a typed State TypedDict before building any graph.
- Use `StateGraph(State)` — never the untyped `Graph`.
- Node functions are pure: `def node(state: State) -> dict` returning only updated keys.
- Use `Annotated[list, operator.add]` for append-only fields (messages, reasoning_steps).
- Prefer `Command(goto=..., update=...)` over bare conditional edges for HITL flows.
- Interrupt with `interrupt("reason")` at approval gates — never block with sleep.
- Checkpointer: `MemorySaver` for dev, `AsyncPostgresSaver` (Supabase) for production.
- Structure: `agents/<name>/state.py`, `nodes.py`, `graph.py`, `tools.py`.
- Always add a `max_iterations` guard in recursive loops.
```

---

### `supabase.mdc` — `globs: frontend/**/*.ts,frontend/**/*.tsx,backend/**/*.py`

```markdown
---
description: Supabase client usage and RLS conventions
globs: frontend/**/*.ts,frontend/**/*.tsx,backend/**/*.py
alwaysApply: false
---

# Supabase Conventions

## Frontend
- Server client from `@/lib/supabase/server`, browser client from `@/lib/supabase/client`.
- Never use browser client in Server Components.
- Use `supabase.auth.getUser()` server-side — never trust `getSession()` alone.
- All DB mutations go through RLS — never bypass with service role key on client.

## Backend
- Use `supabase-py` async client for all DB operations.
- Service role key only in backend — never expose to frontend.
- Always handle `APIError`. Map `response.data` to Pydantic models.

## General
- RLS enabled on every table — no exceptions.
- Name policies clearly: "Users can read their own rows" not "policy_1".
- Regenerate types after any migration:
  `supabase gen types typescript --local > frontend/types/supabase.ts`
```

---

### `ai-prompting.mdc` — `globs: **/prompts/**,**/*prompt*.py`

```markdown
---
description: LLM prompt and system message conventions
globs: **/prompts/**,**/templates/**,**/*prompt*.py
alwaysApply: false
---

# LLM Prompt Conventions
- Store templates as `.txt` or `.jinja2` in `backend/src/prompts/`.
- Use `ChatPromptTemplate.from_messages()` for structured prompts.
- Always include a system message defining role, constraints, and output format.
- Use XML tags to delimit sections: `<context>`, `<instructions>`, `<examples>`.
- For structured output: `.with_structured_output(PydanticModel)` — no manual JSON parsing.
- Temperature: 0 for extraction/classification, 0.3–0.7 for generation.
- Log token usage in structured logs for cost tracking.
```

---

## Commands

Commands live in `.cursor/commands/` as markdown files. Type `/` in Composer (`Cmd+I`) to invoke them. They're saved macros — one slash loads a full multi-step workflow.

---

### `/plan` — Plan before coding

```markdown
# Plan

Create an implementation plan before writing any code.

1. Clarify: if vague, ask 1–2 short questions about scope and existing patterns.
2. Research: search codebase for relevant files (routers, components, tests, config).
3. Plan: produce a step-by-step plan with concrete file paths and brief descriptions.
4. Output: write plan in a markdown block. Offer to save to `.cursor/plans/<feature>.md`.
5. Wait: do not implement until user approves or says "go".

If user points to a build spec, use it as the source of requirements.
```

---

### `/spec` — Write a build spec

```markdown
# Spec

Write a new build spec in `documentation/build-specs/`. Use the write-spec skill.
```

---

### `/build-from-spec` — Implement a spec

```markdown
# Build from spec

Implement a feature from a build spec in `documentation/build-specs/`. Use the build-from-spec skill.
```

---

### `/test` — Run and fix tests

```markdown
# Test

Run tests and fix any failures.

1. Backend: `cd backend && python -m pytest tests/ -v` (single file when iterating).
2. Frontend: `npm run type-check` then `npm run lint`. Fix errors.
3. Targeted: if user specified a file or area, run only those tests first.
4. Report: summarize pass/fail and fixes. Update `.cursor/scratchpad.md` and write DONE when all pass.
```

---

### `/health-check` — Full stack verification

```markdown
# Health Check

Verify the entire stack builds, type-checks, lints, and passes tests. Use the stack-health-check skill.
```

---

### `/review` — Code review

```markdown
# Review

Perform a code review of current changes.

1. Scope: files mentioned by user, or `git diff --name-only`.
2. Check for:
   - Type safety (no `any`, proper Pydantic models, typed state)
   - Security (no secrets, RLS enforced, input validation)
   - Performance (N+1 queries, missing indexes, unnecessary re-renders)
   - Naming and consistency with existing patterns
   - Missing error handling
   - Test coverage gaps
3. Output: findings grouped by 🔴 Critical · 🟡 Warning · 🟢 Suggestion.
4. Fix: offer to fix Critical and Warning items immediately.
```

---

### `/agent` — Build a LangGraph agent

```markdown
# Agent

Build or extend a LangGraph agent.

1. Clarify: purpose, inputs, outputs, human-in-the-loop requirements.
2. State: define TypedDict in `agents/<n>/state.py` first. Get approval before nodes.
3. Nodes: implement each as a pure function in `agents/<n>/nodes.py`.
4. Graph: wire in `agents/<n>/graph.py` with edges and interrupt points.
5. Tools: any tools go in `agents/<n>/tools.py` using `@tool`.
6. Test: pytest covering happy path and at least one interrupt/resume flow.
7. Docs: add entry in `documentation/agents.md`.
```

---

### `/migrate` — Run a DB migration

```markdown
# Migrate

Run and verify a Supabase migration.

1. Find or create migration in `supabase/migrations/`.
2. Review SQL: RLS policies, indexes, FK constraints.
3. Apply: `supabase db reset` or `supabase migration up` locally.
4. Regenerate types: `supabase gen types typescript --local > frontend/types/supabase.ts`
5. Run backend tests touching affected tables.
6. Report: migration file, tables affected, type changes.
```

---

### `/docs` — Update documentation

```markdown
# Docs

Update documentation in `documentation/` to reflect recent changes.

1. Determine what changed and which docs are affected.
2. Update existing docs (API overview, setup, endpoints, env vars).
3. Add new docs if a feature deserves its own page.
4. If working from a spec, update its Status and Updated date.
```

---

## Skills

Skills live in `.cursor/skills/<name>/SKILL.md`. Commands reference them by name. The agent reads the skill at the start of a complex task and uses it as a checklist.

---

### `build-from-spec`

```markdown
---
name: build-from-spec
description: Implements a feature from a build spec in documentation/build-specs/. Use when the user says "build from spec", "implement the spec", or points to a spec file.
---

# Build from spec

## Workflow

1. Read the spec — open from `documentation/build-specs/`. If none given, list available or ask.
2. Plan — identify scope, list concrete tasks (files, changes, tests, docs). Save to `.cursor/plans/<feature>.md` and get approval.
3. Build — implement in order: database/API first, then frontend/mobile, then wiring. Follow `.cursor/rules/`.
4. Test — backend: `python -m pytest tests/`. Frontend: `npm run type-check && npm run lint`. Fix before marking done.
5. Docs — update `documentation/` per spec. Update spec Status and Updated date.

## Checklist
- [ ] Spec read and scope understood
- [ ] Plan created and approved
- [ ] Implementation matches Requirements and Acceptance criteria
- [ ] All tests pass
- [ ] Type-check and lint pass
- [ ] Documentation updated
- [ ] Spec status updated
```

---

### `long-running-agent-loop`

```markdown
---
name: long-running-agent-loop
description: Runs the agent in a loop until a verifiable goal is met. Use when the user says "iterate until tests pass", "keep going until it works", or "run until done".
---

# Long-running agent loop

## When to use
Task has a clear success signal: tests green, lint clean, or explicit DONE in scratchpad.

## Scratchpad
- Path: `.cursor/scratchpad.md`
- Stop signal: agent writes `DONE` on its own line when goal is met.

## With hooks (Cursor Nightly)
The `grind.js` stop hook re-fires the agent after each turn until DONE or max iterations.
Set the goal clearly — verifiable end states only:
- ✅ "Run tests until all pass"
- ✅ "Fix all TypeScript errors"
- ❌ "Make the code better"

## Without hooks (manual)
1. Ask agent to work toward goal and update scratchpad each turn.
2. When agent reports done, verify manually.
3. If still failing, paste output: "Still failing: [output]. Continue and update scratchpad."
4. Repeat until done.

## Best practices
- Verifiable goals only: tests, type-check, lint, DONE.
- Plan first for larger tasks.
- Start a new conversation when switching features.

## Checklist
- [ ] Goal is verifiable
- [ ] Scratchpad initialized with goal and context
- [ ] Agent updates scratchpad each iteration
- [ ] DONE written only when goal is confirmed met
```

---

### `write-spec`

```markdown
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
```bash
ls backend/src/routers/      # naming and structure of existing routers
ls backend/tests/            # test file conventions
ls frontend/app/             # page/layout structure
ls frontend/components/ui/   # existing component patterns
ls agents/                   # existing graph structure (if relevant)
ls documentation/build-specs/ # existing spec depth and format
```

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

```markdown
---
name: <feature-name>
status: Draft
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
scope: backend | frontend | mobile | agent | full-stack
---

# <Feature Name>

## Summary
One or two sentences. What does this do and why?

## Problem Statement
What is broken or missing without this feature?

## Scope
- Backend: yes/no — what specifically
- Frontend: yes/no — what specifically
- Mobile: yes/no — what specifically
- Agent/AI: yes/no — what specifically
- Database: yes/no — new tables, columns, or RLS changes

## Requirements
Numbered, testable statements. No vague language.
1. ...

## Acceptance Criteria
Concrete pass/fail checks.
- [ ] ...

## Technical Outline
> Real paths only. Cite what you found in Step 2.

### Database
- New tables: `table_name (col type, ...)` — follow `supabase/migrations/` style
- RLS policies: list explicitly
- Type regen: `supabase gen types typescript --local > frontend/types/supabase.ts`

### Backend
- Router: `backend/src/routers/<n>.py` — follow `backend/src/routers/<existing>.py`
- Schemas: `backend/src/schemas/<n>.py`
- Register in: `backend/src/main.py`
- Tests: `backend/tests/test_<n>.py` — follow `conftest.py` fixture pattern

### Frontend
- Page: `frontend/app/<path>/page.tsx` — Server Component unless interactivity required
- Components: `frontend/components/<n>/`
- Data access: server action in `actions.ts` OR Supabase server client
- State: `frontend/stores/<n>.ts` only if client state is necessary

### Agent (if applicable)
- Location: `agents/<n>/` or `backend/src/agents/<n>/`
- State: `state.py` — TypedDict, Annotated for append-only lists
- Nodes: `nodes.py` — pure functions returning dict
- Graph: `graph.py` — StateGraph, edges, interrupt points
- Checkpointer: MemorySaver (dev) / AsyncPostgresSaver (prod)
- Invocation: how is this triggered?
- HITL: list interrupt() points

### Framework Constraints (non-negotiable)
- [ ] Backend routes use `async def` for all I/O-bound operations
- [ ] All request/response bodies are Pydantic models
- [ ] Frontend Server Components by default — `"use client"` only when required
- [ ] RLS enabled on all new tables before any data access
- [ ] No secrets in code — env vars via pydantic-settings / NEXT_PUBLIC_ conventions
- [ ] Tests written alongside implementation
- [ ] structlog for all backend logging
- [ ] No `any` in TypeScript

## Agent Instructions
Explicit, ordered steps for autonomous implementation.
1. Start with database migration. Run locally before any application code.
2. Regenerate TypeScript types immediately after migration.
3. Build and test backend before touching frontend.
4. Follow exact file paths from Technical Outline — do not invent new conventions.
5. Run `pytest tests/test_<n>.py -v` after backend before moving to frontend.
6. Run `npm run type-check` after each set of frontend changes.
7. Update `.cursor/scratchpad.md` with progress. Write DONE only when all criteria pass.

## Open Questions
Decisions needed before or during implementation. Agent stops and asks if it hits these.
- ...

## Documentation
- [ ] Update `documentation/` with new endpoints or behavior
- [ ] Update spec status to Complete and set updated date
```

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
```

---

### `stack-health-check`

```markdown
---
name: stack-health-check
description: Verifies every layer of the stack builds, type-checks, lints, and passes tests. Use when the user says "check the whole stack", "make sure everything builds", "full health check", or before a deploy or PR merge.
---

# Stack Health Check

Systematically verify each layer in dependency order. Fix blocking failures before moving to the next layer — a broken type in Layer 0 will cause phantom failures in Layer 3.

**Order: Database types → Backend → Agents → Frontend → Mobile**

## Pre-Flight

```bash
pwd                                     # confirm repo root
ls -d backend/ frontend/ mobile/ agents/ 2>/dev/null  # identify layers
git status --short                      # note uncommitted changes
ls backend/.venv && ls frontend/node_modules          # confirm deps installed
```

Install missing deps before running checks:
```bash
cd backend && pip install -r requirements.txt --break-system-packages
cd frontend && npm install
```

Initialize scratchpad:
```markdown
# Stack Health Check — <date>

## Status
- [ ] Layer 0: Database types
- [ ] Layer 1: Backend
- [ ] Layer 2: Agents
- [ ] Layer 3: Frontend
- [ ] Layer 4: Mobile

## Findings
```

---

## Layer 0 — Database Types

```bash
supabase gen types typescript --local > /tmp/supabase-types-fresh.txt
diff /tmp/supabase-types-fresh.txt frontend/types/supabase.ts
```

Pass: no diff. Fail: regenerate immediately, then continue.
```bash
supabase gen types typescript --local > frontend/types/supabase.ts
```

If Supabase CLI unavailable or no local DB, note it and continue.

---

## Layer 1 — Backend

```bash
# 1a. Import check
cd backend && python -c "from src.main import app; print('✅ imports OK')"

# 1b. Type check (if mypy configured)
python -m mypy src/ --ignore-missing-imports --no-error-summary

# 1c. Lint
python -m ruff check src/

# 1d. Tests
python -m pytest tests/ -v --tb=short

# 1e. Server startup (optional)
timeout 5 uvicorn src.main:app --host 127.0.0.1 --port 8001 &
sleep 2 && curl -s http://127.0.0.1:8001/health && kill %1
```

Fix test failures: read the failing test and the code under test. Fix the code, not the test, unless the test is wrong. Re-run the specific file, then the full suite.

**Pass criteria:** imports clean · all tests pass · lint clean · health responds

---

## Layer 2 — Agents

```bash
# Import check for all graphs
cd backend
python -c "
import importlib, pathlib
for p in list(pathlib.Path('agents').glob('*/graph.py')):
    mod = str(p).replace('/', '.').replace('.py', '')
    try:
        importlib.import_module(mod); print(f'✅ {mod}')
    except Exception as e:
        print(f'❌ {mod}: {e}')
"

# Type check
python -m mypy agents/ --ignore-missing-imports 2>/dev/null

# Agent tests
python -m pytest tests/test_agent*.py tests/agents/ -v --tb=short 2>/dev/null

# Graph compilation (adjust module names)
python -c "from agents.<name>.graph import build_graph; g = build_graph(); print('✅', type(g))"
```

**Pass criteria:** all graphs import · agent tests pass · graphs compile without error

---

## Layer 3 — Frontend

```bash
cd frontend

# Type check (most important — fix all errors before continuing)
npm run type-check

# Lint
npm run lint

# Build (catches SSR and tree-shaking errors type-check misses)
npm run build

# Tests (if configured)
npm run test 2>/dev/null || echo "No test script"
```

If type errors reference `supabase.ts`: re-run Layer 0, then re-run type-check.

Common build failures:
- `window`/`document` in Server Component → add `"use client"`
- Missing env var → check `.env.local`
- Dynamic import issue → check `next.config.js`

**Pass criteria:** type-check exits 0 · lint exits 0 · build completes · tests pass

---

## Layer 4 — Mobile (if `mobile/` exists)

```bash
cd mobile

npx tsc --noEmit
npm run lint 2>/dev/null || npx eslint . --ext .ts,.tsx
npx expo export --platform ios --dev 2>&1 | tail -20
```

**Pass criteria:** no TypeScript errors · lint clean · Expo export completes

---

## Final Report

```markdown
# Stack Health Check Report — <date>

| Layer | Status | Notes |
|---|---|---|
| Database types | ✅ / ⚠️ / ❌ | |
| Backend | ✅ / ⚠️ / ❌ | |
| Agents | ✅ / ⚠️ / ❌ | |
| Frontend | ✅ / ⚠️ / ❌ | |
| Mobile | ✅ / ⚠️ / ❌ | N/A if absent |

## Fixed
- [failures encountered and resolved]

## Remaining Issues
- [anything requiring human decision]

## Warnings
- [non-blocking: lint warnings, skipped optional checks]

DONE
```

**Status:** ✅ all pass · ⚠️ passes with warnings or skipped check · ❌ blocking failure

## Checklist
- [ ] Pre-flight complete — layers identified, deps confirmed
- [ ] Layer 0: types verified or regenerated
- [ ] Layer 1: backend imports, tests, lint pass
- [ ] Layer 2: agent graphs import and compile
- [ ] Layer 3: frontend type-check, lint, build pass
- [ ] Layer 4: mobile checked (if present)
- [ ] Report written and presented
- [ ] DONE written to scratchpad
```

---

## Hooks

Hooks run after each agent turn and can reinject a follow-up to keep the loop alive. Requires **Cursor Nightly** (Settings → Beta → Update channel → Nightly).

### `hooks.json`

```json
{
  "version": 1,
  "hooks": {
    "stop": [{ "command": "node .cursor/hooks/grind.js" }]
  }
}
```

### `hooks/grind.js`

```js
#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const MAX_ITERATIONS = 10;
const SCRATCHPAD_PATH = path.join(process.cwd(), ".cursor", "scratchpad.md");

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    if (data.status !== "completed" || (data.loop_count || 0) >= MAX_ITERATIONS) {
      process.exit(0);
      return;
    }
    const scratchpad = fs.existsSync(SCRATCHPAD_PATH)
      ? fs.readFileSync(SCRATCHPAD_PATH, "utf8")
      : "";
    if (scratchpad.includes("DONE")) {
      process.exit(0);
      return;
    }
    const n = (data.loop_count || 0) + 1;
    console.log(JSON.stringify({
      followup_message: `[Iteration ${n}/${MAX_ITERATIONS}] Continue toward the goal. Update .cursor/scratchpad.md with progress. Write DONE on its own line when complete.`
    }));
  } catch (e) {
    process.exit(0);
  }
});
```

**How to use:** Give the agent a verifiable goal. It will update `scratchpad.md` each iteration and write `DONE` when done. You watch the scratchpad; `grind.js` handles the looping.

- ✅ "Run tests until all pass"
- ✅ "Fix all TypeScript errors and make the build green"
- ❌ "Make the code better" (no verifiable end state)

To increase iterations for complex tasks, change `MAX_ITERATIONS = 15`.

---

## Scratchpad

`.cursor/scratchpad.md` is agent working memory across loop iterations. Reset it at the start of each new long task.

```markdown
# Goal: [specific, verifiable goal]

## Context
- Backend test command: cd backend && python -m pytest tests/test_<module>.py -v
- Frontend type check: cd frontend && npm run type-check

## Progress

### Iteration 1
- [ ] Task A
- [ ] Task B

## Results

DONE
```

The word `DONE` on its own line is the termination signal `grind.js` checks for. Do not edit the scratchpad mid-loop.

---

## MCP Servers

MCP servers give Cursor real tool access — query your actual database, reference GitHub issues, access the filesystem. Configure in `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project).

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest",
               "--supabase-url", "https://YOUR_PROJECT.supabase.co",
               "--supabase-key", "YOUR_SERVICE_ROLE_KEY"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token" }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/sean/projects"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres",
               "postgresql://USER:PASS@HOST:5432/postgres"]
    }
  }
}
```

With Supabase MCP active you can say: *"Look at my actual schema and write a migration to add a `status` column to `jobs`"* — and the agent will. Use read-only DB credentials for Postgres MCP unless you need writes.

---

## Notepads & Doc Indexing

**Notepads** (Settings → Features → Notepads) persist context across projects. Reference with `@notepad-name`.

| Notepad | Contents |
|---|---|
| `my-stack` | Stack declaration + preferred libraries |
| `supabase-schema` | Current schema or key table definitions |
| `agent-state-patterns` | Reusable LangGraph state patterns |
| `swarmhire-context` | SwarmHire architecture overview |
| `seacar-clients` | Common client types and their stacks |

**Doc indexing** (Settings → Features → Docs → Add new doc):

- `https://langchain-ai.github.io/langgraph/` — keep current, changes fast
- `https://supabase.com/docs`
- `https://fastapi.tiangolo.com`
- `https://nextjs.org/docs`
- `https://docs.pydantic.dev`

Reference in prompts with `@docs langgraph` and Cursor pulls live indexed content.

---

## Workflow Recipes

**New LangGraph agent from scratch**
```
/spec → describe the agent → approve spec
/build-from-spec → point to spec
Agent: State → nodes → graph → tests
If tests fail: /test (grind.js loops automatically)
```

**New API endpoint (FastAPI + Next.js)**
```
/plan "add POST /api/jobs/evaluate"
Approve plan → "implement the plan"
/test → /docs
```

**Autonomous test fixing**
```
Reset scratchpad with goal header
"Run backend tests. Fix failures. Update scratchpad. Write DONE when all pass."
grind.js loops up to 10x — watch scratchpad for progress
```

**Pre-PR / pre-deploy**
```
/health-check
Fix all 🔴 Critical findings
/review → fix remaining warnings
```

**New client project onboarding (Fractional CTO)**
```
Copy base .cursor/ config into project
Update core-standards.mdc with client stack
Add @client-context notepad
/spec → first feature
/build-from-spec
```

---

## Folder Structure

```
.cursor/
├── rules/
│   ├── core-standards.mdc          # alwaysApply: true
│   ├── backend-python.mdc          # auto: backend/**/*.py
│   ├── frontend-typescript.mdc     # auto: frontend/**/*.ts,tsx
│   ├── agents-langgraph.mdc        # auto: agents/**/*.py
│   ├── supabase.mdc                # auto: frontend + backend globs
│   └── ai-prompting.mdc            # auto: prompts/**/*
├── commands/
│   ├── plan.md                     # /plan
│   ├── spec.md                     # /spec
│   ├── build-from-spec.md          # /build-from-spec
│   ├── test.md                     # /test
│   ├── health-check.md             # /health-check
│   ├── review.md                   # /review
│   ├── agent.md                    # /agent
│   ├── migrate.md                  # /migrate
│   └── docs.md                     # /docs
├── skills/
│   ├── build-from-spec/SKILL.md
│   ├── long-running-agent-loop/SKILL.md
│   ├── write-spec/SKILL.md
│   └── stack-health-check/SKILL.md
├── hooks/
│   └── grind.js
├── plans/
│   └── <feature-name>.md
├── scratchpad.md
└── hooks.json

documentation/
├── platform-business.md         # MASTER: product vision, users, features, business rules
├── platform-technical.md        # MASTER: architecture, stack, data model, API conventions
├── build-specs/
│   ├── TEMPLATE.md
│   └── <feature-name>.md
└── <other-docs>.md
```

---

## Quick Reference

| I want to... | Use |
|---|---|
| Define or update the product vision | Edit `documentation/platform-business.md` |
| Define or update architecture/stack | Edit `documentation/platform-technical.md` |
| Plan before coding | `/plan` → approve → "implement" |
| Write a feature spec | `/spec` (reads platform docs first) |
| Build from a spec | `/build-from-spec` |
| Fix failing tests autonomously | `/test` + grind.js |
| Verify the whole stack | `/health-check` |
| Review before a PR | `/review` |
| Build a LangGraph agent | `/agent` |
| Run a DB migration | `/migrate` |
| Update docs | `/docs` |
| Give agent real DB access | Supabase MCP |
| Reuse context across projects | Notepads |
| Keep agent current on LangGraph | Index docs in Settings |

---

*Save as `.cursor/GUIDE.md` and reference with `@GUIDE` from any prompt.*

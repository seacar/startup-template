---
name: stack-health-check
description: Verifies every layer of the stack builds, type-checks, lints, and passes tests. Use when the user says "check the whole stack", "make sure everything builds", "full health check", or before a deploy or PR merge.
---

# Stack Health Check

Systematically verify each layer in dependency order. Fix blocking failures before moving to the next layer — a broken type in Layer 0 will cause phantom failures in Layer 3.

**Order: Database types → Backend → Agents → Frontend → Mobile**

## Pre-Flight

- Confirm repo root: `pwd`
- Identify layers: `ls -d backend/ frontend/ mobile/ agents/ 2>/dev/null`
- Note uncommitted changes: `git status --short`
- Confirm deps: `ls backend/.venv && ls frontend/node_modules`

Install missing deps before running checks:

- `cd backend && pip install -r requirements.txt` (or `--break-system-packages` if needed)
- `cd frontend && npm install`

Initialize scratchpad with Status checkboxes for Layer 0–4 and a Findings section.

## Layer 0 — Database Types

- `supabase gen types typescript --local > /tmp/supabase-types-fresh.txt`
- `diff /tmp/supabase-types-fresh.txt frontend/types/supabase.ts`

Pass: no diff. Fail: regenerate with `supabase gen types typescript --local > frontend/types/supabase.ts` then continue. If Supabase CLI unavailable or no local DB, note it and continue.

## Layer 1 — Backend

- Import check: `cd backend && python -c "from src.main import app; print('✅ imports OK')"`
- Type check (if mypy configured): `python -m mypy src/ --ignore-missing-imports --no-error-summary`
- Lint: `python -m ruff check src/`
- Tests: `python -m pytest tests/ -v --tb=short`
- Optional server startup: `timeout 5 uvicorn src.main:app --host 127.0.0.1 --port 8001 &` then `curl -s http://127.0.0.1:8001/health`

Fix test failures: read the failing test and the code under test. Fix the code, not the test, unless the test is wrong. Re-run the specific file, then the full suite.

**Pass criteria:** imports clean · all tests pass · lint clean · health responds

## Layer 2 — Agents

- Import check for all graphs (adjust path: `agents/` or `backend/` as in repo)
- Agent tests: `python -m pytest tests/test_agent*.py tests/agents/ -v --tb=short 2>/dev/null`
- Graph compilation for each graph

**Pass criteria:** all graphs import · agent tests pass · graphs compile without error

## Layer 3 — Frontend

- `cd frontend`
- `npm run type-check` (fix all errors before continuing)
- `npm run lint`
- `npm run build`
- `npm run test` if configured

If type errors reference `supabase.ts`: re-run Layer 0, then re-run type-check.

**Pass criteria:** type-check exits 0 · lint exits 0 · build completes · tests pass

## Layer 4 — Mobile (if `mobile/` exists)

- `cd mobile`
- `npx tsc --noEmit`
- `npm run lint` or `npx eslint . --ext .ts,.tsx`
- `npx expo export --platform ios --dev 2>&1 | tail -20`

**Pass criteria:** no TypeScript errors · lint clean · Expo export completes

## Final Report

Write a report with:

- Table: Layer | Status (✅ / ⚠️ / ❌) | Notes
- Fixed: failures encountered and resolved
- Remaining Issues: anything requiring human decision
- Warnings: non-blocking (lint warnings, skipped optional checks)
- Write DONE to scratchpad

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

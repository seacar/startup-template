# Agent setup: rules, skills, and doc-driven builds

This project is set up for Cursor’s agent with **expanded rules**, **skills** for planning/build/test/docs, and **doc-driven builds** so you can define what to build in documentation and have agents implement it.

Reference: [Best practices for coding with agents](https://cursor.com/blog/agent-best-practices) (Cursor blog).

---

## Rules (`.cursor/rules/`)

- **core-standards.mdc** — Always applied: stack, commands, workflow, where docs live, build specs and scratchpad.
- **backend-python.mdc** — When editing `backend/**/*.py`: FastAPI, tests, env, API conventions.
- **frontend-typescript.mdc** — When editing `frontend/**/*.ts(x)`: Next.js, Tailwind, UI patterns, type-check.

Rules are static context the agent sees every conversation. Keep them short; point to files instead of pasting long content.

---

## Build specs (what to build)

Authoritative “what to build” lives in **`documentation/build-specs/`**.

1. **Template:** Copy `documentation/build-specs/TEMPLATE.md` to `documentation/build-specs/<feature>.md`.
2. **Fill in:** Summary, Scope, Requirements, Acceptance criteria, Technical outline, optional Agent instructions.
3. **Run the agent:** Use the **Build from spec** skill or the `/build-from-spec` command and point to your spec. The agent will plan → build → test → update docs.

---

## Skills (`.cursor/skills/`)

- **build-from-spec** — Reads a spec in `documentation/build-specs/`, then plans, implements, tests, and updates docs. Use when you say “build from spec” or point to a spec file.
- **long-running-agent-loop** — Keeps the agent iterating until a verifiable goal (e.g. all tests pass or `DONE` in scratchpad). Use when you say “iterate until tests pass” or “keep going until done.”

Skills are loaded when the agent decides they’re relevant; no need to tag them every time.

---

## Commands (`.cursor/commands/`)

Invoke with `/` in the agent input:

- **/plan** — Plan before coding: clarify, research codebase, output a step-by-step plan, wait for approval.
- **/build-from-spec** — Implement from a spec in `documentation/build-specs/` (plan → build → test → docs).
- **/test** — Run backend tests and frontend type-check/lint; fix failures; optionally update scratchpad with `DONE`.
- **/docs** — Update `documentation/` to reflect recent changes.

---

## Long-running loop (iterate until done)

1. **Scratchpad:** `.cursor/scratchpad.md` — Agent updates progress here; when it writes `DONE` (e.g. when tests pass), the loop can stop.
2. **Hooks (optional):** For automatic re-runs until the goal is met, you need Cursor **Nightly** (Settings → Beta → Update channel → Nightly). Then:
   - `.cursor/hooks.json` configures a `stop` hook.
   - `.cursor/hooks/grind.js` reads the agent status and, if the goal isn’t met and iterations remain, sends a follow-up so the agent continues. When the scratchpad contains `DONE` or max iterations are reached, the hook stops sending follow-ups.

Without hooks, you can still drive the loop manually: ask the agent to continue, run tests, and repeat until green, then ask it to write `DONE` in the scratchpad.

---

## Quick start

1. **One-off feature from a spec:** Create `documentation/build-specs/my-feature.md` from the template, fill it in, then say: “Build from spec: documentation/build-specs/my-feature.md” or use `/build-from-spec`.
2. **Plan first:** Use `/plan` or Plan Mode (Shift+Tab), approve the plan, then ask the agent to implement.
3. **Iterate until tests pass:** Say “Implement X and iterate until all tests pass”; ensure `.cursor/scratchpad.md` exists; the agent (and optionally the hook) will loop until tests pass and scratchpad has `DONE`.

---
name: build-from-spec
description: Implements a feature by reading a build spec in documentation/build-specs/, then planning, building, testing, and updating docs. Use when the user wants to build something from a written spec, points to a build spec file, or says "build from spec" or "implement the spec."
---

# Build from spec

Implement a feature from a build spec document. Specs live in `documentation/build-specs/` and define **what** to build; the agent handles **how** (plan → build → test → docs).

## When to use

- User says "build from spec", "implement the spec", or points to a file in `documentation/build-specs/`.
- User wants to implement a feature that has a spec in `documentation/build-specs/` (e.g. `documentation/build-specs/my-feature.md`).

## Workflow

1. **Read the spec**  
   Open the specified (or discovered) build spec under `documentation/build-specs/`. If none is given, ask which spec to use or list available specs.

2. **Plan**  
   - Identify scope (backend, frontend, mobile, docs).  
   - List concrete tasks: new files, changes to existing files, tests, doc updates.  
   - Reference sections: Summary, Scope, Requirements, Acceptance criteria, Technical outline, Agent instructions.  
   - Optionally save the plan to `.cursor/plans/<feature>.md` and get user approval before coding.

3. **Build**  
   - Implement in order: data/API first, then frontend/mobile, then wiring.  
   - Follow project rules: `backend/` (Python/FastAPI), `frontend/` (Next.js/TypeScript), `documentation/` for new docs.  
   - Apply any "Agent instructions" from the spec.

4. **Test**  
   - Backend: add or extend tests in `backend/tests/`; run `python -m pytest tests/` (or the relevant test file).  
   - Frontend: run `npm run type-check` and `npm run lint`; add tests if the spec or project standards require it.  
   - Fix failures before marking the spec done.

5. **Documentation**  
   - Update or add docs in `documentation/` as specified in the spec (Technical outline / Docs).  
   - Update the spec’s Status and Updated date if the spec file includes those fields.

## Spec template

If the user wants to create a new spec, use the template at `documentation/build-specs/TEMPLATE.md`. Copy it to `documentation/build-specs/<feature-name>.md` and fill in Summary, Scope, Requirements, Acceptance criteria, Technical outline, and optional Agent instructions.

## Checklist (for the agent)

- [ ] Spec read and scope understood  
- [ ] Plan created (and optionally saved to `.cursor/plans/`)  
- [ ] Implementation matches spec (Requirements + Acceptance criteria)  
- [ ] Backend and/or frontend tests run and pass  
- [ ] Type-check/lint run and pass where applicable  
- [ ] Documentation updated per spec  
- [ ] Spec status/date updated if applicable  

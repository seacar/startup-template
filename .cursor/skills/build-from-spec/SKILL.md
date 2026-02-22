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

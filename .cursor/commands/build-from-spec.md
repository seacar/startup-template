# Build from spec

Implement a feature from a build spec in `documentation/build-specs/`.

1. **Locate spec:** Use the path given by the user, or list files in `documentation/build-specs/` and pick the one they mean (or ask).
2. **Read spec:** Open the spec and note Summary, Scope, Requirements, Acceptance criteria, Technical outline, and any Agent instructions.
3. **Plan:** Create a short implementation plan (files to add/change, order of work). Optionally save to `.cursor/plans/<feature>.md` and get approval.
4. **Build:** Implement backend (routers, models, tests) then frontend (pages, components, types) then wiring. Follow project rules in `.cursor/rules/`.
5. **Test:** Run backend tests (`cd backend && python -m pytest tests/`) and frontend type-check/lint (`cd frontend && npm run type-check && npm run lint`). Fix any failures.
6. **Docs:** Update or add docs in `documentation/` as specified in the spec. Update the spec's Status/Updated if present.
7. **Summarize:** List what was implemented and where; confirm acceptance criteria are met.

Use the **build-from-spec** skill for full checklist and details.

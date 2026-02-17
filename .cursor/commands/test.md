# Test (run and fix)

Run the relevant tests and fix any failures. Prefer running a single test file when iterating for speed.

1. **Backend:** From repo root: `cd backend && python -m pytest tests/ -v` (or `tests/test_<module>.py` for one file). Fix failures; re-run until green.
2. **Frontend:** From repo root: `cd frontend && npm run type-check` then `npm run lint`. Fix any errors.
3. **Targeted:** If the user specified a file or area (e.g. "auth tests"), run only those tests first.
4. **Report:** Summarize pass/fail and any fixes made. If the user asked to "iterate until tests pass", update `.cursor/scratchpad.md` and write `DONE` when all pass (for long-running loop).

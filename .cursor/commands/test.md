# Test

Run tests and fix any failures.

1. Backend: `cd backend && python -m pytest tests/ -v` (single file when iterating).
2. Frontend: `npm run type-check` then `npm run lint`. Fix errors.
3. Targeted: if user specified a file or area, run only those tests first.
4. Report: summarize pass/fail and fixes. Update `.cursor/scratchpad.md` and write DONE when all pass.

# Review

Perform a code review of current changes.

1. **Scope:** files mentioned by user, or `git diff --name-only`.
2. **Check for:**
   - Type safety (no `any`, proper Pydantic models, typed state)
   - Security (no secrets, RLS enforced, input validation)
   - Performance (N+1 queries, missing indexes, unnecessary re-renders)
   - Naming and consistency with existing patterns
   - Missing error handling
   - Test coverage gaps
3. **Output:** findings grouped by 🔴 Critical · 🟡 Warning · 🟢 Suggestion.
4. **Fix:** offer to fix Critical and Warning items immediately.

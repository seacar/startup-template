# Build spec: [Feature or epic name]

**Status:** Draft | In progress | Done  
**Owner:**  
**Created:** YYYY-MM-DD  
**Updated:** YYYY-MM-DD  

---

## 1. Summary

One or two sentences describing what will be built and why.

---

## 2. Scope

- **In scope:** List what is included (e.g. API endpoints, UI screens, data model changes).
- **Out of scope:** List what is explicitly not included in this spec (e.g. “No mobile UI in this phase”).

---

## 3. Requirements

### Functional

- [ ] Requirement 1 (clear, testable).
- [ ] Requirement 2.
- [ ] …

### Non-functional (if relevant)

- Performance: e.g. “List endpoint &lt; 200ms p95.”
- Security: e.g. “Auth required; RLS on new tables.”

---

## 4. Acceptance criteria

- Given [context], when [action], then [observable outcome].
- Repeat for each behavior that defines “done.”

---

## 5. Technical outline

- **Backend:** New routers, models, Supabase migrations, env vars.
- **Frontend:** New pages, components, API usage, state.
- **Mobile:** If applicable.
- **Docs:** Which docs to add or update in `documentation/`.

---

## 6. References

- Links to Figma, Linear issues, or other docs.
- Pointers to existing code to extend (e.g. `backend/src/routers/`, `frontend/app/`).

---

## 7. Agent instructions (optional)

- Any specific patterns, naming, or constraints for the agent (e.g. “Use existing `Button` from `@/components/ui`”, “Follow `backend/tests/` style for new tests”).

---

*Copy this template to a new file under `documentation/build-specs/` (e.g. `documentation/build-specs/my-feature.md`), fill it in, then use the **Build from spec** skill or `/build-from-spec` to have the agent plan, build, test, and update docs from this spec.*

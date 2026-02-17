# Plan (Plan Mode workflow)

Create an implementation plan for the current task **before** writing code.

1. **Clarify:** If the request is vague, ask 1–2 short clarifying questions (scope, backend vs frontend, existing patterns).
2. **Research:** Search the codebase for relevant files (routers, components, tests, config) and list them.
3. **Plan:** Produce a step-by-step plan with:
   - Concrete file paths to create or modify
   - Brief description of each step
   - Dependencies between steps (e.g. "API first, then frontend")
4. **Output:** Write the plan in a markdown block. Optionally offer to save it to `.cursor/plans/<name>.md` for approval.
5. **Wait:** Do not start implementing until the user approves the plan (or says "go" / "implement").

If the user pointed to a build spec in `documentation/build-specs/`, use that spec as the source of requirements and acceptance criteria for the plan.

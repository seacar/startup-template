---
name: long-running-agent-loop
description: Runs the agent in a loop until a verifiable goal is met (e.g. all tests pass, scratchpad contains DONE). Use when the user wants the agent to iterate until tests pass, until a checklist is complete, or to "keep going until done."
---

# Long-running agent loop

Run the agent repeatedly until a **verifiable goal** is met. Uses `.cursor/scratchpad.md` for progress and a stop condition (e.g. tests pass or scratchpad contains `DONE`).

## When to use

- User says "iterate until all tests pass", "keep going until it works", "run until done", or similar.
- Task has a clear success signal: tests green, lint/type-check clean, or explicit "DONE" in scratchpad.

## Setup (optional): hooks

For fully autonomous looping, Cursor can run a **stop hook** after each agent turn. This requires the **Nightly** channel (Settings → Beta → Update channel → Nightly).

1. Create `.cursor/hooks.json`:

```json
{
  "version": 1,
  "hooks": {
    "stop": [{ "command": "node .cursor/hooks/grind.js" }]
  }
}
```

2. Create `.cursor/hooks/grind.js` (Node) or use the Bun/TS example in the Cursor blog. The script reads JSON from stdin and may output `{"followup_message": "…"}` to send a follow-up and continue the loop.

## Scratchpad

- **Path:** `.cursor/scratchpad.md`
- **Purpose:** Agent-readable progress and completion signal.
- **Stop condition:** When the scratchpad contains the line `DONE` (or the goal stated in the hook), the loop can stop.

Example contents:

```markdown
# Current task: Fix auth tests

- [x] Updated fixture in tests/test_auth.py
- [x] Ran pytest tests/test_auth.py — 1 failure
- [ ] Next: fix AssertionError in test_logout

DONE
```

Once the agent writes `DONE` (after tests pass and it’s satisfied), the stop hook can omit `followup_message` so the loop ends.

## Loop logic (for the hook script)

1. Read stdin JSON: `{ "conversation_id", "status", "loop_count", … }`.
2. If `status !== "completed"` or `loop_count >= MAX_ITERATIONS` (e.g. 5–10), exit without output (stop looping).
3. If goal is met (e.g. scratchpad contains `DONE`, or run tests and they pass), exit without output.
4. Otherwise, output `{"followup_message": "…"}` with a short instruction, e.g.  
   `"[Iteration N/M] Continue. Run tests and fix failures. Update .cursor/scratchpad.md with DONE when all tests pass."`

## Without hooks (manual loop)

If hooks are not available, the user can drive the loop manually:

1. Ask the agent to work toward the goal and update `.cursor/scratchpad.md` with progress.
2. When the agent says it’s done, run tests (or type-check) yourself.
3. If they fail, say: "Tests still failing: [paste output]. Continue fixing and update the scratchpad."
4. Repeat until tests pass, then ask the agent to write `DONE` in the scratchpad.

## Best practices (from Cursor blog)

- Prefer **verifiable goals**: tests, type-check, lint, or explicit DONE.
- **Plan first** for larger tasks; refine the plan if the agent goes off track instead of only patching in chat.
- **Start a new conversation** when switching to a different feature to keep context focused.

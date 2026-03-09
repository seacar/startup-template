---
name: long-running-agent-loop
description: Runs the agent in a loop until a verifiable goal is met. Use when the user says "iterate until tests pass", "keep going until it works", or "run until done."
---

# Long-running agent loop

## When to use

Task has a clear success signal: tests green, lint clean, or explicit DONE in scratchpad.

## Scratchpad

- Path: `.cursor/scratchpad.md`
- Stop signal: agent writes `DONE` on its own line when goal is met.

## With hooks (Cursor Nightly)

The `grind.js` stop hook re-fires the agent after each turn until DONE or max iterations.
Set the goal clearly — verifiable end states only:

- ✅ "Run tests until all pass"
- ✅ "Fix all TypeScript errors"
- ❌ "Make the code better"

## Without hooks (manual)

1. Ask agent to work toward goal and update scratchpad each turn.
2. When agent reports done, verify manually.
3. If still failing, paste output: "Still failing: [output]. Continue and update scratchpad."
4. Repeat until done.

## Best practices

- Verifiable goals only: tests, type-check, lint, DONE.
- Plan first for larger tasks.
- Start a new conversation when switching features.

## Checklist

- [ ] Goal is verifiable
- [ ] Scratchpad initialized with goal and context
- [ ] Agent updates scratchpad each iteration
- [ ] DONE written only when goal is confirmed met

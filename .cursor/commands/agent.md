# Agent

Build or extend a LangGraph agent.

1. **Clarify:** purpose, inputs, outputs, human-in-the-loop requirements.
2. **State:** define TypedDict in `agents/<n>/state.py` first. Get approval before nodes.
3. **Nodes:** implement each as a pure function in `agents/<n>/nodes.py`.
4. **Graph:** wire in `agents/<n>/graph.py` with edges and interrupt points.
5. **Tools:** any tools go in `agents/<n>/tools.py` using `@tool`.
6. **Test:** pytest covering happy path and at least one interrupt/resume flow.
7. **Docs:** add entry in `documentation/agents.md`.

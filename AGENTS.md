# Agent Reference Index

This file lists agent-readable documentation for the equal-access codebase. Each entry describes the area covered and links to the full reference document.

---

## Simulator — Screen Reader simulation engine

**Document:** [`docs/agents/accessibility-checker-engine/simulator/README.md`](docs/agents/accessibility-checker-engine/simulator/README.md)

**Covers:**

- Architecture overview and class responsibilities (`SRController`, `SRNavigator`, `SRCursor`, `SRRenderer`, render rules)
- How a reading stop is produced end-to-end (navigation → container diff → render)
- All navigation modes and which DOM nodes they stop on
- How to add a new render rule (simple case: container announcement or inline text)
- Preformatted text (`<pre>`) — the virtual line-stop pattern using `preLineIndex` on `SRCursor`, including the critical rule that a `<pre>` must always be first encountered at its block-enter stop (`preLineIndex = undefined`)
- How to add a new element type that uses virtual stops (generalised `<pre>` pattern)
- `diffContainers` — how container enter/exit announcements are computed
- Test patterns and the mandatory `afterEach` teardown
- Known limitations and gotchas (singleton controller, `containter_exit.ts` typo, `bContinue` skip behaviour)

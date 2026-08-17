# Screen Reader Simulator — Agent Reference

> **Location:** `accessibility-checker-engine/src/v4/simulator/`
> **Tests:** `accessibility-checker-engine/test/v4/simulator/`
> **Run tests:** `npm run test:sr` (from `accessibility-checker-engine/`)

This document captures the design decisions, data-flow, and extension patterns an agent needs to add or modify screen-reader simulation behaviour. The simulator models how a screen reader announces page content when a user navigates by item, heading, link, region, etc.

---

## 1. Architecture overview

```
SRController          ← public API; owns the "point of regard"
  │
  ├─ SRNavigator      ← pure navigation: jumpNext / jumpPrevious / jumpCurrentEnd
  │    └─ SRCursor    ← DOM position + virtual state (preLineIndex, …)
  │
  └─ SRRenderer       ← pure rendering: renderRange / renderCurrent / renderEnter / renderLeave
       └─ render_rules/
            ├─ common.ts          → SR_RULES  (what text to speak for a node)
            ├─ container_enter.ts → CONTAINER_ENTER_RULES  (entering a landmark/container)
            └─ containter_exit.ts → CONTAINER_EXIT_RULES   (leaving a landmark/container)
```

`renderStructure(doc)` is the main entry point for tests. It runs all navigation modes in parallel, aligns stops by their start cursor position, and returns one row per stop.

---

## 2. Key classes and contracts

### `SRCursor` (`SRCursor.ts`)

Wraps a `DOMWalker` and tracks:

| Field | Type | Meaning |
|---|---|---|
| `walker.node` | `Node` | Current DOM node |
| `walker.bEndTag` | `boolean` | `false` = start-tag position, `true` = end-tag position |
| `role` | `string` | Resolved ARIA role |
| `name` | `AccessibleNameResult` | Computed accessible name |
| `preLineIndex` | `number \| undefined` | Per-line index when inside a `<pre>` (see §5) |

**`SRCursor.compare(one, two)`** returns `−1 / 0 / 1`. Rules:
1. Same DOM node + both start-tags + at least one has a `preLineIndex` → compare by index (`undefined` sorts before any number, i.e. the block-enter stop comes first).
2. Otherwise: standard `compareDocumentPosition`. Containment is resolved with start/end-tag position.
3. Shadow DOM / disconnected nodes: walks up via `DOMWalker.parentNode` (not `node.parentElement`) to find a common ancestor.

**Always use `DOMWalker.parentNode` (not `node.parentElement`) for ancestor walks** to support shadow DOM.

### `SRNavigator` (`SRNavigator.ts`)

Stateless namespace. All functions take/return `SRCursor` without mutating the input.

| Function | Purpose |
|---|---|
| `getStartFunc(mode)` | Returns a `SRCursorMatchFunc` that identifies "reading stop" nodes for `mode` |
| `getSkipFunc(mode)` | Returns a `SRCursorSkipFunc` that controls which subtrees are skipped |
| `jumpNext(mode, cursor)` | Advance to the next reading stop |
| `jumpPrevious(mode, cursor)` | Move to the previous reading stop |
| `jumpCurrent(mode, cursor)` | Snap back to the current reading stop (or the one that contains cursor) |
| `jumpCurrentEnd(mode, cursor)` | Return the end-sentinel cursor(s) for `renderRange` |

### `SRRenderer` (`SRRenderer.ts`)

| Function | Purpose |
|---|---|
| `renderRange(mode, start, end)` | Walk DOM from `start` to `end`, apply `SR_RULES`, join text |
| `renderCurrent(mode, cursor, containerChanges)` | Combine container announcements + `renderRange` result |
| `renderEnter(mode, cursor)` | Apply `CONTAINER_ENTER_RULES` at `cursor` |
| `renderLeave(mode, cursor)` | Apply `CONTAINER_EXIT_RULES` at `cursor` |

### `SRRendererRule` (`SRRendererRule.ts`)

```ts
new SRRendererRule({
    roles: string[],   // match by ARIA role
    elems: string[],   // match by uppercase element name (e.g. "PRE", "DL")
    modes: NavigationMode[],
    tests: Array<(cursor, oldCursor?, mode?) => string | null>
})
```

A rule fires when `mode` and (`role` or `elem`) match. Tests run in order; the first to return a `string` wins. Return `null` to skip, `""` to suppress output.

### `SRController` (`SRController.ts`)

Owns the **point of regard** (`pointOfRegard: SRCursor`). Stateful.

- `jumpNext(mode)` / `jumpPrevious(mode)` — advance the PoR, call `diffContainers`, return a `NavigationResult`
- `diffContainers(mode, newCursor, oldCursor)` — determines which containers were entered/left by walking up the DOM from each cursor to their common ancestor; fires `renderEnter`/`renderLeave` on each
- `renderAllDetail(doc, mode)` — run a full pass of `mode` over `doc`, returning `RenderResult[]`
- `renderStructure(doc)` — run all modes in parallel, align by `SRCursor.compare`, return one row per stop

**Singleton pattern:** `SRController.getController(doc)` returns a singleton. Tests must call `controller.disconnect()` in `afterEach` to tear down the mutation observer, then remove the fixture from the DOM.

---

## 3. Navigation modes

| Mode | What it stops on |
|---|---|
| `item` | Every block-level reading stop (paragraphs, headings, list items, `<pre>` lines, …) |
| `heading` / `h1`–`h6` | Heading elements |
| `link` | Elements with role `link` |
| `region` | Landmark regions |
| `tab_focus` | Tabbable elements (in tab order) |
| `image` | `img` and `graphics-document` roles |
| `list` / `listitem` | `list` / `listitem` roles |
| `dom` | Every node (debugging) |

Not yet implemented: `formcontrol`, `editbox`, `graphic`, `frame`, `division`, `tabcontrol`, `separator`, `clickable`, `mouseover` — these throw `NOT_IMPLEMENTED`.

---

## 4. How a reading stop is produced

```
SRController.jumpNext(mode)
  1. SRNavigator.jumpNext(mode, pointOfRegard)   → nextCursor
  2. SRController.diffContainers(mode, nextCursor, oldCursor)
       → {leaving: string[], entering: string[]}
  3. SRRenderer.renderCurrent(mode, nextCursor, containerChanges)
       a. jumpCurrent(mode, nextCursor)       → startOfRender
       b. jumpCurrentEnd(mode, startOfRender) → [endCursor, …]
       c. renderRange(mode, start, end)       → content string
       d. join: leaving + entering + content  → message
  4. If message is empty (and mode ≠ "region"), loop back to step 1
```

The `bContinue` loop in `SRController.jumpNext` skips stops whose rendered message is entirely whitespace, so container-only announcements (e.g. `[preformatted text]` with no inline content) ARE kept because they produce a non-empty message via `containerChanges`.

---

## 5. Preformatted text (`<pre>`) — virtual line stops

`<pre>` introduces a challenge: each newline-delimited line must be its own reading stop, but the `<pre>` element is a single DOM node. This is solved with **virtual cursor positions** on the `<pre>` element itself.

### Virtual stop sequence

```
<pre>+undefined   block-enter stop  → announces "[preformatted text]" via container_enter
<pre>+0           line 0 stop       → renders lines[0] via SR_RULES
<pre>+1           line 1 stop       → renders lines[1]
  …
<pre>+N           last line stop
(next DOM item)
```

`preLineIndex` on `SRCursor` carries the line index. `undefined` means the block-enter stop.

### `getPreLines(preElem)`

```ts
SRNavigator.getPreLines(preElem: HTMLElement): string[]
```

Uses `preElem.textContent` (flattens all inline children: `<code>`, `<b>`, etc.), splits on `"\n"`, and trims leading/trailing blank lines. This is the single source of truth for line content.

### Navigation lifecycle

**`jumpNext`** (in `SRNavigator.ts`):
- At `<pre>+undefined` with lines → return `<pre>+0`
- At `<pre>+N` where N+1 < lines.length → return `<pre>+(N+1)`  
- At `<pre>+N` where N = last line → do a DOM `next()` from `</pre>` end-tag; if that lands on another `<pre>`, set `preLineIndex = undefined` (block-enter, not 0 — this is critical, see §5.1)
- At `<pre>+undefined` with 0 lines (empty `<pre>`) → fall through to DOM traversal

**`jumpPrevious`** (in `SRNavigator.ts`):
- At `<pre>+0` → return `<pre>+undefined`
- At `<pre>+N` (N > 0) → return `<pre>+(N-1)`
- At `<pre>+undefined` → fall through to DOM `previous()` (lands on the previous item before `<pre>`)
- Landing on `<pre>` via backward DOM traversal → set `preLineIndex = lines.length - 1` (last line)

**`jumpCurrentEnd`** (in `SRNavigator.ts`):
- For any `<pre>` stop: returns `[<pre>+(preLineIndex+1)]` as the end sentinel. This prevents `renderRange` from walking into `<pre>`'s DOM children (child text nodes compare as "after" the start-tag cursor but "before" the end-sentinel `<pre>+(N+1)`).

### §5.1 Critical rule: always land on block-enter when reaching a new `<pre>`

When any navigation path lands on a `<pre>` element for the first time (whether via DOM `next()` from another element, or exhausting the previous `<pre>`'s lines), `preLineIndex` must be set to `undefined` — the block-enter stop. **Never set it to `0` directly.** The subsequent `jumpNext` call will advance from `undefined → 0` and the `bContinue` loop in `SRController.jumpNext` will preserve the block-enter stop as a separate row.

Setting `preLineIndex = 0` on initial landing causes the block-enter stop to be silently merged with the first line item, because the `bContinue` loop sees the previous `diffContainers` container-change text but attributes it to the first line's rendering pass.

### Rendering the line content

`SR_RULES` in `render_rules/common.ts` contains a `PRE`/`item` rule:
- If `preLineIndex === undefined` → return `null` (let `container_enter` handle the `[preformatted text]` text)
- If `preLineIndex` is a number → return `lines[preLineIndex]`

`container_enter.ts` has a `PRE`/`item` rule → `[${quoteNamePadAfter(cursor)}preformatted text]`  
`containter_exit.ts` has a `PRE`/`item` rule → `[out of preformatted text]`

### `SRCursor.compare` and virtual stops

When both cursors are at the same `<pre>` node with `bEndTag = false`:
- `undefined` (block-enter) sorts **before** any numbered line
- Numbered lines sort by their index
- This allows `renderStructure` to emit them as separate rows in the correct order

---

## 6. Adding a new virtual-stop element type

The `<pre>` implementation is a template. To add a similar element (e.g. a code block with syntax-highlighted tokens as individual stops):

1. **`SRCursor`** — add a new field (e.g. `tokenIndex: number | undefined`). Copy it in `clone()`. Extend `compare()` with the same `undefined < N` logic as `preLineIndex`.
2. **`SRNavigator`**
   - Add a helper `isMyElement(node)` check.
   - Add a `getMyItems(elem)` helper analogous to `getPreLines`.
   - In `getStartFunc("item")`, add `if (isMyElement(node)) return true;` alongside the `isPreElement` check.
   - In `jumpNext`: add an early-return block for the virtual stop lifecycle, matching the `<pre>` pattern exactly, including always setting `tokenIndex = undefined` when first landing on the element.
   - In `jumpPrevious`: mirror the reverse lifecycle.
   - In `jumpCurrentEnd`: return `[elem+(index+1)]` as end sentinel.
3. **`render_rules/common.ts`** — add a `SR_RULES` entry for your element that returns `items[cursor.tokenIndex]` when `tokenIndex !== undefined`, `null` otherwise.
4. **`render_rules/container_enter.ts`** — add the container-enter announcement.
5. **`render_rules/containter_exit.ts`** — add the container-exit announcement.
6. **Tests** — add a `MyElement_test.js` in `test/v4/simulator/` following the pattern in `Pre_test.js`.

---

## 7. Adding a new render rule (simple case)

For elements/roles that do not need virtual stops — just container announcements or inline text changes:

1. Add to `CONTAINER_ENTER_RULES` in `container_enter.ts` for the enter announcement.
2. Add to `CONTAINER_EXIT_RULES` in `containter_exit.ts` for the exit announcement.
3. Optionally add to `SR_RULES` in `common.ts` if the element produces inline spoken text (e.g. state announcements).
4. Add tests to the appropriate `*_test.js` file.

---

## 8. `diffContainers` — how container changes are computed

```ts
SRController.diffContainers(mode, newCursor, oldCursor)
```

1. Find the common ancestor of `newCursor` and `oldCursor`.
2. Walk up from `newCursor` to the common ancestor, collecting `renderEnter` results → `entering[]` (reversed so outer-to-inner order).
3. Walk up from `oldCursor` to the common ancestor, collecting `renderLeave` results → `leaving[]`.
4. Both arrays are filtered for non-empty strings.

**Virtual stops at the same DOM node** (e.g. `<pre>+undefined` → `<pre>+0`): `isSameNode` is true, so the block returns `{leaving: [], entering: []}` — no container changes between virtual stops of the same element. Container changes only fire when crossing to a new DOM element.

---

## 9. Test patterns

All simulator tests live in `accessibility-checker-engine/test/v4/simulator/`. The pattern:

```js
let ace = require('../../../src/index');

describe('My Element Tests', function () {
    afterEach(function () {
        // 1. Disconnect mutation observer
        let controller = ace.SRController.getController();
        if (controller && controller.disconnect) controller.disconnect();
        // 2. Remove DOM fixture
        let fixture = document.getElementById('fixture');
        if (fixture) document.body.removeChild(fixture);
    });

    it('Should do something', function () {
        document.body.insertAdjacentHTML('afterbegin',
            "<div id='fixture'><my-elem>...</my-elem></div>");

        let result = ace.SRController.renderStructure(document);

        expect(result).toEqual([
            { region:'', heading:'', item:'[Start of document]', tab_focus:'', image:'', selector:'body' },
            // ... per-stop rows ...
            { region:'', heading:'', item:'[End of document]', tab_focus:'', image:'' }
        ]);
    });
});
```

Key points:
- `renderStructure` returns rows with keys `region`, `heading`, `item`, `tab_focus`, `image`, and optionally `selector` (the CSS selector for the start cursor's element).
- Rows without a DOM element (e.g. `[End of document]`) have no `selector` key.
- `ace.SRController` is a singleton — `disconnect()` + DOM cleanup in `afterEach` is mandatory to avoid state leaking between tests.
- The `trimItems` helper (trim `item` field whitespace) is conventional but optional; omit it if you want to assert exact spacing.

---

## 10. Known limitations and gotchas

| Issue | Detail |
|---|---|
| `preLineIndex` is public on `SRCursor` | Only `SRNavigator` and `SRRenderer` should read/write it. External code should treat it as opaque. |
| `getPreLines` re-computes on every call | Cheap for typical `<pre>` sizes; no caching needed. |
| `SRController` is a singleton | `getController()` returns the same instance across test cases. Always disconnect + re-create via fixture teardown. |
| `renderStructure` aligns by `start` cursor | The `start` is set by `jumpCurrent`, not by the original `jumpNext` cursor. In practice they are the same for simple elements but `jumpCurrent` may snap backward if the PoR is mid-element. |
| `bContinue` loop skips empty-message stops | Stops whose entire rendered message (container changes + content) is whitespace are silently skipped. Design around this: ensure container-only stops produce non-empty container-change text. |
| `containter_exit.ts` typo | The filename has a typo (`containter` not `container`). Do not rename — it would break imports across the codebase. |

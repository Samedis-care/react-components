# The data grid's scrolling pane is a tab stop

- **Date:** 2026-08-25
- **Kind:** behavior
- **Scope:** `standalone/Virtualized`, `standalone/DataGrid`

## What changed

`MultiGrid` puts `tabIndex={0}` on the pane that actually scrolls, so the grid body is
reachable with `Tab` and scrolls with the arrow keys, `Page Up`/`Page Down`, `Home`/`End`
and `Space` once it has focus. Exactly one of the four panes gets the tab stop:

- rows present — the **bottom right** pane. It is the one with `overflowX: "scroll"`, and
  its `onScroll` already syncs the two pinned panes, so one tab stop covers both axes.
- no rows, columns present — the bottom right pane isn't rendered at all and the **top
  right** pane takes over as the horizontal scroller, so the tab stop moves there.

The pinned panes (top left, bottom left) and the no-content placeholder stay out of the
tab order.

Three things come with it:

- `DataGrid` no longer sets `outline: "none"` on that pane. It now draws the same focus
  ring as the rest of the library — `2px solid palette.primary.main`, inset — on
  `:focus-visible` only, so it shows for keyboard users and not on click.
- The focusable pane carries an `aria-label`. `MultiGrid` takes it as the new `label`
  prop; `DataGrid` passes the translated `standalone.data-grid.content.grid-label`.
  Without it the tab stop announces as an unnamed grid. The panes keep `react-window`'s
  `role="grid"` — its cells render as `role="gridcell"` inside `role="row"` and need a
  grid ancestor — so a screen reader announces a grid whose arrow keys scroll rather than
  move cell focus. The name stays a plain noun phrase: an accessible name names the thing,
  and a "use the arrow keys" hint would be read on every focus while being wrong for the
  browse mode NVDA and JAWS default to, where the arrow keys drive the virtual cursor.
- Two new theme slots, `CcMultiGrid` `topRightGrid` and `bottomRightGrid`, plus the
  matching `MultiGridClassKey` entries.

## Why

Reported as [samedis-care-issues#2573](https://github.com/Samedis-care/samedis-care-issues/issues/2573):
a training matrix in a `FullFormDialog` could not be scrolled sideways at all.

Chrome and WebKit pick the target for arrow-key scrolling from `document.activeElement`,
and fall back to the element the user last clicked when nothing is focused. On a plain
page the grid rode entirely on that fallback — it was never focused, the click just
happened to land in it. Inside a MUI `Dialog` the fallback never applies: the dialog paper
carries `tabindex="-1"` and holds focus from the moment the dialog opens, and a click on a
non-focusable cell resolves to its nearest focusable ancestor — the paper — which
therefore never blurs. Keyboard scrolling then started at the paper and walked *up* the
ancestor chain, never reaching the pane below it.

Measured in Chromium with the grid in a dialog: clicking a cell left
`document.activeElement` on `MuiDialog-paper` and five `ArrowRight` presses moved
`scrollLeft` by `0`. With the tab stop, the same click focuses the pane and the same five
presses scroll it, the pinned header pane following along.

It was also a WCAG 2.1.1 gap. Chromium reached the pane by `Tab` on its own — its
"keyboard-focusable scrollers" behaviour applies because the pane has no focusable
children — but 14 tab stops into the dialog and completely invisible, because of the
`outline: "none"`. WebKit has no such behaviour and never reached it at all.

## Migration

Nothing to do. Expect one extra tab stop on the grid body and a focus ring on it —
visual regression baselines that capture a focused grid need to be re-recorded.

The tab stop is unconditional rather than measured against the current overflow, so a
grid that happens to fit is still one stop in the tab order. Consumers who theme it can
reach the pane through the new `CcMultiGrid` `bottomRightGrid` / `topRightGrid` slots.

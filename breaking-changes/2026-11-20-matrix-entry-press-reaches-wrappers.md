# A press on a clickable Matrix entry reaches the elements around it

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

When `MatrixCellTile` has `onItemClick`, a `mousedown` on one of its entries, or on a
diagonal pair, now propagates like any other event: an `onMouseDown` on a `renderItem`
wrapper, on a `MatrixGrid` `renderCellWrapper` wrapper or on any other element around the
tile hears it, and so does a `mousedown` listener on the document. The entry used to stop
the event.

A press on a clickable entry still starts no range in a selectable `MatrixGrid` cell: the
entry is a button (`role="button"`), and the cell leaves presses inside a button to it.

## Why

A wrapper that listens for `onMouseDown` (a drag handle built on mouse events, a
long-press timer) never heard a press on an entry once the app made the entries
clickable. `pointerdown` and native drag events got through, `mousedown` did not.

## Migration

Nothing required. An `onMouseDown` handler around the entries that must not react to a
press on a clickable entry checks the target itself, for example
`event.target.closest('[role="button"]')`. A popup that closes on a `mousedown` outside it
(a `ClickAwayListener` with `mouseEvent="onMouseDown"`) now also closes when an entry is
pressed, as it does for any other button.

# The Matrix add hint shows a "+" where its label does not fit

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Matrix` (MatrixGrid with `selectable`: the hover hint on a blank
  cell, and the hint over an entry with `occupiedAddAffordance="overlay"`)

## What changed

- The hover hint shows `addLabel` only where the whole label fits on one line inside the
  hint, centered as before. The room for it is the column width less 19px: 37px at the
  default `columnWidth` of 56.
- Where the label does not fit, the hint shows a "+" (the add chip's icon) in its place. A
  label wider than the hint used to be centered and cut on both sides, so only its middle
  showed ("nzufüg" for "Hinzufügen").
- The "+" shows `addLabel` as its tooltip when the pointer rests on it. The label stays in
  the hint as its text.
- The "+" catches the pointer inside the hint's border, in the blank-cell hint too, which
  otherwise lets the pointer through to the cell. A press on it starts a range on its cell,
  as a press on the hint does.
- New `classes` keys and `CcMatrixGrid` slots: `addHintLabel` (the label) and
  `addHintIcon` (the "+").

The add chip and touch devices, which show no hover hint, are unchanged.

## Why

A label cut on both sides shows neither its start nor its end: at the default column width
the hint was unreadable in most languages but English.

## Migration

- Nothing to do. Expect a "+" instead of the label in screenshots of columns too narrow
  for it.
- Theme overrides of the `addHint` slot: the hint is now a wrapping flex container that
  shows only its last line, and `display`, `flexWrap`, `alignContent` or `whiteSpace` set
  there break the switch between label and "+". Style the label through `addHintLabel`
  and the "+" through `addHintIcon` instead.

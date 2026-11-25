# A Matrix tile marks the entries it leaves out with "+N"

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

- `MatrixCellTile` still draws only the first two of its `items`. When there are more, it now
  draws a "+N" marker in the tile's top right corner, over the `topRight` corner of the entry
  beneath it (the second entry of a side-by-side pair, the first of a stacked pair, the
  diagonal pair).
- Pointing at the marker shows the entries left out in a tooltip, each by its `label` (in its
  colors) and its `tooltip`. Screen readers read them with the cell, after the entries drawn:
  "2 more: N (Night shift), RD".
- The marker is ringed like a highlighted entry when one of the entries left out is
  `highlighted`.
- The marker is not a control: it opens nothing, and the entries it stands for cannot be
  clicked or dragged in the tile. A press on it is a press on the cell.
- New slot `overflow` (`MatrixCellTileClassKey`, `classes.overflow`, theme
  `CcMatrixCellTile.styleOverrides.overflow`), new state class
  `matrixClasses.overflowHighlighted`, new translation key `standalone.matrix.tile-more`
  (in every locale).

## Why

A third entry in a cell (a double booking, a hand-over next to an on-call duty) disappeared
without a trace, even when it was the highlighted search match. In a roster that is exactly
what has to be visible.

## Migration

Nothing to do. Apps that pass more than two entries per cell (hlth.care's `ShiftTile` passes
every shift of the cell) show the marker in those cells from now on, and lose the `topRight`
adornment of the entry beneath it there.

The marker's tooltip and its screen reader text are made of each entry's `label` and
`tooltip`: an entry without a `tooltip` is listed by its label alone.

To show the extra entries differently, or to make them clickable or draggable, collapse them
in the app and pass at most two items: the tile then draws no marker.

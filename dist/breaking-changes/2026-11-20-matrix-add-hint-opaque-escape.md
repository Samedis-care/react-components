# The Matrix overlay hint is opaque, and Escape hides the add hint

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

- Overlay mode (`occupiedAddAffordance="overlay"`): the hint over the lower half of an
  occupied cell is opaque, the grid's background with the same green tint, instead of a
  translucent tint over the entries. While the pointer is on the cell, it hides the lower
  half of the entries under it.
- Escape hides the add hint, on a blank cell and in overlay mode, until the pointer moves to
  another cell or leaves the cell and comes back.

The add chip is unchanged.

## Why

The translucent hint let the entry's fill show through its text, which read at 1.5:1 on a
green entry (WCAG 1.4.3 Contrast), and garbled the entry's label under it. Only moving the
pointer away hid it again (WCAG 1.4.13 Content on Hover or Focus).

## Migration

- Nothing to do for grids in overlay mode. Expect the opaque hint in screenshots.
- Theme overrides of the overlay hint's background (`addHint` slot with
  `CcMatrixGrid-addHintHalf`): it now sets `backgroundImage` (the tint) as well as
  `backgroundColor` (the grid's background); override both.

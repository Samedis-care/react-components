# A Matrix press let go of away from the grid adds nothing

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Matrix` (MatrixGrid with `selectable`)

## What changed

- A press on a cell that is let go of away from the grid no longer calls `onSelectRange`:
  neither a plain click whose pointer slid off the grid before the release, nor a sweep
  released past the grid's edge. "Away" is anywhere outside the grid's scroll container;
  a release over another row, a row header or a column header still reports the range.
- While the pointer is away from the grid with the button held, the range is not painted.
  Coming back onto the grid with the button still held paints it again, and the sweep
  goes on from where it was.

Escape, another mouse button, a context menu and the window losing focus still abort a held
press as before. The add chip is unchanged.

## Why

Sliding off before letting go is how a pointer aborts a press, as with any button: pressing
a cell by mistake left no way to take it back without a keyboard (Escape) or a second mouse
button, which a head-pointer or switch user may not have (WCAG 2.5.2 Pointer Cancellation).
The range is hidden while the pointer is away so that what is painted stays what a release
reports.

## Migration

- Nothing to do. A sweep that overshoots the grid's edge and is let go of past it now adds
  nothing; expect the painted range to disappear while the pointer is off the grid.

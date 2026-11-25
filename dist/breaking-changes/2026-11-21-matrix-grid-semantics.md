# MatrixGrid is a grid with rows, header cells and cells for assistive technology

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

`MatrixGrid` exposes the structure it draws:

- The `grid` slot has `role="grid"` and is named by `label`, as the scroll container
  around it already was.
- The header row, every data row and every aggregate row is an element with
  `role="row"`. These row elements draw no box (`display: contents`), so the cells stay
  items of the CSS grid.
- The corner is a `columnheader` (the header of the row headers' column) when it has
  contents, and a `gridcell` without them. The column headers are `columnheader`s.
- The row headers and the aggregate rows' headers are `rowheader`s, the body cells and
  the aggregate cells `gridcell`s.
- The header cell of a data row and the grid cell of an aggregate cell are new wrapper
  elements, also without a box: in touch mode the row header (the `rowHeader` slot) is a
  button, and so is an aggregate cell (the `extraCell` slot) with `onCellClick`, and a
  button cannot be a cell as well. Both slots keep their role, classes and styles.

The layout, the sticky headers and the slots' styles are unchanged.

## Why

A screen reader read the grid as a flat list of texts: the corner, every column header,
then per row the row header followed by bare cell contents. A code in a cell could not
be tied to its day, an empty cell said nothing, table navigation (move by column, hear
the column header) was not available, and nothing announced a widget, so the arrow keys
of an aggregate row went unnoticed.

## Migration

Nothing to do in the apps. Things to know:

- Styles that address the slots as direct children of the `grid` slot
  (`.CcMatrixGrid-grid > .CcMatrixGrid-rowHeader`) or count them with `:nth-child` no
  longer match: a row element sits in between, and around `rowHeader` and `extraCell`
  one more wrapper. Styles on the slots themselves are unaffected.
- The corner is now announced as the header of the row headers' column: give it text
  that says what the row headers show.
- Tests that query by role find the grid's new elements: `getAllByRole("row")`,
  `"columnheader"`, `"rowheader"`, `"gridcell"` and `getByRole("grid")`.

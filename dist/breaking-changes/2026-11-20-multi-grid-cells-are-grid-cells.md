# The grid's cells are cells of their rows

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Virtualized`, `standalone/DataGrid`

## What changed

MultiGrid puts react-window's `ariaAttributes` (`role="gridcell"` and `aria-colindex`) on
the element its cell renderer (`children`) returns, in all four panes. A role or column
index that element sets itself stays. Every DataGrid cell (column headers, row checkboxes,
values) is now a `gridcell` inside its `role="row"`, so a screen reader reads a row's
content as its cells and moves through them with its table commands. Nothing changes
visually.

All four panes call the cell renderer as a function; the top-left pane used to render it
as a component. Its hooks run in the pane's own cell component, as in the other three
panes.

## Why

react-window renders the `role="row"` elements and leaves the cell role to the renderer.
DataGrid's cell did not set it, so every row of every DataGrid had no cells: assistive
technology found a grid of empty rows (WCAG 1.3.1 Info and Relationships, 4.1.2 Name,
Role, Value), and accessibility checkers report `aria-required-children` on every row.

## Migration

- Nothing to do for DataGrid. Tests can now find its cells by role:
  `getAllByRole("gridcell")` (Playwright: `getByRole("gridcell")`), and a row's cells with
  `within(row).getAllByRole("gridcell")`.
- Required for a cell renderer passed to MultiGrid that returns the element of a component
  of its own: that component must pass `role` and `aria-colindex` on to its DOM element,
  as it does `style`, otherwise its rows still have no cells. A renderer that returns a DOM
  element (`<div style={style}>`) or a MUI `styled` element needs no change, and one that
  already spreads `ariaAttributes` keeps working as before.
- Required where an accessibility check (axe) turned off `aria-required-children` because
  of the grid's rows: remove that exception, the rule passes now.

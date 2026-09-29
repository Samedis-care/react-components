# DataGrid select all works without delete all

- **Date:** 2026-09-29
- **Kind:** behavior, type
- **Scope:** `standalone/DataGrid` (`DataGrid`, `DataGridCustomDataActionButton`), and
  `BackendDataGrid` and CRUD built on it

## What changed

- The select all checkbox in the footer is shown by the new `enableSelectAll` prop. It used to
  be shown by `enableDeleteAll`, which now only says that `onDelete` handles an inverted
  selection: it deletes everything matching its filter except the ids.
- While everything is selected:
  - Delete is disabled unless `enableDeleteAll` is set.
  - A custom data action button is disabled unless it sets the new `supportsSelectAll`.
- A custom data action button's `onClick` gets a third argument, `details`:
  - `filter`: the quick filter, the column filters and the additional filters, as
    `loadData` gets them;
  - `count`: how many rows are selected;
  - `rows`: the selected rows the grid has loaded.

  On xs, where the buttons are in the _More_ menu, the menu entries get the same.

- Without `getAdditionalFilters`, `onDelete`'s filter and the exporters' `onRequest` get the
  custom data as additional filters, as `loadData` does. They used to get `{}`, so delete all
  and export ignored filters that `loadData` applied.
- With everything selected, the selected count is the number of rows matching the filter less
  the ones unselected again. It used to be based on all rows, filtered or not. `isDisabled`
  (with `0 | 1 | 2`) and the edit button, which needs exactly one row, depend on it.
- New type `DataGridFilterParameters` (the filter parts of `IDataGridLoadDataParameters`), used
  by `onDelete`, `customDeleteConfirm` and `AdvancedDeleteRequest`; and
  `DataGridSelectionDetails`, the type of `details`.

## Why

Custom actions on a selection need what delete already had: they can act on every matching
row, not only on the loaded ones, and they get the filter that defines "every matching row".
Select all belongs to the selection, not to delete, so a grid without delete all (for example
one whose connector has no advanced deletion) can offer it for its own actions.

## Migration

- A grid that sets `enableDeleteAll` and should keep its select all checkbox also sets
  `enableSelectAll`.
- A custom data action button that handles `invert = true` sets `supportsSelectAll: true`.
  Everything matching `details.filter` except `ids` is selected then.
- Code that calls a button's `onClick` itself, e.g. its own mobile list of the grid's actions,
  has to pass `details`: `{ filter, count, rows }` for the rows it acts on.
- A grid without `getAdditionalFilters` whose custom data aren't filters: set
  `getAdditionalFilters` to return the filters. `loadData` already got the custom data.

# With `sortLimit` 0 a plain header click sorts the grid

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`sortLimit`), and the components that pass it on
  (`BackendDataGrid`, `CRUD`)

## What changed

A plain click on a sortable column header makes that column the only sort for every
`sortLimit`. With `sortLimit={0}` ("at most one sort") such a click was refused before: the
grid did not reload and the column was not sorted. It now replaces the current sort and the
grid reloads, as it does without a limit.

A Shift+click that would add a sort over the limit is still refused, and a refused click
changes nothing: the next reload (a search, a filter, Refresh) sends the sort the headers show.

## Why

`sortLimit={0}` allows one sort, and a plain click leaves exactly one. The refused click also
cleared the existing sort without showing it: the column's arrow stayed until the next reload,
which then loaded the grid unsorted.

## Migration

- An app that passes `sortLimit` 1 or more, or none, has nothing to do.
- An app that passes `sortLimit={0}` gets one-column sorting by header click. To keep users
  from sorting a column at all, leave out its `sortable` (or set it to `false`): in the
  column definition for `DataGrid`, in the model field for `BackendDataGrid` and `CRUD`.

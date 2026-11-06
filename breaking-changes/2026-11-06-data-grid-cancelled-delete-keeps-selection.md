# A cancelled delete keeps the DataGrid's selection

- **Date:** 2026-11-06
- **Kind:** type, behavior
- **Scope:** `standalone/DataGrid` (`onDelete`), `backend-components/DataGrid`
  (`useBackendDataGridDeleteHandler`, and `BackendDataGrid` and `CRUD` with `enableDelete`)

## What changed

- `DataGridProps.onDelete` can return `false`, or a promise that resolves `false`, to say
  that nothing was deleted (e.g. the user cancelled a confirmation). The grid then keeps
  the selection. Any other result clears the selection once it resolves, and a rejection
  keeps it, as before. The return type is now `Promise<boolean | void> | boolean | void`
  (was `Promise<void> | unknown`).
- The handler that `useBackendDataGridDeleteHandler` returns resolves `false` when the
  user answers "No" in the confirmation (or `customDeleteConfirm` throws), and `true` once
  the delete ran, also when it failed. It used to resolve `undefined` in every case.
- So "No" in the delete confirmation of `BackendDataGrid` and `CRUD` keeps the ticked rows.
  It used to untick all of them, and a grid with the `selection` prop got
  `onSelectionChange(false, [])`.

## Why

"No" deletes nothing, but the grid treated it as a finished delete and cleared the
selection, so the user had to tick every row again.

## Migration

Nothing to do for SCF and IMF: neither passes its own `onDelete` to `DataGrid`, and
SCF's `SamedisMobileBackendDataGrid`, which calls the handler of
`useBackendDataGridDeleteHandler` itself, ignores its result.

- An `onDelete` that returns anything other than a boolean, a promise of one, or nothing
  no longer compiles: return nothing instead.
- An `onDelete` that resolves `false` after deleting has to resolve `true` or nothing,
  or the selection stays.
- An `onDelete` that asks for its own confirmation can resolve `false` when the user
  cancels, to keep the selection.

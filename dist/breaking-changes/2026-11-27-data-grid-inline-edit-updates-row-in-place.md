# An inline edit in BackendDataGrid updates its row in place instead of reloading the grid

- **Date:** 2026-11-27
- **Kind:** behavior, type
- **Scope:** `backend-components/DataGrid`: BackendDataGrid and `renderDataGridRecordUsingModel` (also used by BackendDataGridMultiSelect); `standalone/DataGrid`: DataGrid

## What changed

An inline edit (a field with an editable overview visibility, such as
`ModelVisibilityGridEdit`) no longer reloads the grid:

- The control shows the change at once, while it is saved.
- Once saved, the row is replaced with the row of the saved record: each field takes the
  value the save returned, and keeps the loaded value where the response has none (a field
  the response leaves out, or one the model drops when it deserializes the response for
  `"edit"`). The selection, the scroll position and the focused control stay. The row stays
  where it is until the grid reloads, also when it no longer matches the grid's filter or
  sort.
- A refused save shows the error dialog as before, and the control shows the row's value
  again, without a reload.
- One save runs at a time per cell: a change made while one runs shows at once and is saved
  once it is done (only the last of several such changes, and none if it is the value just
  saved). A change made while a save runs that is then refused is dropped with it.

`renderDataGridRecordUsingModel(model)` takes the model only: the `refreshGrid` callback it
took as its second argument is gone. The row's inline cells update their row through the
DataGrid they are rendered in, which every `DataGrid` provides to its cells.

## Why

The reload after every inline edit unticked every selected row and dropped keyboard focus to
the page, and until it came the control kept showing the old value, so a keyboard or screen
reader user could not tell whether the key press was taken.

## Migration

- Required for any app that calls `renderDataGridRecordUsingModel` with two arguments (a grid
  of its own that builds its rows with it): drop the second argument. A refresh callback the
  app kept only for it can go too.
- Required for any app whose inline edit changes other records on the server, or changes
  which rows match the grid's filter, and that relied on the reload to show it: reload the
  grid from the model's `"mutate"` event (`model.addEventHandler("mutate", …)`, e.g. by
  changing `forceRefreshToken`).

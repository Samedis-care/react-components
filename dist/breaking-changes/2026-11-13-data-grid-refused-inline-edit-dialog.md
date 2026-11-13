# A refused inline edit in BackendDataGrid shows an error dialog

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/DataGrid`: BackendDataGrid and `renderDataGridRecordUsingModel` (also used by BackendDataGridMultiSelect)

## What changed

When the save of an inline edit fails (a field with an editable overview visibility, such as
`ModelVisibilityGridEdit`, whose `model.connector.update` rejects, or whose value the model
cannot serialize), the grid now:

- shows an error dialog titled "An error occurred" with the message 'The change to
  "*label*" was not saved: *error message*' (new key
  `backend-components.data-grid.inline-edit.error-dialog.message`, with `{{LABEL}}` and
  `{{ERROR}}`, in every locale) and an OK button,
- reloads the rows (`refreshGrid`), as after a successful save, so the cell shows the
  stored value.

Before, the failure was an unhandled promise rejection: nothing was shown, the rows were not
reloaded, and the rejection reached `window.onunhandledrejection`.

The cell of an editable field is now rendered by a component inside the grid, so it can show
the dialog. `row[field]` of such a field is that component's element instead of the
renderer's control, and the cell needs the Framework around the grid, which BackendDataGrid
already required. A cell whose overview visibility is not editable gets a change handler
that throws "Not editable in Grid"; the shipped renderers never call it there.

## Why

The user could not tell whether a change made in the grid had been saved.

## Migration

Nothing to do for grids rendered inside the Framework, which includes custom grids that
build their rows with `renderDataGridRecordUsingModel`. A refused inline edit no longer
reaches the unhandled rejection handler, so an error tracker that records unhandled
rejections (Sentry) no longer records it, as for a refused delete.

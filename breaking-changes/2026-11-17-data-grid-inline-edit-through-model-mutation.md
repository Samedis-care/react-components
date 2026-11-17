# An inline edit in BackendDataGrid is saved like any other update

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `backend-components/DataGrid`: BackendDataGrid and `renderDataGridRecordUsingModel` (also used by BackendDataGridMultiSelect); `backend-integration/Model`: `useModelMutation`, `Model.createOrUpdateRecordRaw`

## What changed

An inline edit (a field with an editable overview visibility, such as
`ModelVisibilityGridEdit`) is now saved through the model's mutation (`useModelMutation`),
the way a form saves a record:

- the record the connector returns becomes what the model's cache holds for that id, so a
  form opened afterwards (`useModelGet`, `getCached`) shows the edited value instead of the
  record it had loaded before,
- `ModelOptions.hooks.onCreateOrUpdate` is called with that record,
- the `"mutate"` listeners registered with `model.addEventHandler` (for any record, or for
  this id) are called with it,
- `connector.update` gets the model as its second argument, as on every other update, and
  the model deserializes the response.

What is sent stays the same: `{ id, [field]: value }`, serialized with the fields' overview
visibilities.

`useModelMutation(model, visibility?)` and `Model.createOrUpdateRecordRaw(values, visibility?)`
take the page the values were edited on (`"overview"`, `"edit"` or `"create"`): the values
are serialized with its field visibilities, so a field disabled there is not sent. It
defaults to `"edit"` for an update and `"create"` for a create, as before.

## Why

An inline edit bypassed the model. A form that had loaded the record shortly before showed
the old value, and saving it sent the old value back over the inline edit. Code that keeps
other views in step with a model's records through its hooks or `"mutate"` listeners never
heard of inline edits.

## Migration

Nothing to do. An `onCreateOrUpdate` hook or `"mutate"` listener of a model with
inline-editable fields now also runs after each inline edit, with the saved record, as after
a form save.

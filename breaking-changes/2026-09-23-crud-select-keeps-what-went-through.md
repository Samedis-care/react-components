# CrudSelect keeps what went through when part of a change fails

- **Date:** 2026-09-23
- **Kind:** behavior, type
- **Scope:** `backend-components/Selector` (`useCrudSelect`, `CrudMultiSelect`, `CrudMultiSelectWithGroups`, `FormCrudMultiSelect`)

## What changed

A selection change can do several writes at once: create the added entries, update the
changed ones, delete the removed ones. Each write is now accounted for on its own:

- A create which went through shows up in the selection, even when another create,
  update or delete in the same change failed. Previously a single failure left the
  selection as it was before the change.
- A create which failed leaves the selection.
- A delete which failed leaves the entry selected.
- An update which failed leaves the entry as it was before the change.
- A `prepareNewEntry` which throws fails only its own entry. The other added entries
  are still created.

The reported error is now a `CrudSelectError`. Its `failures` list gives the `entry`,
the `action` (`"create"`, `"update"` or `"delete"`) and the original `error` for each
write that failed. Its message names each failed entry by label, e.g.
`Beta: duplicate_key_error; Gamma: duplicate_key_error`. `CrudSelectError`,
`isCrudSelectError` and the `CrudSelectFailure` type are exported.

The error is also cleared by the next change that succeeds completely. Previously it
stayed set until the control was remounted.

## Why

The backend keeps every write that succeeded, whether or not the others in the same change
failed. When the selection hid them, records which existed were not shown. Picking them again
then collided with those records. For example, a unique index rejects the second create, and
the selector stayed stuck in the same state.

## Migration

Code that compares `error.message` with the backend's message has to read
`error.failures[n].error` instead, or match `isCrudSelectError(error)`. Otherwise nothing
to do.

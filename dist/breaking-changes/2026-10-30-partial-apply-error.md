# CRUD controls report failed writes as a PartialApplyError; the file controls name each file

- **Date:** 2026-10-30
- **Kind:** type, behavior
- **Scope:** `backend-components/Selector`, `backend-components/FileUpload`,
  `backend-components/Form`

## What changed

- `CrudSelectError`, `isCrudSelectError` and the `CrudSelectFailure` type are replaced
  by `PartialApplyError`, `isPartialApplyError` and `PartialApplyFailure`, exported from
  the package root. A failure has the same fields (`entry`, `action`, `error`), and the
  error's `name` is `CcPartialApplyError`. The message of CrudMultiSelect and
  CrudMultiSelectWithGroups is unchanged.
- CrudFileUpload and CrudMultiImage hand `errorComponent` a `PartialApplyError` with every
  write of a change that failed, instead of the first failure's own error. Its message is
  one translated sentence per failed write, e.g. "Could not upload bad.pdf: File too large.
  Could not remove old.pdf: in use." The backend's errors are in `failures[n].error`. A
  refused selection (type, size, count) is reported as before.
- `ErrorComponentProps` has an optional `id`. CrudFileUpload and CrudMultiImage pass it,
  and while the error is shown above the field, the field references it with
  `aria-describedby`.

New translation keys: `backend-components.file-upload.write-failed.create`, `.update` and
`.delete`.

## Why

A failed write did not say which file it was about, a change with several refusals
reported only the first one, and an error shown next to the field was not tied to it.
The selects and the file controls report the same situation, a change whose writes went
through only in part, so they now share one error type.

## Migration

Replace `isCrudSelectError(error)` with `isPartialApplyError(error)`, and the imports of
`CrudSelectError` and `CrudSelectFailure` with `PartialApplyError` and
`PartialApplyFailure`. An error component that read the backend's message from a file
control's error finds it in `failures[n].error.message`. An inline error component should
render `id` on the element that shows the message.

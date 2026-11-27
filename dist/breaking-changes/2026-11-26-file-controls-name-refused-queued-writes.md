# A Form's save names the files and images the backend refused

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `backend-components` `CrudFileUpload`, `CrudMultiImage`, `FormCrudFileUpload`,
  `FormCrudMultiImage`

## What changed

While a `CrudFileUpload` or `CrudMultiImage` (also inside `FormCrudFileUpload` and
`FormCrudMultiImage`) is mounted on a `LazyConnector`, it sets the connector's queue error
factory (`LazyConnector.setQueueErrorFactory`). When the backend refuses queued creates or
updates as the queue is sent (`workQueue`, which a Form's save calls), the submit now rejects
with a `PartialApplyError`, where it rejected with the backend's error itself (one refusal) or
an `AggregateError` of them (several):

- one failure per refused write: the file (`FileData<BackendFileMeta>`) or image
  (`BackendMultiImageImage`) as the control lists it, the action `create` or `update`, and the
  backend's error;
- a message that names each the way the controls word a write refused through any other
  connector, one sentence each: "Could not upload bad.txt: File too large. Could not upload
  bad2.txt: File too large." A refused replacement of an image reads "Could not replace
  photo.png: …". The Form's error component shows it.

The control removes its factory when it unmounts. A refused write whose file or image the
control does not list leaves the error as before.

## Why

The Form's error dialog showed only the backend's messages ("File too large; File too
large"), so the user could not tell which of the files or images were not saved.

## Migration

**Required for any app that inspects the error of a Form's save, or of `workQueue`, for the
backend's error (its class, `name`, `code` or `meta`) in a form with a `FormCrudFileUpload` or
`FormCrudMultiImage`.** The refusals are in the `PartialApplyError`'s `failures`
(`failure.error`); the `refusalsOf` helper in
[A refused write no longer stops a LazyConnector's queue](2026-11-26-lazy-connector-sends-past-refused-writes.md)
reads them out of either error. An app that only shows the error has nothing to change.

An app that sets a queue error factory of its own on the connector of one of these controls
sets it after the control mounted: one factory at a time, and the control's, set as it mounts,
replaces one set before.

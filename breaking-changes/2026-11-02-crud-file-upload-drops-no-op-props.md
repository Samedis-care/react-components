# CrudFileUpload no longer takes `defaultFiles` and `onRestoreFile`

- **Date:** 2026-11-02
- **Kind:** type
- **Scope:** `backend-components/FileUpload`

## What changed

`CrudFileUploadProps` no longer inherits `defaultFiles` and `onRestoreFile` from
`FileUploadProps`. Passing either is a type error.

## Why

Neither had an effect. The control loads its files from `connector` and always passes them
as `files`, so `defaultFiles` was ignored. It replaces `onRestoreFile` with its own restore
when the connector is a LazyConnector, and there is nothing to restore with any other
connector, so a handler passed in never ran.

## Migration

Remove both props from `CrudFileUpload` call sites. Nothing changes at runtime. A restore
is reported through `onChange`, like every other change of the list.

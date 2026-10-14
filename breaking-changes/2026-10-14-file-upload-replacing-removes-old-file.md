# Replacing a file by name removes the old one like the remove button

- **Date:** 2026-10-14
- **Kind:** behavior
- **Scope:** `standalone/FileUpload`, `backend-components/FileUpload`

## What changed

With `allowDuplicates` off (the default), picking a file with the name of one already
listed replaces it. The replaced file is now removed the way its remove button removes it:

- A file from the server (one with a `downloadLink`) stays in the list with `delete: true`.
  It renders struck through, with a restore control, next to its replacement, and the
  value handed to `onChange` carries it with `delete: true`.
- A file the user picked earlier leaves the list, as before.
- A file with `preventDelete` is not replaced. The new file is listed next to it.

The replaced file used to leave the list without a `delete` flag, so nothing deleted it on
the server.

`CrudFileUpload` now writes that removal. A direct connector deletes the replaced file
right away. A `LazyConnector` queues the delete, or cancels the replaced file's upload if
that is still queued, and the list marks both files until the queue is worked.

## Why

Replacing a file means the old one should be gone after saving. Without the `delete` flag,
the old file stayed on the server, and after a reload both files were listed. If the old
file's upload was still queued in a `LazyConnector`, it was sent as well on submit.

## Migration

Code that handles `delete: true` for removed files needs no change. Code that reads the
`FileUpload` value has to skip entries with `delete: true` if it assumed that a replaced
file was simply missing from the list.

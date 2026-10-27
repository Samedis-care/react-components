# CrudFileUpload reports a queued removal with `delete: true`

- **Date:** 2026-10-27
- **Kind:** behavior
- **Scope:** `backend-components/FileUpload`

## What changed

With a `LazyConnector`, a file whose removal is queued used to be listed with
`delete: false` and `changeState: "removed"`. It now keeps `delete: true` next to
`changeState: "removed"` until the queue is worked or the removal is restored, like a
removed file in a plain `FileUpload`:

- `onChange` reports it with `delete: true`, also when it is read back off the queue after
  a remount.
- It no longer counts toward `maxFiles` or `maxTotalFileSize`, so the user can pick a file
  in its place before saving.
- Its icon is greyed like a plain `FileUpload`'s removed file. The restore control stays
  where the remove button was.

Restoring it clears `delete`. A direct connector is unchanged: a file whose delete went
through leaves the list, and one the server refused stays listed with `delete: true`.

## Why

`delete` is how a `FileUpload` value says which files are gone after saving. Without it, a
queued removal still took a `maxFiles` slot ("Too many files selected" when picking its
replacement), and code that counted the entries without `delete` counted it as present.

## Migration

Code that skips entries with `changeState === "removed"` needs no change, and
`files.filter((file) => !file.delete)` now gives the same result. Code that counts every
entry of the value still counts a queued removal, as before, and should skip `delete`.
Custom variant renderers that read `delete` now show a queued removal as removed.

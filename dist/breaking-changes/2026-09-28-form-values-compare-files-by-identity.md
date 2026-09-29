# Form values compare files by identity

- **Date:** 2026-09-28
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`Form`, `FormAutoSave`), `utils` (`deepClone`, `deepEqual`, `toComparisonJson`)

## What changed

- The form's dirty checks and `FormAutoSave` tell one `Blob` (a `File` included) from
  another. Previously every Blob counted as `{}`. So after a picked image was saved,
  picking a second one neither made the form dirty nor triggered the auto save.
- `deepClone` returns a `Blob` as it is. Previously it copied a `File` into a new `File`
  and turned any other Blob into `{}`.
- `deepEqual` compares Blobs by identity. Previously it threw for them.
- `toComparisonJson` is exported: the JSON of a value in which each Blob stands for
  itself, by an id, without reading its bytes.

## Why

Picked files are form values now (see [the entry on picked images](2026-09-28-picked-images-are-blobs.md)).
A Blob never changes, so the same object is the same file.

## Migration

Nothing to do. Code that relied on `deepClone` handing back a different `File` object has
to copy it itself.

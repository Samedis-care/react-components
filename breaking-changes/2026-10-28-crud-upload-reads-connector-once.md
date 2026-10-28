# CrudFileUpload and CrudMultiImage keep the first connector, also for writes

- **Date:** 2026-10-28
- **Kind:** behavior
- **Scope:** `backend-components/FileUpload`

## What changed

Both components already loaded `connector` only once, on mount: a connector passed later
was never loaded. Their writes, though, went to whatever connector was passed last, with
the ids of the first connector's records.

Now the control lists and writes the first connector it gets for as long as it is
mounted, and ignores a later one. `CrudFileUpload` still loads the first connector it gets
after `null`.

## Why

Writing to a later connector with the first list's ids deleted or replaced records of
another collection.

## Migration

**Required where a mounted control is handed another record's connector:** remount it, e.g.
with a `key` per record. Without the key it keeps showing and writing the first record's
files.

```tsx
<CrudFileUpload key={recordId} connector={connector} {...otherProps} />
```

A connector that is created anew on every render for the same record needs no change: the
control keeps using the first instance.

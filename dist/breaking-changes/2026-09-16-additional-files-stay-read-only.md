# CrudFileUpload keeps additional files out of its own

- **Date:** 2026-09-16
- **Kind:** behavior
- **Scope:** `backend-components/FileUpload`

## What changed

`CrudFileUpload`'s `additionalFiles` are now kept apart from the files the control owns,
whatever they look like, and are rendered read-only.

The control renders the union of its own files and the extras, and the standalone control
hands that union back on every change — so each change had to separate the extras out
again. It did that by shape, taking anything without an `id` for an extra. That holds for
an extra built by hand, which is all `FileData<FileMeta>` promises, but not for one loaded
from a backend and put through a deserializer: `FileData<BackendFileMeta>` is assignable to
`FileData<FileMeta>`, so such an extra carries an `id` exactly like the control's own files
and was taken for one of them.

Extras are now marked as such where the union is built, and recognised by that mark.

They also no longer offer a remove control. `preventDelete` is set on them, which callers
passing backend records had to set themselves.

## Why

An extra taken for one of the control's own files ended up in its state, where the union
listed it a second time: after picking one file, a control with one extra showed
`extra, picked, extra`. It compounded — every further change folded the rendered list back
into state — and outlived saving, since working the queue only clears the pending marks.
The duplicates were display-only, but they counted against `maxFiles` and each offered a
download link to a record the form does not own.

Removing such an extra would have sent a `DELETE` for its id to this control's connector,
where that id means a different record.

## Migration

Nothing to do. An application which relied on removing an additional file was deleting the
wrong record; pass it as a real file of the control instead.

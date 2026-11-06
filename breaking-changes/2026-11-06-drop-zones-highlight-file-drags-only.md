# Drop zones highlight only while files are dragged

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `utils/useDropZone`, `standalone/FileUpload` (`FileUploadGeneric`, `FileUploadRendererProps.dragging`, `ImageBox`, `MultiImage`)

## What changed

- `useDropZone`'s `dragging` is true only while the drag carries files
  (`dataTransfer.types` includes `"Files"`), such as files dragged in from the desktop.
  Dragging selected text, a link or an image within the page no longer sets it.
- So the drop zones highlight only for file drags: the classic `FileUploadGeneric` drop
  zone, the drop targets of `MultiImage` (an `ImageBox` with a drop handler), and a custom
  FileUpload renderer that reads `dragging`.
- A file drag still highlights every drop zone on the page, wherever the pointer is.

## Why

Nothing but files can be dropped on these zones. Highlighting them for every drag on the
page, e.g. while the user selects and drags text, suggested otherwise.

## Migration

Nothing to do. A custom renderer that used `dragging` to react to any drag on the page has
to listen to the drag events itself.

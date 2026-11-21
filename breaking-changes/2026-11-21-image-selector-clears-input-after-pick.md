# ImageSelector clears its file input after every pick

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/FileUpload/Image` (`ImageSelector` in every variant), and so
  `RendererImage` (image fields of a Form)

## What changed

After the user picks an image in the file dialog, the control takes the picked file and
clears its hidden file input (`value = ""`) before it calls `postEditCallback` or
processes the image. Picking the same image again is handled like any other pick: it
calls `postEditCallback` again, is processed again and is handed to `onChange` again.

## Why

Browsers fire no `change` event when the user picks the file the input already holds.
Picking the same image again after cancelling the `postEditCallback` (a crop dialog,
say), after an error ("The image could not be loaded…"), or after a change the owner did
not apply did nothing until the user first picked a different file.

## Migration

- Nothing is required.
- `postEditCallback` and `onChange` can be called for the same image more than once, once
  per pick.

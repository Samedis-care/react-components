# FileUpload clears its file input after every pick

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/FileUpload` (`FileUploadGeneric` in every variant, including custom renderers through `handleFileChange`), and so `RendererFiles` and `CrudFileUpload`

## What changed

After the user picks files in the file dialog, the control takes a copy of them and
clears the hidden file input (`value = ""`), also when the pick is refused (too many
files, wrong type, too large). The input's `files` are empty afterwards.

## Why

Browsers fire no `change` event when the user picks the same files the input already
holds. Picking a file again after removing it, retrying a refused pick with the same file,
or picking an edited file again to replace the listed one did nothing.

## Migration

- Nothing is required.
- A custom renderer that reads `inputRef.current.files` after a pick finds it empty. Take
  the picked files from the list the control hands out (`files`, `onChange`) instead.

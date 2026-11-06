# The image preview dialog is named by its image's alt

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/FileUpload/Image` (`ImagePreviewDialog`), and so the preview that
  `ImageSelector`'s modern variant opens

## What changed

- The dialog's `aria-labelledby` points at its image, so the dialog's accessible name is the
  `alt` prop. The image carries a generated `id` for it.
- Nothing changes visually.

## Why

The dialog had no accessible name: MUI points `aria-labelledby` at a title id, and without a
`DialogTitle` no element carried that id, so a screen reader announced only "dialog" when
the preview opened.

## Migration

- Nothing is required.
- Pass a meaningful, non-empty `alt`: it now names the dialog too. `ImageSelector` passes its
  own `alt`, which `RendererImage` sets to the field label.
- Tests that look up the preview with `getByRole("dialog")` keep working; with a `name`
  option they match the `alt` text.

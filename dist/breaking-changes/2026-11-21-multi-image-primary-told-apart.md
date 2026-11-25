# MultiImage's edit dialog tells the primary image apart by star shape and text

- **Date:** 2026-11-21
- **Kind:** behavior, theme
- **Scope:** `standalone/FileUpload/MultiImage`

## What changed

- In MultiImage's edit dialog, the make-primary toggle button under each image reads
  "Primary image" with a filled star in the primary colour on the primary image, and "Set
  as primary image" with an outline star (`StarBorder`) on the others. Both used to read
  "Primary", with the same filled star in two colours. The button's name follows its text
  ("Set as primary image photo.jpg"); it stays a toggle button (`aria-pressed`).
- The toggle button takes the room Replace and Remove leave and wraps its text there.
  Replace and Remove sit in the new slot `changeButtons` of `CcImageDialogEntry` and wrap
  to the next row together when the text does not fit beside them.
- The text `standalone.file-upload.multi-image.primary` is replaced by
  `standalone.file-upload.multi-image.is-primary` ("Primary image") and
  `standalone.file-upload.multi-image.make-primary` ("Set as primary image"), in every
  locale.

## Why

The primary image was told apart by the star's colour alone, and every image read
"Primary": a user who cannot tell the colours apart could not see which image is primary,
a screen reader read "Primary" under every image, and nothing said that the text under the
other images is an action.

## Migration

Nothing to do for the apps; expect the new texts, the outline stars and the wrapped button
rows in screenshots of the edit dialog.

An app that overrides the text `standalone.file-upload.multi-image.primary` in its own
translations: override `standalone.file-upload.multi-image.is-primary` and
`standalone.file-upload.multi-image.make-primary` instead.

A theme that styles `components.CcImageDialogEntry.styleOverrides.actions` with selectors
for the Replace and Remove buttons as children of the row: they are children of
`changeButtons` now.

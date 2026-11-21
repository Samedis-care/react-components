# A file's remove and restore are buttons named after the file

- **Date:** 2026-11-21
- **Kind:** behavior, type, theme
- **Scope:** `standalone/FileUpload`: FilePreview (the default export of `Generic/File`), and so `FileUploadGeneric` in both variants, `CrudFileUpload` and custom renderers that render FilePreview

## What changed

- A file's remove (✕) and restore icons are inside a MUI `IconButton` now, the new
  `actionButton` slot of `CcFile`. It is a tab stop, Enter and Space activate it, keyboard
  focus shows a 2px `primary.main` outline, and a tooltip shows its name on hover and on
  keyboard focus. The target is at least 24 x 24 px. Without focus or hover the files look
  as before.
- The button is named after the file: "Remove contract.pdf", "Restore budget.xlsx". The
  icons are hidden from assistive technology; the restore icon used to be an image named
  "Restore", the same for every file.
- Remove and restore are one button: removing a stored file turns it into the restore
  button and restoring turns it back, and keyboard focus stays on it.
- When a focused remove or restore button goes away with its file, as a removed pick
  leaves the list, `FileUploadGeneric` moves focus to the next file's remove or restore
  button, or after the last file to the upload control.
- FilePreview no longer takes `restoreLabel`: it names both buttons itself. It takes
  `actionButtonRef`, a ref to the button while it is shown.
- Theme slots of `CcFile`: `actionButton` is new and has the pointer cursor and, in the
  box variant (class `CcFile-actionButton-box`), `position: absolute`. The icon slots
  `closeIcon`, `closeIconList`, `removeIcon`, `restoreIconBox` and `restoreIcon` keep their
  colours but no longer set `cursor` or `position`.
- Texts: `standalone.file-upload.remove-file` ("Remove {{NAME}}") and
  `standalone.file-upload.restore-file` ("Restore {{NAME}}") are new in every locale;
  `standalone.file-upload.restore` is gone.

## Why

Remove and restore worked by mouse only: they were icons with a click handler, with no
role and no tab stop. A keyboard user could not take back a wrong pick before saving or
restore a removed file, and a screen reader was not told that files can be removed at all.
Every restore had the same name, without the file's name.

## Migration

- Code that passes `restoreLabel` to FilePreview: remove the prop, or the code does not
  compile.
- A custom renderer that renders FilePreview gets the named, keyboard-operable buttons
  without changes. When its remove takes a file off the list, it moves focus on itself:
  `actionButtonRef` gives it each file's button.
- A theme or `classes` entry that sets `position` or `cursor` on one of the icon slots:
  set it on `actionButton` instead. Colours on the icon slots keep applying.
- Every file with a remove or restore button adds one stop to the Tab order. Tests that
  click the icons (by their `data-testid`) keep working; tests that count the buttons in a
  file field now also find these.

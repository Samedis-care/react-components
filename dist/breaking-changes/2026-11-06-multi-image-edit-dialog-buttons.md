# MultiImage's edit dialog has a row of buttons under each image, and ImageBox has no onRemove

- **Date:** 2026-11-06
- **Kind:** type, behavior
- **Scope:** `standalone/FileUpload/MultiImage`

## What changed

- In MultiImage's edit dialog every image has a row of buttons under it, always visible:
  - the star and "Primary" are a toggle button (`aria-pressed`) that makes the image
    primary. It used to be a clickable row.
  - **Replace** (new) opens the file picker; the picked file replaces the image, as a file
    dropped onto the image does.
  - **Remove** moved here from the top right corner of the image, where it showed only
    while the mouse hovered the image.

  Images marked `readOnly` get only the toggle button. Each button is named after the
  image's file name ("Remove image photo.jpg").

- The add and camera tiles of the edit dialog are buttons named "Add image" and "Take
  photo" that Enter and Space activate.
- `ImageBox` no longer takes `onRemove`, and no longer renders a Remove button. Its
  `removeBtn` slot styles only the full-screen view's Close button now.
- Theme slots:
  - `CcImageDialogEntry` has the new slots `actions` (the row) and `primaryButton` (the
    toggle button). `makePrimary` and `isPrimary` are the star and text inside the toggle
    button, a `span` each. They used to be Grid containers with the click handler, and
    `makePrimary` had the pointer cursor.
  - `CcMultiImage` has the new slot `tileButton`: the add and camera tiles' buttons, around
    their `ImageBox`.
- New texts `standalone.file-upload.multi-image.add` ("Add image") and
  `standalone.file-upload.multi-image.replace` ("Replace image") in every locale.

## Why

The dialog worked by mouse only. Remove was `visibility: hidden` until hovered, so
keyboard and screen-reader users could not reach it, and it vanished when the pointer
moved away from the focused button. The tiles and the star row were clickable divs, and an
image could be replaced only by dragging a file onto it.

## Migration

Required for code that passes `onRemove` to `ImageBox`: remove the prop, or the code does
not compile. Render a Remove button of your own next to the box.

A theme that styles `components.CcImageBox.styleOverrides.removeBtn` for the edit dialog's
Remove button: style `components.CcImageDialogEntry.styleOverrides.actions` instead (the
button is a plain `IconButton` in that row).

A theme that styles `components.CcImageDialogEntry.styleOverrides.makePrimary` or
`isPrimary`: check the result, these are `span`s inside a button now.

Expect the button rows in screenshots of the edit dialog.

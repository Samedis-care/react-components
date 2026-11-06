# The modern file upload has an upload button

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/FileUpload` (`FileUploadGeneric` with `variant="modern"`), and so `RendererFiles` and `CrudFileUpload` in the modern variant

## What changed

- The modern variant's call to action ("Drag & drop file here or click for an upload
  dialog", or `uploadLabel`) is a `<button type="button">` now, in the new slot
  `modernUploadButton`. Every editable modern file field gets a tab stop. Enter and Space
  open the file picker, as a click does, and screen readers announce it as a button named
  by its text. It is not rendered while `readOnly`.
- The button shows a 2px `primary.main` outline on keyboard focus and a pointer cursor.
  Otherwise the field looks as before: the text keeps its `modernUploadLabel` slot,
  including the `CcFileUpload-modernUploadLabel-empty` class, inside the button.
- `name` and `onBlur` are set on that button. In the modern variant both used to be
  ignored.

## Why

A keyboard user could not add a file to a modern field, and a screen reader announced no
control in it: only a mouse click on the box or dropping files worked. Because `onBlur`
was ignored, a form never learned that the user had left a modern file field.

## Migration

- Nothing is required.
- `onBlur` now fires for modern file fields. `RendererFiles` passes the form's
  `handleBlur`, so a modern file field is now marked as touched when the user leaves it,
  as a classic one always was.
- A modern file field adds one stop to a form's Tab order, and tests that query the
  buttons in such a field find this one.
- A theme override for the text (`modernUploadLabel`) keeps working. Style the button
  through `modernUploadButton`.

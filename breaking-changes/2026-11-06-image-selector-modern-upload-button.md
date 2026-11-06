# The empty modern image selector has an upload button

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/FileUpload/Image` (`ImageSelector` with `variant="modern"` and no
  image), and so `RendererImage` in the modern variant

## What changed

- The empty modern field's call to action ("Drag & drop file here or click for an upload
  dialog", or `uploadLabel`) is a `<button type="button">` now, in the new slot
  `modernUploadButton`. Every editable empty modern image field gets a tab stop. Enter and
  Space open the file picker, as a click does, and screen readers announce it as a button
  named by its text. It is not rendered while `readOnly`.
- The button shows a 2px `primary.main` outline on keyboard focus. Otherwise the field looks
  as before: the text keeps its `modernUploadLabel` slot inside the button.
- The call to action is no longer an `h1`: it is a `span` (display block) inside the button,
  also while `readOnly`. Heading navigation no longer lists it.
- `name` is set on that button. Leaving it calls `onBlur`, as leaving the upload buttons of
  a field with an image already did.
- When a pick replaces the focused button with the image, focus moves to the image's upload
  button instead of falling to the page.

## Why

A keyboard user could not add an image to an empty modern field, and a screen reader
announced a heading but no control in it: only a mouse click on the box or dropping a file
worked. Because nothing in the empty field could take focus, `onBlur` never fired, so a form
never learned that the user had left it.

## Migration

- Nothing is required.
- `onBlur` now fires for empty modern image fields. `RendererImage` passes the form's
  `handleBlur`, so such a field is now marked as touched when the user leaves it.
- An empty modern image field adds one stop to a form's Tab order, and tests that query the
  buttons or headings in such a field see the button and no heading.
- A theme override for the text (`modernUploadLabel`) keeps working. Style the button through
  `modernUploadButton`.

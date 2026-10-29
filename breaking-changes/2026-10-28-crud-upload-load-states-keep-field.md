# CrudFileUpload and CrudMultiImage keep their field while loading and after a failed load

- **Date:** 2026-10-28
- **Kind:** behavior
- **Scope:** `backend-components/FileUpload`, `standalone/GroupBox`

## What changed

While their records loaded, both controls rendered only a Loader in place of the field.
After a failed load, they rendered the error's message in a plain span. Now they render the
field's frame with its label in both states:

- While loading, the frame is marked `aria-busy` and holds a spinner named "Loading…".
- After a failed load, the frame holds an alert: a translated message, "The attachments
  could not be loaded" or "The images could not be loaded", and below it the error's own
  message.

`GroupBox` has a new `busy` prop, which sets `aria-busy` on the frame. The frame's contents
can be themed as `CcCrudLoadStatus` (slots `message` and `detail`).

New translation keys: `backend-components.file-upload.loading`,
`backend-components.file-upload.load-failed.files` and
`backend-components.file-upload.load-failed.images`.

## Why

A screen-reader user could not tell which field was loading or that its load failed, a
failed load showed only the error's message without saying which field it belonged to, and
the layout jumped by the field's height once the records arrived.

## Migration

None needed. Screenshots of a loading or failed field change. Tests that looked for the
Loader find the labelled frame with a named spinner instead.

# A file's name is a link, or a button, that opens the file

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/FileUpload`: FilePreview (the default export of `Generic/File`), and so `FileUploadGeneric` in both variants, `RendererFiles`, `CrudFileUpload` and custom renderers that render FilePreview

## What changed

- The name of a file with a link (a `downloadLink` with an http(s), blob or data URL, or
  one relative to the page) is a link now: an `<a href target="_blank" rel="noopener noreferrer">`
  in the `label` or `listLabel` slot, where it used to be a `<p>` with a click handler.
  With a custom `onClick` it is a `<button type="button">`. In the `icon-only` variant,
  which shows no name, the icon (the `iconWrapperList` slot) is that link or button.
- Each such file is a tab stop. Enter opens the file as a click does (Space too on a
  button), and the tooltip with the full name opens on keyboard focus as well. Keyboard
  focus shows a 2px `primary.main` outline. Screen readers announce a link or a button
  named by the file name.
- A click on the icon or the image preview still opens the file. They are not tab stops.
- A file without a link has no control: its name stays plain text and nothing in it is
  focusable.
- Without keyboard focus the files look as before.

## Why

A keyboard user could not open any attached file, and screen readers read its name as a
paragraph. In a read-only list of documents, opening them is all the control offers.

## Migration

- Nothing is required.
- Every file with a link adds one stop to the Tab order. Tests that find a file by its
  name as text keep working; tests that count the links or buttons in a file field now
  also find the files.
- Theme overrides of `label`, `listLabel` and `iconWrapperList` keep applying. For a file
  with a link the element is an `a` or a `button`, so CSS that selects a `p` there no
  longer matches it.
- A custom renderer must not place FilePreview inside a link or button of its own: a
  file with a link would then nest one control in another.

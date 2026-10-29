# CrudMultiImage shows a write error in the edit dialog while that is open

- **Date:** 2026-10-29
- **Kind:** behavior
- **Scope:** `backend-components/FileUpload`, `standalone/FileUpload` (MultiImage)

## What changed

- CrudMultiImage renders its `errorComponent` where the user is when the error arrives. An
  error that arrives while the edit dialog is open is rendered at the top of the dialog,
  and dismissed when the dialog closes. One that arrives while the dialog is closed is
  rendered above the field, as before, and stays there while the dialog is open.
- `MultiImage` has two new props: `dialogMessage`, shown at the top of the edit dialog, and
  `onDialogOpenChange`, called when the dialog opens and when it closes (also when the
  control becomes read-only or unmounts with the dialog open). CrudMultiImage sets both
  itself, so `CrudMultiImageProps` has neither.

## Why

An error that arrived while the edit dialog was open, i.e. the outcome of nearly every
add, remove or replace, was rendered behind the dialog: under its backdrop and in the part
of the page the modal dialog hides from assistive technology. An inline error component
could neither be seen nor reached until the dialog was closed.

## Migration

None needed. An inline `errorComponent` now also appears in the edit dialog, and an error
shown there is gone once the dialog closes.

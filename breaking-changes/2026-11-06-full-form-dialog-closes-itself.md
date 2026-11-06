# FullFormDialog closes only itself and calls onClose first; useCloseThisDialog closes the dialog a component is in

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Form/FormDialog` (`FullFormDialog`), `framework/DialogContextProvider`, `framework/PushedDialogCloseContext` (`useCloseThisDialog`)

## What changed

- The X, Escape and a backdrop click of a `FullFormDialog` call `onClose` first, then
  close the dialog the `FullFormDialog` was pushed in. They used to close the top-most
  dialog of the nearest `DialogContextProvider` first and call `onClose` afterwards.
- If `onClose` already closed the dialog, nothing else closes. `onClose={popDialog}` now
  closes only this dialog. It used to close the dialog below it too, or to log "Trying to
  close non-existing dialog" when there was none.
- `onClose` runs while the dialog is still open, so a navigation started in `onClose` is
  blocked, as every navigation is while a pushed dialog is open.
- A `FullFormDialog` rendered without `pushDialog` closes through `onClose`. Its X, Escape
  and backdrop used to do nothing, or to close another open dialog. Without `onClose` it
  now logs an error saying that it cannot be closed.
- An error thrown by `onClose` is reported (`captureError`) and logged, and the dialog
  still closes. It used to be swallowed.
- `DialogContextProvider` keys each pushed dialog by its own id instead of its position. A
  dialog pushed in the same render in which another one closed no longer takes over that
  dialog's state.
- New: `useCloseThisDialog()` returns a function that closes the dialog the calling
  component was pushed in, and only that one. Inside a `FullFormDialog` it closes that
  dialog, without "Leave form page?" and without calling `onClose`. It throws outside a
  dialog shown with `pushDialog`, and inside a `FullFormDialog` rendered without it.

## Why

Closing the top-most dialog closed the wrong one when `onClose` closed a dialog as well,
and when the `FullFormDialog` was not the pushed dialog at all. A dialog now closes by
identity, which needs a key per dialog: with position keys, the dialogs after a closed one
would take over each other's state.

## Migration

- `onClose={popDialog}` works as written. Code that avoided it to prevent a second close
  can stay as it is.
- An `onClose` that navigates has to wait until the dialog has closed, e.g.
  `onClose={() => queueMicrotask(() => navigate(target))}`.
- A `FullFormDialog` rendered without `pushDialog` needs an `onClose` that stops rendering
  it, e.g. `{open && <FullFormDialog onClose={() => setOpen(false)}>…</FullFormDialog>}`.
- Content that closes its own dialog with `popDialog` closes the top-most dialog, which is
  another one when a dialog was pushed above it. `useCloseThisDialog()` closes the right
  one; switching is optional.

# While a dialog button's handler runs, the buttons stay focusable and the pressed one shows a spinner

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` `ErrorDialog`, `InfoDialog`, `ConfirmDialog`, and the
  dialogs of `showInfoDialog`, `showErrorDialog`, `showConfirmDialog` and
  `showConfirmDialogBool` (not `FormDialog` or `InputDialog`)

## What changed

While the promise a button's `onClick` returned is pending (`handlerButtonYes` /
`handlerButtonNo` in `ConfirmDialog`):

- the dialog's buttons are `aria-disabled="true"` with MUI's disabled look (the
  `Mui-disabled` class), instead of `disabled`. They stay focusable, so the button that was
  pressed keeps keyboard focus; the dialog ignores clicks on them, as before.
- the pressed button shows a 16px progress spinner before its label (hidden from assistive
  technology).
- the dialog (the element with `role="dialog"`) is `aria-busy="true"`.

Escape and the backdrop are still ignored while the handler runs. A handler that does not
return a promise changes nothing visible.

## Why

A disabled button loses focus: the browser moved it to the page and MUI's focus trap then to
the dialog's container, so a keyboard user had to find their way back, and nothing showed or
told that the dialog was working.

## Migration

Nothing to do. Tests that check a busy dialog button with `toBeDisabled()` check
`toHaveAttribute("aria-disabled", "true")` instead. Screenshots of a busy dialog show the
spinner in the pressed button.

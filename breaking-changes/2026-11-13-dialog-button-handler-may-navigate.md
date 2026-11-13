# A dialog button's handler may navigate, and the confirm helpers settle once their dialog is closed

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `framework` (`DialogContextProvider`, `PushedDialogClose`), `non-standalone/Dialog` (`ErrorDialog`, `InfoDialog`, `ConfirmDialog`, `showConfirmDialog`, `showConfirmDialogBool`), the form pages' "Leave form page?" prompt

## What changed

- Navigation is blocked while a pushed dialog is open, but no longer by an `ErrorDialog`,
  `InfoDialog` or `ConfirmDialog` whose button without `dontClose` was clicked, while that
  button's handler runs: the dialog closes once the handler has ended. So a handler may
  navigate (`onClick: () => navigate(…)`, `handlerButtonYes={() => navigate(…)}`), and so
  may code that awaits a promise the handler settles. They used to get the alert
  "Navigation is blocked. Please close your open dialogs first.", the location stayed, and
  then the dialog closed.
  - Another open dialog still blocks, and so does a `dontClose` button's dialog until its
    handler calls `close`.
  - A handler that fails leaves its dialog open, and navigation is blocked again.
  - While a long async handler runs, the browser's Back button goes through as well; the
    dialog stays until the handler has ended.
- `showConfirmDialog` and `showConfirmDialogBool` settle once their dialog is closed, after
  Yes, No, Escape or a backdrop click, no longer while it is still open. Code after `await`
  runs with the dialog closed: it may navigate, and `popDialog()` there closes the dialog
  below the confirmation, not the confirmation.
  - So "Leave form page?" → Yes leaves a dirty routed form page again, and a form page's
    `goBack` → Yes (Back in a routed CRUD) goes back.
- New, not breaking: `PushedDialogClose.allowNavigation`, which DialogContextProvider sets
  around every pushed dialog. A dialog that closes once some work is done calls it to let
  navigation through meanwhile, and calls the function it returns if it stays open after all.

## Why

A button that leads somewhere ("Open the record") navigates from its handler. The handler ran
while its dialog was still open, so the navigation was blocked: the user was told to close a
dialog that was gone a moment later, and stayed on the old page. Since the `show…Dialog`
helpers return a `DialogPromise` (2026-11-06), code after `await showConfirmDialog(…)` ran
while the confirmation was still open too, so the form pages' leave prompts did not leave.

## Migration

- Nothing required.
- A handler that closes its dialog before navigating (`dontClose: true`, then `close()` or
  `popDialog()`, then `navigate(…)`) keeps working. Without `dontClose` it can just
  navigate:

  ```tsx
  { text: t("open"), onClick: () => navigate(target) }
  ```

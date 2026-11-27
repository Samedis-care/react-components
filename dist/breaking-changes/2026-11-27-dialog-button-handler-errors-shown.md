# A dialog button whose handler fails shows the error in an error dialog

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` `ErrorDialog`, `InfoDialog`, `ConfirmDialog`, `FormDialog`, `showInfoDialog`

## What changed

When a button's `onClick` (or a ConfirmDialog's `handlerButtonYes` / `handlerButtonNo`)
throws, or returns a promise that rejects, the dialog handles the error:

- it reports it through `captureError` (see `configureErrorReporting`), with the source
  `"ErrorDialog.onClick"` (also for InfoDialog, ConfirmDialog and `showInfoDialog`) or
  `"FormDialog.onClick"`; the default policy leaves out `ValidationError` and
  `NetworkError`, as everywhere;
- it shows it in an error dialog pushed over the dialog, as `showErrorDialog` shows it (an
  Error's `message`, a `ValidationError`'s messages, a string as it is, a generic text for
  anything else);
- the dialog stays open with its buttons enabled again, and `onClose` is not called, unless
  the handler closed the dialog with the `close` it gets (then `onClose` is called, as
  before). Closing the error dialog returns focus to the button that was pressed.

A dialog rendered outside a `DialogContext` logs the error to the console instead of
showing it.

Before, the error was an unhandled rejection: the dialog enabled its buttons again and
nothing showed, and the error reached only the console and the browser's
unhandled-rejection handler (e.g. Sentry's).

## Why

A failed request in a button handler without a `try`/`catch` of its own left the user
with no sign that anything went wrong.

## Migration

Nothing is required. A handler that catches its own errors and shows them is unaffected.
A handler that lets an error escape now gets the library's error dialog: catch the error
in the handler to show something else. An error tracker that picked these errors up as
unhandled rejections now receives them through `captureError`, under the sources above.

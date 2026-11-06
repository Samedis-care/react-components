# A dialog button's onClick gets the dialog's close; the show…Dialog helpers return a closable promise

- **Date:** 2026-11-06
- **Kind:** type, behavior
- **Scope:** `non-standalone/Dialog`: `IDialogButtonConfig` (`onClick`, `dontClose`), `ErrorDialog`, `InfoDialog`, `FormDialog`, `ConfirmDialog`, `showConfirmDialog`, `showConfirmDialogBool`, `showInputDialog`, `showInfoDialog`, `showErrorDialog`, new type `DialogPromise`

## What changed

- `IDialogButtonConfig.onClick` is `(close: () => void) => void | Promise<void>`. It got the
  dialog's `onClose` prop (`(onClose?: () => void) => …`). `close` closes the dialog the
  button belongs to, at once, and only that one, also while dialogs pushed after it are open.
  It does not call `onClose`: once the handler has ended (returned, or its promise settled,
  also rejected), the dialog calls `onClose`, once, if it is closed by then (the handler
  called `close`, or the button has no `dontClose`). So the promise of a `show…Dialog` helper
  settles when the handler is done, not when `close` was called. `close` called after the
  handler has ended closes the dialog and calls `onClose` right away. Calling it is optional:
  a button without `dontClose` whose handler never calls it behaves as before, and a
  `dontClose` button whose handler doesn't call it leaves the dialog open without calling
  `onClose`, as before.
- In `FormDialog`, a button without `dontClose` now calls `onClose` also when its handler
  fails (the dialog is closed before the handler runs).
- `ConfirmDialog` calls `handlerButtonYes` and `handlerButtonNo` without arguments (they got
  `onClose`). So `showConfirmDialog` resolves with `undefined` on Yes and rejects with
  `undefined` on No, as on Escape; it resolved and rejected with the dialog's `onClose`
  function.
- New API, not breaking: the five `show…Dialog` helpers return a `DialogPromise<T>`, their
  promise with a `close()` attached (`Promise<T> & { close: () => void }`, exported from the
  package root). `close()` closes the dialog the helper pushed, and only that one, and
  settles the promise at once, as Escape does: `showInfoDialog` and `showErrorDialog` resolve,
  `showConfirmDialogBool` resolves `false`, `showConfirmDialog` and `showInputDialog` reject
  with `undefined`. Calling it again, or after the dialog was closed another way, does
  nothing. `showConfirmDialog`, `showConfirmDialogBool` and `showInputDialog` are no longer
  `async` functions; code that only awaits them is not affected.

## Why

A button that navigates has to close its dialog first, because navigation is blocked while
a dialog is open. The argument was the dialog's `onClose`, which settles the helper's promise
but doesn't close the dialog, so handlers called `popDialog()`, which closes the top-most
dialog, another one when a dialog was pushed after this one. `close` closes the right
dialog, and because `onClose` follows the handler, code awaiting the helper still continues
only after the handler's work.

Code that pushed a dialog with a helper had no way to close that dialog from outside it.

## Migration

- **Required for a handler that calls `popDialog()` to close its own dialog** (with
  `dontClose`, calling the argument at the end): call the `close` it gets instead, and drop
  `dontClose` and the call at the end. `popDialog()` closes the top-most dialog, which may be
  another one. Before:

  ```tsx
  {
  	text: t("yes-print"),
  	onClick: async (onClose?: () => void) => {
  		popDialog();
  		await printQr("new-page", data);
  		if (onClose) onClose();
  	},
  	dontClose: true,
  }
  ```

  After:

  ```tsx
  {
  	text: t("yes-print"),
  	onClick: async (close) => {
  		close();
  		await printQr("new-page", data);
  	},
  }
  ```

  The code awaiting `showInfoDialog` still continues after printing. Until migrated, the old
  code keeps working while its dialog is the top-most one: `popDialog()` closes it, the call
  at the end now marks it closed, and `onClose` runs after the handler.

- **Required for a handler that calls its argument to close the dialog before navigating**
  (`onClick: (onClose) => { onClose?.(); navigate(…); }, dontClose: true`): this now works as
  written, the argument closes the dialog and the navigation goes through. `dontClose` can be
  dropped. With the previous version of this library the navigation was blocked: the
  argument settled the promise but left the dialog open.
- In a button of a dialog shown with a helper, close with the `close` the handler gets, not
  with the helper promise's `close()`: that one settles the promise at once, before the
  handler has ended.
- Code that checks the value `showConfirmDialog` rejects or resolves with: it is `undefined`
  now on Yes and No.
- To close a helper's dialog from outside it, keep the returned promise:

  ```tsx
  const info = showInfoDialog(pushDialog, { title, message });
  // later
  info.close(); // closes exactly this dialog; `await info` continues
  ```

  `then`, `catch` and `finally` return plain promises without `close`.

- A hand-written `IDialogButtonConfig` handler type `(onClose?: () => void) => …` still
  type-checks; rename the parameter to `close` for clarity.

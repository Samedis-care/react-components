# showInfoDialog calls the `onClose` it is given

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` (`showInfoDialog`)

## What changed

`showInfoDialog` calls the `onClose` passed in its props. Before, it accepted the prop
and never called it.

`onClose` is called once, when the dialog has closed, in each of the ways that resolve the
promise `showInfoDialog` returns: by a button once its handler has ended, by Escape, by a
backdrop click, and by the promise's `close()`. It runs before the code awaiting the
promise continues. Closing the dialog again, e.g. a second `close()`, does not call it
again.

## Why

The props type of `showInfoDialog` offers `onClose`, so a call such as
`showInfoDialog(pushDialog, { title, message, onClose: reload })` compiled, closed the
dialog on OK, and never ran `reload`.

## Migration

- **Required for any app that passes `onClose` to `showInfoDialog`:** that callback now
  runs when the dialog closes. If the app also runs the same code after awaiting the
  returned promise, remove one of the two, or it runs twice:

  ```ts
  // runs reload twice now
  await showInfoDialog(pushDialog, { title, message, onClose: reload });
  reload();
  // either
  await showInfoDialog(pushDialog, { title, message, onClose: reload });
  // or
  await showInfoDialog(pushDialog, { title, message });
  reload();
  ```

- An app that passes no `onClose` to `showInfoDialog` has nothing to do.

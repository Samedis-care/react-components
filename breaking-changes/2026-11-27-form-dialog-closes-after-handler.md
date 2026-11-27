# FormDialog closes after its button's handler, as the other message dialogs do

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` `FormDialog`

## What changed

A FormDialog button without `dontClose` runs its `onClick` while the dialog is still open,
then closes the dialog and calls `onClose`, as ErrorDialog, InfoDialog and ConfirmDialog
do. Before, FormDialog closed the dialog first and ran the handler after.

- While a returned promise is pending, the dialog stays and shows its busy state:
  `aria-busy`, the pressed button's spinner, `aria-disabled` buttons, Escape and the
  backdrop ignored (before, this showed only for `dontClose` buttons).
- If the handler throws or rejects, the dialog stays open with its inputs as the user left
  them, and the error shows in an error dialog over it (see
  [the error change](2026-11-27-dialog-button-handler-errors-shown.md)); `onClose` is not
  called.
- `onClose` is called once the handler has ended, as before.

## Why

A failed save removed the dialog and what the user had typed in it. Now the user can
correct the input and press the button again, and all message dialogs follow one rule.

## Migration

Nothing is required for a handler that ends quickly. A handler that should not keep the
dialog open while it works calls the `close` it gets first:

```tsx
{ text: "Save", onClick: async (close) => { close(); await save(); } }
```

Tests that expect the FormDialog to be gone while a button's async handler runs now find
it open and busy until the handler has ended.

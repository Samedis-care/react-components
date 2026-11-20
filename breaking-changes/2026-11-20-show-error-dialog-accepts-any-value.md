# showErrorDialog accepts any value and no longer throws

- **Date:** 2026-11-20
- **Kind:** behavior, type, i18n
- **Scope:** `non-standalone/Dialog` `showErrorDialog`

## What changed

`showErrorDialog(pushDialog, e)` takes `e: unknown` (was `Error | ValidationResult | string`)
and shows a dialog for every value:

- An `Error` shows its `message` under "An error occurred", as before. This now includes an
  Error from another realm (an iframe), which showed an empty "Error on validation" list. A
  `ValidationError` lists its `result`, as before.
- A string is shown as it is, as before.
- An object with at least one entry, all of them strings, is a `ValidationResult`: its values
  are listed under "Error on validation", as before. `{ title, message }` is such an object
  and is listed too.
- Anything else shows "An error occurred" with the new text `common.dialogs.error-no-details`
  ("No further details are available. Try again.", in every locale):
  - `null` and `undefined`, which threw "TypeError: Cannot convert undefined or null to
    object" synchronously and showed nothing,
  - an object with a value that is not a string, such as an API error
    `{ status: 500, message: "Internal" }`, or with no entries, which was listed under
    "Error on validation".

## Why

Callers pass the value their `catch` received. A promise rejected without a reason made the
helper throw from inside the caller's `catch`, so the user saw no dialog, and an object that
is not a validation result was shown as a failed validation.

## Migration

Nothing required. The cast in `catch (e) { await showErrorDialog(pushDialog, e as Error); }`
can be dropped: `showErrorDialog(pushDialog, e)` compiles.

For an error dialog with a title of your own, use `showInfoDialog`, which renders the same
dialog with an OK button:

```tsx
await showInfoDialog(pushDialog, { title: t("…"), message: error.message });
```

`showErrorDialog(pushDialog, { title, message })` lists both texts under "Error on
validation".

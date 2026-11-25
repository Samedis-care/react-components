# showErrorDialog lists the messages of a ValidationError only

- **Date:** 2026-11-25
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` `showErrorDialog`

## What changed

`showErrorDialog(pushDialog, e)` lists messages under "Error on validation" only when `e` is a
`ValidationError`. A plain object of messages, such as the `ValidationResult` that
`validateForm()` returns, or `{ email: "…" }` built by hand, and also `{ title, message }`, now
gets the generic dialog: "An error occurred" with "No further details are available. Try
again." (`common.dialogs.error-no-details`).

The `ValidationResult` type stays. It is what `validateForm`, custom validation and warning
handlers, the model's `validate` and the `validate` of `CrudImport` and `useCrudSelect`
return, and `ValidationError.result` holds one. It is a return value, not an error.

## Why

`showErrorDialog` told a validation result from other values by its shape: any object whose
values were all strings was listed as a failed validation. A `ValidationError` says so
explicitly, and it is what the Form itself throws when validation fails.

## Migration

**Required for any app that passes a `ValidationResult` (or any other plain object of
messages) to `showErrorDialog`, or throws one into a `catch` that shows it**, e.g. `throw
validation` after `validateForm()`. Without it, the user sees "No further details are
available" instead of the messages. Wrap the result in a `ValidationError`:

```tsx
import {
	isObjectEmpty,
	showErrorDialog,
	ValidationError,
} from "components-care";

const validation = await validateForm();
if (!isObjectEmpty(validation)) {
	await showErrorDialog(pushDialog, new ValidationError("error", validation));
	return;
}

// inside a try whose catch calls showErrorDialog(pushDialog, e):
if (!isObjectEmpty(validation)) throw new ValidationError("error", validation);

// messages built by hand:
await showErrorDialog(
	pushDialog,
	new ValidationError("error", { email: t("…") }),
);
```

TypeScript does not flag the old calls (`e` is `unknown`): search for `showErrorDialog(` with
an argument that is not a caught error, and for `throw` of a validation result.

For an error dialog with a title of your own, use
`showInfoDialog(pushDialog, { title, message })`, which renders the same dialog.

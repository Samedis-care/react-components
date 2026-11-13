# InputDialog describes a rejected value in text and moves focus to the field

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` (`InputDialog`, `showInputDialog`)

## What changed

- While `textFieldValidator` rejects the value, a line of text below the field says so,
  and it is the field's description (`aria-describedby`). The text is the new optional
  prop `textFieldErrorText`. Without it, or with an empty string, it is the translated
  default "Enter a valid value" (`non-standalone.dialog.input-dialog.invalid`).
- The field is still validated on every change, as before: the text appears with the
  first change that leaves an invalid value and goes away as soon as the value is valid.
  Yes with an untouched, invalid field shows it too.
- Yes with a rejected value moves focus to the field. It used to stay on Yes. The dialog
  stays open, as before.
- While the value is invalid, the dialog is one line taller.

## Why

The field marked an invalid value only by turning red, and a rejected Yes gave no
feedback. Users who cannot tell the colors apart and screen reader users did not learn
that the value was refused or why.

## Migration

For every `InputDialog` or `showInputDialog` call whose `textFieldValidator` can return
false: pass `textFieldErrorText`, translated, saying what the value has to be. Without it
the user only reads "Enter a valid value", which does not say what is expected.

```tsx
await showInputDialog(pushDialog, {
	// …
	textFieldLabel: t("close-confirm.text-field-label"),
	textFieldValidator: (value) => value === email,
	// e.g. "Enter the e-mail address of your account"
	textFieldErrorText: t("close-confirm.text-field-error"),
});
```

Expect the error line under the field in screenshots of a prompt with an invalid value.

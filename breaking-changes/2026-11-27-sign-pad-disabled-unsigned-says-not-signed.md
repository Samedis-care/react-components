# A disabled, unsigned SignPad tile says "Not signed"

- **Date:** 2026-11-27
- **Kind:** behavior, i18n
- **Scope:** `standalone/SignPad`, and through it `non-standalone/SignaturePad` and the
  form renderer of `TypeSignature`

## What changed

- An unsigned tile that is `disabled` shows "Not signed" next to its greyed pen icon,
  instead of the prompt "Sign here digitally". Its button's name says the same: "Not
  signed", "Not signed (Alice Müller)" with a `signerName`, after the field's label when
  `aria-labelledby` is set ("Trainer signature Not signed").
- The text is the new key `standalone.signature-pad.not-signed`, in every locale.
- A read-only signature field of a form is such a tile (the renderer passes `readOnly` as
  `disabled`), so an unsigned one now reads "Not signed", as the field's non-editable view
  already did. A tile disabled through `components.CcSignPad.defaultProps` says it too.
- Enabled tiles and signed tiles are unchanged.

## Why

A disabled tile cannot be signed: a click, Enter or Space does nothing. The prompt asked
for something the user could not do there. The tile now states the field's value, as a
read-only field does.

## Migration

Nothing to do for an app that shows signatures through SignPad, SignaturePad or a form's
signature field: the text changes by itself.

Required for an app whose tests or screenshots look for the prompt on a disabled or
read-only tile: without a change they no longer find it. Look for the
`standalone.signature-pad.not-signed` text instead:

```tsx
// was: screen.getByRole("button", { name: /Sign here digitally/ })
screen.getByRole("button", { name: /Not signed/ });
```

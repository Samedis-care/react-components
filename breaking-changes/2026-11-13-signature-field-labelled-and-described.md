# A signature field's button is named by its label, described by its message, and marked required and invalid

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/SignPad`, `non-standalone/SignaturePad`, `ModelDataTypeSignatureRenderer`

## What changed

- SignPad and SignaturePad take `id`, `aria-labelledby`, `aria-describedby`, `aria-invalid`
  and `required`, all for the tile's button. SignaturePad passed these props on to the
  dialog, which ignored them, so they now take effect.
- `aria-labelledby` names the button by those elements followed by its own name, e.g.
  "Trainer signature Signature (Alice Müller)", so it still tells whether the field is
  signed. The info button is named "More information" followed by them.
- `required` adds "Required" to the start of the button's description, from a hidden text
  with the id `<id>-required` (new i18n key `standalone.signature-pad.required`). The
  button gets no `aria-required`: ARIA does not allow it on a button, and browsers drop it.
- The button always has an id: `id`, or one generated per tile. The info button has the id
  `<id>-info`.
- In a Form (`ModelDataTypeSignatureRenderer`), the field's `id` goes to the tile's button,
  the legend gets the id `<id>-label`, and the message `<id>-message`. The button is named
  by the label, described as required (for a required field) and by the error or warning
  message, and has `aria-invalid` (`true` while an error shows, `false` otherwise).

## Why

Assistive technology got no label, no error and no required state for a signature field,
and the info buttons of two signature fields on one page could not be told apart.

## Migration

Nothing required. Tests that find a signature field's button in a Form by its name
("Sign here digitally", "Signature (…)") now get the label in front of it: match the full
name or a pattern.

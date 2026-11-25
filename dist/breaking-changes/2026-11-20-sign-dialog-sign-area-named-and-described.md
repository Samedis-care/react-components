# The sign dialog's drawing area is a named image, and the dialog says how to sign

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` (`SignDialog`), and through it `non-standalone/SignaturePad`
  and the form renderer of `TypeSignature`

## What changed

- The canvas the user draws on has `role="img"` and the name "Signature area" (new i18n key
  `standalone.signature-pad.dialog.sign-area`).
- The dialog has an accessible description (`aria-describedby`): "Draw your signature in the
  signature area with a mouse, pen or finger." (`standalone.signature-pad.dialog.instructions`),
  or, while a stored signature is shown, "The saved signature is shown. To sign again, clear
  it first." (`standalone.signature-pad.dialog.instructions-signed`). The text is a visually
  hidden element between the title and the sign area, in the new slot `instructions`
  (`CcSignPadDialog-instructions`, `classes.instructions`). Nothing changes on screen.

## Why

The canvas had no role and no name, so screen readers left it out: exploring the dialog by
touch found nothing between the title and the buttons, and nothing said how to sign.

## Migration

Nothing required. Tests that look up images in the sign dialog by role (`getByRole("img")`)
now also find the canvas: query by name ("Signature" for a stored signature, "Signature
area" for the canvas).

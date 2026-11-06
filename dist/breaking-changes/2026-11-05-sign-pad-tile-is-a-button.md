# The signature tile is a button

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/SignPad`, `non-standalone/SignaturePad`

## What changed

The SignPad tile (also the tile of `SignaturePad` and of signature fields in a Form)
holds a `<button type="button">` that fills it, with the pen icon, the prompt and the
preview inside. The info button stays outside it.

- The tile is a Tab stop with a focus ring. Enter and Space call `openSignPad`, as a
  click does, and a dialog opened from it returns focus to the tile when it closes.
- Its accessible name is the prompt while unsigned and "Signature" once signed, followed
  by the signer, e.g. "Signature (Alice Müller)". So `signerName`, which the tile
  ignored, now takes effect, and `SignaturePad` passes it to the tile. New i18n key
  `standalone.signature-pad.with-signer` (`{{LABEL}} ({{NAME}})`).
- New slot `button` (`classes.button`, `CcSignPad` theme slot). `signTextDiv` and
  `imageDiv` are now children of the button, not of the root.
- In a Form, the field's blur handler runs when focus leaves the tile, which includes
  opening the dialog. So a signature field is marked touched then, as a text field is,
  and a required field opened and closed without saving can show its error.

## Why

The tile could not be reached or operated by keyboard and had no role or name. A mouse
user who closed the dialog ended with focus on the page body.

## Migration

Nothing to do in the apps. Two things to know:

- Styles that address the slots as direct children of the root
  (`.CcSignPad-root > div`) no longer match: the `button` slot sits in between.
  Styles on the root itself, or on a wrapper's direct `div` child, are unaffected.
- Tests that expect no button in a signature field (`queryByRole("button")`) now find
  the tile. Query the button you mean by its name.

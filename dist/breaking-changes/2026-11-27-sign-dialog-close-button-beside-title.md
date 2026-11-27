# SignDialog's heading holds only the title; the close button sits beside it

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog/SignPadDialog` (`SignDialog`), and so the dialog of
  `non-standalone/SignaturePad` and of the form renderer of `TypeSignature`

## What changed

The close button (slot `closeButton` of `CcSignPadDialog`) comes right after the dialog's
heading (slot `dialogTitle`, MUI's `DialogTitle`, an `h2`) instead of inside it. It is
still positioned absolutely on the dialog's paper, so it shows where it did, and the tab
order is the same.

Rules that select the button through the heading (descendant selectors under
`.CcSignPadDialog-dialogTitle` or `.MuiDialogTitle-root`, nested selectors in
`components.CcSignPadDialog.styleOverrides.dialogTitle` or `components.MuiDialogTitle`)
no longer reach it, and a heading made `position: relative` no longer positions it.

## Why

MUI's `Dialog` is named by its title, and a name taken from the heading's content
includes the buttons inside it: browsers named the dialog and its heading
"Sign here (Name) Close", which screen readers announced when the dialog opened and in
heading navigation. Now both are named by the title text alone.

## Migration

Required for any app with a rule that styles the close button through the heading (e.g.
`.CcSignPadDialog-dialogTitle button`): style the `closeButton` slot instead, with
`components.CcSignPadDialog.styleOverrides.closeButton` or `.CcSignPadDialog-closeButton`.

Other apps: nothing to do; the dialog looks as before.

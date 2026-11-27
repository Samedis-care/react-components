# The simple dialogs and DialogTitle's close button draw a keyboard focus ring; the dialogs keep their edge in forced colors

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog`: `ErrorDialog`, `InfoDialog`, `ConfirmDialog`,
  `InputDialog`, `FormDialog` (also the dialogs of `showErrorDialog`, `showInfoDialog`,
  `showConfirmDialog`, `showConfirmDialogBool` and `showInputDialog`), and `DialogTitle`
  (also in `FullFormDialog`, the locale selector and an app's own dialogs)

## What changed

While a button of these dialogs has keyboard focus (MUI's `Mui-focusVisible`), it draws a
2px solid outline in `palette.primary.main`, 2px outside the button, where MUI's own ring
sits. The close button of `DialogTitle` draws the same outline around its circle, as the
open-in-new button of `FullFormDialog` beside it does. MUI's focus ripple stays, and a
mouse click shows no ring.

In forced-colors mode (Windows High Contrast) the paper of these dialogs draws a 1px
`CanvasText` border. Without forced colors the paper looks as before.

When the theme sets MUI's `focusVisible` option, MUI draws that ring on the buttons and the
close button, and the dialogs add none of their own.

## Why

MUI's focus ripple, a faint disc at 30% of the text color (about 1.3:1 to 1.65:1 against
the dialog), was the only sign of keyboard focus, and forced colors do not draw it, so
there the focused button looked like the others (WCAG 2.4.7, 1.4.11). Forced colors keep
outlines. They also drop the paper's shadow, which was all that set the dialog apart from
the page behind it.

## Migration

Nothing to do, but expect the ring in screenshots of a dialog whose button has keyboard
focus. To restyle the close button's ring, override `&.Mui-focusVisible` in
`theme.components.CcDialogTitle.styleOverrides.closeButton`; to change the ring of every
button, set MUI's `focusVisible` theme option. An app's own MUI `Dialog` that uses
`DialogTitle` gets the ring on the close button, but no border on its paper: add
`"@media (forced-colors: active)": { border: "1px solid CanvasText" }` to its paper to give
it one.

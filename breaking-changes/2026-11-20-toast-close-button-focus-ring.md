# A toast's keyboard-focused close button draws a focus ring

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Toast` (also the toasts of `useToastContext`)

## What changed

While the close button of a toast has keyboard focus (MUI's `Mui-focusVisible`), it draws
a 2px solid outline in the toast's text color, 2px outside the button, as MUI's own ring
sits. MUI's pulsating focus ripple stays. This applies to every severity and variant. A
mouse click shows no ring.

When the theme sets MUI's `focusVisible` option, MUI's ring is the one shown (in a filled
toast: `palette.primary.main` on a 4px `background.default` halo) and the toast adds none.

## Why

The focus ripple, a faint disc of the text color (1.4 to 1.8:1 against the toast), was the
only sign of keyboard focus, and forced colors (Windows High Contrast) do not draw it, so
there focus was not shown at all (WCAG 2.4.7, 1.4.11). The text color contrasts with the
toast's fill in every severity, where `palette.primary.main` may not (blue on the info
fill), and forced colors keep outlines.

## Migration

Nothing to do, but expect the ring in screenshots of a toast whose close button has
keyboard focus. To restyle it, override `"& .MuiAlert-action .Mui-focusVisible"` in
`theme.components.CcToast.styleOverrides.alert`, or set MUI's `focusVisible` theme option.

# MultiLanguageInput's translate button draws a keyboard focus ring

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls/MultiLanguageInput` in single-line mode (and so a single-line `ModelDataTypeLocalizedStringRenderer`)

## What changed

Keyboard focus on the translate button at the end of a single-line field (the
`Mui-focusVisible` state) now draws a 2px solid outline in `palette.primary.main` around
the button, the ring the rest of the library draws. A mouse click shows no ring. MUI's
focus ripple stays.

When the theme sets MUI's `focusVisible` option, MUI draws that ring on the button, as it
does on its own buttons, and CC adds none of its own.

## Why

The focus ripple was the only focus indicator: a faint disc, about 1.5:1 against white, and
forced colors (Windows High Contrast) showed nothing of it, so a keyboard user could not
see that the button had focus (WCAG 2.4.7, 1.4.11). The outline contrasts with the page like
`primary.main` does, and forced colors keep outlines.

## Migration

Nothing to do, but expect the ring in screenshots of a keyboard-focused translate button.
To restyle it, set MUI's `focusVisible` theme option, which gives MUI's and CC's controls
one ring, or style `& .MuiIconButton-root.Mui-focusVisible` in the field's `sx`.

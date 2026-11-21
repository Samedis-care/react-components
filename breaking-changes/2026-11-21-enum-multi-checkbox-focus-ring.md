# The MUI multi-checkbox enum renderer draws a keyboard focus ring

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `ModelDataTypeEnumMultiCheckboxRendererMUI` (`backend-integration`), in forms

## What changed

A keyboard-focused option (MUI's `Mui-focusVisible`) of
`ModelDataTypeEnumMultiCheckboxRendererMUI` now gets a 2px solid outline in
`palette.primary.main` around its box, 2px away from the icon, with the theme's corner
radius: the ring `ModelDataTypeBooleanCheckboxRendererMUI` draws since 2026-11-13. MUI's
focus ripple stays. A mouse click shows no ring.

When the theme sets MUI's `focusVisible` option, MUI draws that ring on the option, as it
does on its own controls, and CC adds none of its own.

## Why

The focus ripple was the only focus indicator: a light disc of about 1.5:1 against the
form, and forced colors show nothing of it, so a keyboard user could not find the focused
option (WCAG 2.4.7, 1.4.11). The outline contrasts with the page like `primary.main` does,
and forced colors keep outlines.

## Migration

Nothing to do, but expect the ring in screenshots of keyboard-focused options. To give
MUI's and CC's controls one ring of your own, set MUI's `focusVisible` theme option.

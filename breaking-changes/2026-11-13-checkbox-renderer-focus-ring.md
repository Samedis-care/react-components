# The MUI checkbox renderer draws a keyboard focus ring

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `ModelDataTypeBooleanCheckboxRendererMUI` (`backend-integration`), in forms and
  in the data grid's inline-editable cells

## What changed

A keyboard-focused checkbox (MUI's `Mui-focusVisible`) of
`ModelDataTypeBooleanCheckboxRendererMUI` now gets a 2px solid outline in
`palette.primary.main` around its box, 2px away from the icon, with the theme's corner
radius. MUI's focus ripple stays. A mouse click shows no ring.

When the theme sets MUI's `focusVisible` option, MUI draws that ring on the checkbox, as it
does on its own controls, and CC adds none of its own.

The UIKit renderer (`ModelDataTypeBooleanCheckboxRendererCC`) already draws the same ring
through the UIKit Checkbox.

## Why

The focus ripple was the only focus indicator: a light disc of about 1.5:1 against the
cell or the form, and forced colors show nothing of it (WCAG 2.4.7, 1.4.11). The outline
contrasts with the page like `primary.main` does, and forced colors keep outlines.

## Migration

Nothing to do, but expect the ring in screenshots of keyboard-focused checkboxes. To give
MUI's and CC's controls one ring of your own, set MUI's `focusVisible` theme option.

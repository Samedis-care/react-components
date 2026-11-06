# ActionButton, SubActionButton and Checkbox draw a keyboard focus ring

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (ActionButton, SubActionButton, Checkbox)

## What changed

Keyboard focus (the `Mui-focusVisible` state) now draws a 2px solid outline in
`palette.primary.main`: around an ActionButton and around the Checkbox's box, 2px away
from them, and inside a SubActionButton, along its edges. MUI's focus ripple stays.

When the theme sets MUI's `focusVisible` option, MUI draws that ring on these controls,
as it does on its own buttons, and CC adds none of its own.

## Why

The focus ripple was the only focus indicator. It differs from the unfocused look by
1.5 to 1.9:1, and forced colors show nothing of it. The outline contrasts with the page
like `primary.main` does, and forced colors keep outlines.

## Migration

Nothing to do, but expect the ring in screenshots of keyboard-focused controls. To restyle
it, override `&.Mui-focusVisible` in the theme's `styleOverrides` (`CcActionButton.button`,
`CcSubActionButton.button`; `&.Mui-focusVisible > svg` in `CcCheckbox.root`), or set
MUI's `focusVisible` theme option to give MUI's and CC's controls one ring.

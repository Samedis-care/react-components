# A hovered small SubActionButton paints its icon in the hover's text color

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`SubActionButton`)

## What changed

While the pointer is over a `small` `SubActionButton`, its icon (every `svg` in the button)
is now painted `theme.palette.getContrastText(theme.palette.primary.light)`, the color the
same hover already gives the button's text. It used to be painted `background.default`,
which is white in a light theme. The hover fill (`primary.light`), the icon's color at rest
(`primary.main`) and the full-width button (without `small`) are unchanged.

## Why

The hover fills the cell `primary.light`. White on MUI's default `primary.light`
(`#42a5f5`) is 2.65:1, below the 3:1 that an icon identifying a button needs (WCAG 1.4.11
Non-text Contrast). With the default palette the hovered icon is now `rgba(0, 0, 0, 0.87)`,
7:1.

## Migration

Nothing required. A theme with its own `primary.light` gets the dark or light color that
MUI's `getContrastText` picks for it. A theme that overrides the hover background of the
`button` slot (`components.CcSubActionButton.styleOverrides.button`) sets the hovered icon's
`fill` there too if the new color doesn't suit that background. Expect the dark icon in
screenshots of a hovered small SubActionButton.

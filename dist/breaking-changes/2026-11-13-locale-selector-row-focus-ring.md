# The locale selector's rows draw a keyboard focus ring

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `non-standalone/LocaleSelector` (`LocaleSelectorDialog`'s rows)

## What changed

A keyboard-focused row (MUI's `Mui-focusVisible`) now draws a 2px solid outline in
`palette.primary.main`, inside the row along its edges, over MUI's `action.focus`
background. It is the ring of the library's menus and grids. A mouse click shows no ring.

When the theme sets MUI's `focusVisible` option, MUI draws that ring on the rows, as it does
on its own list items, and CC adds none of its own.

## Why

The focus background (12% grey, 1.32:1 against the dialog) was the only sign of the row
that Enter picks, and forced colors (Windows High Contrast) drop it, so nothing marked the
focused row (WCAG 2.4.7, 1.4.11). With a darker `action.hover`, as in samedis.care, the row
under the pointer looked more highlighted than the focused one. The outline contrasts with
the focused row like `primary.main` does (3.5:1 with MUI's default blue), and forced colors
keep outlines.

## Migration

Nothing to do, but expect the ring in screenshots of the locale dialog after keyboard use.
To restyle it, override `&.Mui-focusVisible` in `CcLocaleSelectorEntry`'s `root`
`styleOverrides`, or set MUI's `focusVisible` theme option.

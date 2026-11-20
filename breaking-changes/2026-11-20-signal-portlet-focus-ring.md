# SignalPortlet's linked rows and Refresh button draw a keyboard focus ring

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/SignalPortlet` (`SignalPortlet`'s Refresh button, `SignalPortletItem`'s linked rows)

## What changed

A keyboard-focused row with `link` (MUI's `Mui-focusVisible` on the `rootBtn` slot) draws a
2px solid outline in `palette.primary.main` inside the row along its edges, over MUI's
`action.focus` background.

The keyboard-focused Refresh button (the `refreshIconButton` slot) draws the same outline
inside its round edge, and no longer shows MUI's pulsating focus ripple, which would cover
the ring. A click still shows the click ripple and no ring.

When the theme sets MUI's `focusVisible` option, MUI draws that ring on both, as on every
ListItemButton and IconButton, and the card adds none of its own.

## Why

A focused row only turned light grey (1.32:1 against the card), close to a hovered row and
paler than one under a darker `action.hover` such as samedis.care's. The only sign of a
focused Refresh button was the faint pulsating ripple (about 1.44:1). Forced colors (Windows
High Contrast) drop both, so nothing showed which counter Enter opens (WCAG 2.4.7, 1.4.11).
An outline contrasts with the card like `primary.main` does (4.6:1 with MUI's default blue on
white, 3.5:1 on the focus background), and forced colors keep outlines. Both rings are
drawn inside: the rows span the card from edge to edge, and Refresh sits flush in its
bottom right corner.

## Migration

Nothing to do, but expect the ring in screenshots of SignalPortlet cards (SCF's Home page)
after keyboard use. To restyle it, override `&.Mui-focusVisible` in
`CcSignalPortletItem`'s `rootBtn` and `CcSignalPortlet`'s `refreshIconButton`
`styleOverrides`, or set MUI's `focusVisible` theme option.

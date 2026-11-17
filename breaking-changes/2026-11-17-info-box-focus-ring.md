# A keyboard-focused InfoBox header keeps its status color and draws a ring

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `standalone/InfoBox`

## What changed

While the header has keyboard focus (MUI's `Mui-focusVisible`), it keeps its status
background and text color, where MUI's AccordionSummary used to replace the background
with `palette.action.focus` (light grey). It also draws a 2px solid outline in its text
color, 2px inside its edges, so the status color shows on both sides of the ring. A mouse
click shows no ring.

The header draws this ring also when the theme sets MUI's `focusVisible` option, in place
of the theme's ring: that one is drawn outside the header, where the box's
`overflow: hidden` clips it, and in `palette.primary.main` it does not show on the info
header.

To draw the ring over the icon column's shade, the header is its own stacking context
(`isolation: isolate`) and the icon column (`iconButton` slot) sits at `z-index: -1` in it.

## Why

The grey took the status color away exactly while the user was on the header: white text
on it was 1.3:1, in dark mode the dark text was 1.7:1, and the grey was the only sign of
focus. Forced colors (Windows High Contrast) drop backgrounds, so there focusing a header
changed nothing visible (WCAG 2.4.7, 1.4.3, 1.4.11). The text color contrasts with the
status color as the heading does, and forced colors keep outlines.

## Migration

Nothing to do, but expect the ring in screenshots of keyboard-focused InfoBox headers
(identity-management-frontend's account pages). To restyle it, override
`"&.Mui-focusVisible"` in `theme.components.CcInfoBox.styleOverrides.summary`. A theme that
sets the header's `backgroundColor` there sets it under `"&.Mui-focusVisible"` too, or the
focused header shows the palette's status color.

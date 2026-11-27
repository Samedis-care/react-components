# A SignalPortlet zero count is readable

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/SignalPortlet` (`SignalPortletItem`'s slot `itemColorInactive`)

## What changed

The avatar of a count of 0 takes the grey of MUI's Avatar without an image, with the
palette's contrast text for that grey:

| Palette | Before                                                                  | Now                                            |
| ------- | ----------------------------------------------------------------------- | ---------------------------------------------- |
| light   | white on `action.disabled` (`rgba(0, 0, 0, 0.26)`)                      | `rgba(0, 0, 0, 0.87)` on `grey[400]` (#bdbdbd) |
| dark    | `rgba(0, 0, 0, 0.87)` on `action.disabled` (`rgba(255, 255, 255, 0.3)`) | white on `grey[600]` (#757575)                 |

The light disc looks as before and its "0" is dark; the dark disc is a little lighter and
its "0" is white. Both colors are opaque now.

With a theme of CSS variables, the dark scheme gets the dark palette's colors; before, every
scheme had the colors of the theme's default scheme. The slot sets them through the custom
properties `--cc-signal-portlet-inactive-color` and `--cc-signal-portlet-inactive-background`,
so a `color` and `backgroundColor` that the theme sets for `itemColorInactive` apply in every
scheme.

## Why

The count is content, and text needs 4.5:1 (WCAG 1.4.3). White on the translucent grey was
1.88:1 on a white card, and the dark text in the dark palette 3.16:1. The new pairs are
9.4:1 (light) and 4.61:1 (dark).

## Migration

Nothing to do; expect the dark "0" in the light palette and the white "0" on a lighter disc
in the dark palette in screenshots. A theme that sets its own `color` and `backgroundColor`
in `components.CcSignalPortletItem.styleOverrides.itemColorInactive` keeps its colors.

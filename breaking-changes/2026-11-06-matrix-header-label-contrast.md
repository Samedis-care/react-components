# MatrixGrid's today and accent header labels are darkened to 4.5:1

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

The day number in the header of the `current` column (today) and of the `accent` column
keeps its color only if it has at least 4.5:1 against that header's tinted background.
Otherwise the grid darkens it (in a dark theme: lightens it) just enough, keeping its hue:

| Palette                                        | Today's label                                | Accent label                               |
| ---------------------------------------------- | -------------------------------------------- | ------------------------------------------ |
| MUI default, light                             | `warning.dark` `#e65100` → `rgb(184, 64, 0)` | `info.main` `#0288d1` → `rgb(1, 102, 156)` |
| `warning.main` `#FFCF00` (samedis.care), light | `rgb(178, 144, 0)` → `rgb(133, 108, 0)`      | as above                                   |
| MUI default, dark                              | `warning.light`, unchanged                   | `info.main`, unchanged                     |

The grid root computes the colors from the theme and sets them as the custom
properties `matrixVars.currentLabelColor` and `matrixVars.accentLabelColor`, which
a `renderColumnHeader` can use for its own labels (`color: "var(--cc-matrix-current-label-color)"`).

Neither samedis-ui nor identity-management-frontend uses `MatrixGrid` today.

## Why

The labels had 3.25:1 (today) and 3.00:1 (accent) in MUI's default light palette, and
2.86:1 for today with samedis.care's yellow warning color. The label is 0.8rem bold,
normal-size text, which needs 4.5:1 (WCAG 1.4.3).

## Migration

Nothing to do. Expect darker day numbers for today and the accent day in screenshots of
light themes.

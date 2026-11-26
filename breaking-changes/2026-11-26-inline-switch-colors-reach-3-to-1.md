# InlineSwitch's colors reach 3:1 and follow the theme's color scheme

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`, and so the switch of `BaseSelector` and
  `MultiSelectWithoutGroup` with `displaySwitch`, and of the selectors built on them

## What changed

The switch takes these colors from the theme's palette:

| Part                   | Before         | Now                    |
| ---------------------- | -------------- | ---------------------- |
| Thumb, off             | `grey[500]`    | `text.secondary`       |
| Track's edge, off      | `grey[500]`    | `text.secondary`       |
| Track, off             | `common.white` | `background.paper`     |
| Thumb, on              | `common.white` | `primary.contrastText` |
| Track and its edge, on | `primary.main` | `primary.main`         |

With MUI's light palette the switch is off with a darker thumb and edge (`rgba(0, 0, 0, 0.6)`
instead of `#9e9e9e`), and on as before. With MUI's dark palette the off switch is a dark
track with a light edge and thumb instead of a white pill, and the on switch has a dark thumb
on the light `primary.main` instead of a white one. A disabled switch looks as before.

With a theme of CSS variables (`cssVariables`), these colors, the color of a disabled
switch's label and the opacity of a disabled switch's track that is on come from the
variables, so they follow the current color scheme. Before, they were those of the theme's
default scheme in every scheme.

## Why

The thumb is the only sign of whether the switch is on, and the track's edge shows where the
control is. WCAG 1.4.11 asks for 3:1 for both. With MUI's default palettes, the off thumb had
2.68:1 against the white track and the track's edge 2.68:1 against a white page; with the dark
palette, the white thumb had 1.75:1 against the on track. Now the off thumb and edge have
5.7:1 (light) and 9.4:1 (dark), and the on thumb 4.6:1 (light) and 10:1 (dark). `text.secondary`
is the color of MUI's own unchecked Checkbox and Radio.

## Migration

Nothing to do; expect the darker off switch in screenshots, and the new look in a dark palette.

- With a custom palette, the switch has the contrast of these pairs: `text.secondary` against
  `background.paper` and the page, `primary.contrastText` against `primary.main`. Check that
  they reach 3:1. MUI picks `contrastText` to reach 3:1 unless the palette sets it.
- To draw the switch in other colors, set them in the theme through `CcInlineSwitch`
  `styleOverrides.switch`, e.g.
  `switch: { "& .MuiSwitch-switchBase": { color: … }, "& .MuiSwitch-track": { borderColor: … } }`.

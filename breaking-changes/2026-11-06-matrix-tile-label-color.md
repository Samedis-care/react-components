# Matrix tile labels are black or white by contrast, for every fill

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

An entry of `MatrixCellTile` (`MatrixTileItem`) without a `textColor` now gets black
(`#000`) or white (`#fff`), whichever has the higher contrast with its `backgroundColor`.
That is at least 4.5:1 on any fill. It used to get `theme.palette.getContrastText`:

- On mid-tone fills, labels that were white are now black: `warning.main`, `info.main`,
  and teal, red, pink and blue grey 500, among others.
- On light fills, labels are `#000` instead of `rgba(0, 0, 0, 0.87)`.
- A keyword fill (`navy`, `darkgreen`) gets a label color. It used to get none, so the label
  inherited the page's text color.
- A translucent fill (`rgba(21, 101, 192, 0.15)`, `#1565c026`) is measured as it shows, over
  the theme's `palette.background.paper`. It used to get the color for the opaque fill, so
  a pale fill got a white label.
- `palette.contrastThreshold` no longer affects tile labels.

## Why

Tile labels are 10-14px text, which needs 4.5:1 (WCAG 1.4.3). With the default
`contrastThreshold` of 3, `getContrastText` picks white as soon as white reaches 3:1, so
labels were white at 3.1-4.4:1 on common fills, and keyword and translucent fills were not
measured at all.

## Migration

Nothing to do. Entries that pass `textColor` are unaffected. A fill given as a `var()`
still derives no label color: pass `textColor` with it.

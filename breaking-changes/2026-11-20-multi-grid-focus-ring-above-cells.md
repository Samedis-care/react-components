# The grid's focus ring is drawn above its cells

- **Date:** 2026-11-20
- **Kind:** behavior, theme
- **Scope:** `standalone/Virtualized`, `standalone/DataGrid`

## What changed

The focus ring of the grid's tab stop (the scrolling pane, or the header pane while there
are no data rows) is drawn by a box over that pane, the last child of MultiGrid's root,
after the four panes. It is the same ring as before: a 2px solid outline in
`palette.primary.main`, 2px inside the pane's edges, shown while the pane has keyboard
focus (`:focus-visible`), not after a click. The box takes no clicks; they reach the cells
under it. The pane itself no longer has an outline.

The box is the new `CcMultiGrid` theme slot `focusRing`, and `MultiGridClassKey` has the
matching `"focusRing"` entry.

## Why

The browser paints the outline of a scroll container under its cells, which are
positioned, so opaque cells hid the ring: samedis.care's colored data cells, DataGrid's
header cells while the header pane is the tab stop, and every cell in forced colors
(Windows High Contrast). A keyboard user on the grid saw no focus indicator (WCAG 2.4.7).
The box is painted above the cells, and as an outline it stays in forced colors.

## Migration

Nothing to do, but expect the focus ring in screenshots of a keyboard-focused grid, also in
samedis.care, where it did not show before. To restyle it, override
`theme.components.CcMultiGrid.styleOverrides.focusRing` (e.g. `outlineColor`). A theme
that set an outline on the `topRightGrid` or `bottomRightGrid` slot under
`&:focus-visible` moves it there: the focused pane's own outline is off.

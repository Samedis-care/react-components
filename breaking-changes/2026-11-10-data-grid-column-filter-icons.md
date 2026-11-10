# The DataGrid's column-header filter buttons show an outlined funnel, and a filled one while the column is filtered

- **Date:** 2026-11-10
- **Kind:** behavior, theme
- **Scope:** `standalone/DataGrid` (`DataGridColumnHeaderFilterIcon`,
  `DataGridColumnHeaderFilterActiveIcon`, theme slots `columnHeaderFilterIcon` and
  `columnHeaderFilterActiveIcon`)

## What changed

- The filter button in the header of a filterable column shows MUI's outlined funnel
  (`FilterAltOutlined` from `@mui/icons-material`) while the column has no filter value, and
  MUI's filled funnel (`FilterAlt`) while it has one. Both states used to draw the library's
  solid `FilterIcon`.
- Both icons have MUI's small icon size: `fontSize` 20px (`theme.typography.pxToRem(20)`).
  They used to be 16px wide (`width: 16`, `height: "auto"`). MUI's funnel is padded inside its
  box, so the visible funnel is about 13px wide instead of 16px.
- The button's color is unchanged: `inherit` (the header's primary color) while idle, and
  `secondary.main` while the column is filtered (`CcDataGrid-columnHeaderFilterButtonActive`).
- The types of the two exports stay `SvgIconComponent`.

## Why

A filtered column differed from the others only in the button's color. In the default theme
the blue and the purple are hard to tell apart for color-blind users, and in forced-colors
mode (Windows High Contrast) every funnel is drawn in the same system color, so a user could
not see which column narrows the list. The filled funnel marks the filtered column by its
shape. Outlined for "off" and filled for "on" is Material's convention for a state, and the
icons now match the MUI icons around the grid.

## Migration

- Nothing to do for an app that doesn't style these slots: expect the new funnels in the
  column headers of every DataGrid (screenshots, visual tests).
- Required for a theme that sizes `columnHeaderFilterIcon` or `columnHeaderFilterActiveIcon`
  with `width` or `height` (`components.CcDataGrid.styleOverrides`): those values now size a
  MUI icon on its 24-unit grid. Set `fontSize` instead, or drop the override to keep MUI's
  small size.
- A theme that colors the filtered state (`columnHeaderFilterButton` with
  `&.CcDataGrid-columnHeaderFilterButtonActive`) keeps working. The color now adds to the
  shape instead of carrying the state alone, but the funnel still needs a contrast of at least
  3:1 against the header background to be visible.

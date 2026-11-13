# MultiGrid sets its header's overflow, and a scroll of the header moves the body

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Virtualized`, `standalone/DataGrid`

## What changed

- `MultiGrid` sets the overflow of its header (top-right) pane itself: `hidden` while
  there are data rows, and sideways scrolling (`overflowX: "auto"`, `overflowY: "hidden"`)
  while there are none. `overflow`, `overflowX` and `overflowY` in `styleTopRightGrid` no
  longer apply. A header pane left on react-window's default `overflow: auto` used to
  scroll by itself under the wheel or a trackpad swipe while there were data rows.
- When the header pane scrolls anyway, because the browser reveals an element focused in
  it (in `DataGrid` a column's filter button), the scrolling (bottom-right) pane follows
  to the same horizontal position.
- `DataGrid` no longer sets the header's overflow itself.

## Why

The header followed the scrolling pane, but not the other way round. Tabbing to the
filter button of a column outside the visible area scrolled only the header, so every
column header sat over the wrong column until the grid was next scrolled sideways.

## Migration

Nothing to do for `DataGrid`. A direct `MultiGrid` consumer can drop the overflow from
`styleTopRightGrid`.

# MultiGrid's header and pinned column leave room for the scrolling pane's scrollbars

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Virtualized`, `standalone/DataGrid`

## What changed

Where scrollbars take up space (Windows, most Linux desktops, macOS with "always show
scrollbars"), `MultiGrid` measures the scrollbars of its scrolling (bottom-right) pane and
sizes the other panes to match:

- The header (top-right) pane is narrower by the width of the vertical scrollbar, and the
  pinned-column (bottom-left) pane is shorter by the height of the horizontal scrollbar.
  The corner above the vertical scrollbar and the corner left of the horizontal scrollbar
  show the grid's background. The panes keep their sizes when no scrollbar is shown, as
  with overlay scrollbars.
- The scrolling pane shows its horizontal scrollbar only when the columns do not fit
  (`overflowX: "auto"`). It used to show an empty track at all times.
- The pinned-column pane shows no scrollbars in any browser. Browsers without
  `scrollbar-width` (Safari before 18.2) used to show a horizontal scrollbar there, with a
  white track and a grey thumb.
- With `globalScrollListener`, PageUp and PageDown scroll by the height the scrolling pane
  shows, not counting its horizontal scrollbar. They used to scroll by `height` minus the
  pinned rows.

The same applies to `DataGrid`, whose content is a `MultiGrid`.

## Why

The header and the pinned column have no scrollbars, so they had a larger viewport and a
shorter scroll range than the scrolling pane. Scrolled to the right or bottom end, the
header labels (in DataGrid the column headers with their filter buttons) sat a scrollbar's
width away from their columns, and the pinned cells (DataGrid's selection checkboxes) a
scrollbar's height away from their rows. PageDown also skipped a scrollbar's height of
rows on every press.

## Migration

Nothing to do. On systems where scrollbars take up space, screenshots of a grid change:
the header ends above the vertical scrollbar, the pinned column ends above the horizontal
scrollbar, and a grid whose columns all fit has no horizontal scrollbar.

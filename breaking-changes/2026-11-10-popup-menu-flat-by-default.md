# PopupMenu is flat by default

- **Date:** 2026-11-10
- **Kind:** behavior, type
- **Scope:** `standalone/PopupMenu`

## What changed

- `elevation` defaults to `0`, so a PopupMenu without `elevation` has no shadow: its 1px
  `theme.palette.divider` border is its only outline. Before, it took MUI's default of 8 and
  drew the border on top of a shadow.
- `elevation` still works: a value above 0 draws MUI's shadow of that depth in addition to the
  border.
- `components.MuiMenu.defaultProps.elevation` no longer reaches a PopupMenu, as PopupMenu sets
  `elevation` itself.
- The component's props type is the new exported `PopupMenuProps` (MUI's `MenuProps` with the
  `elevation` default documented as 0) instead of `typeof Menu`.
- Placement and mounting are unchanged and stay MUI's `Menu` defaults: the menu opens below its
  anchor, aligned at the anchor's start edge, and its items leave the page while it is closed.
- The DataGrid's menus (more options, reset, export, footer more) look the same: they passed
  `elevation={0}` before and now rely on the default.

## Why

The border outlines the menu the way MUI's outlined Paper does, and every menu in the library
is flat. A PopupMenu without props drew both the border and a shadow.

## Migration

- Nothing to do for a PopupMenu that passes `elevation={0}`; the prop can be dropped.
- A PopupMenu that should keep the shadow passes `elevation={8}`.

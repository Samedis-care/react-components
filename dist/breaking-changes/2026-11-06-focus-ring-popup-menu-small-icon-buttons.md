# PopupMenu items and the Small icon buttons draw a focus ring

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/PopupMenu`, `standalone/Small`

## What changed

A keyboard-focused element (MUI's `Mui-focusVisible`) now gets a 2px
`theme.palette.primary.main` outline, the ring the rest of the library draws:

- `PopupMenu`: the focused `MenuItem`, inset by 2px inside the item, over MUI's
  `action.focus` background.
- `SmallIconButton`: around the button (32x32 with a default icon).
- `SmallestIconButton`: 2px outside the button, which has no padding, so the ring keeps
  clear of the glyph.

A mouse click shows no ring. MUI's focus ripple and background stay as they were.

In the library this reaches the four DataGrid menus (header actions, reset, export, and
the footer's "more" menu on phones), the DataGrid header actions at md and up, the
DataGrid footer actions, and the remove buttons of the Selector's multi-select entries.

## Why

Keyboard focus on these elements was shown only by MUI's tint (1.33:1 against white) or
its focus ripple (below 2:1), and forced colors (Windows High Contrast) dropped both, so
the focused element looked like the others (WCAG 2.4.7, 1.4.11). With a darker
`action.hover`, as in samedis.care, the menu item under the pointer looked more
highlighted than the one Enter activates.

## Migration

Nothing to do. Expect the ring in screenshots of keyboard-focused menus and DataGrid
actions. A theme or call site that wants another look styles
`.MuiMenuItem-root.Mui-focusVisible` (inside `CcPopupMenu`) or the button's
`&.Mui-focusVisible`.

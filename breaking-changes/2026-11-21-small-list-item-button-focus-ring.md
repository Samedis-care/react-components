# SmallListItemButton draws a keyboard focus ring

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/Small` (`SmallListItemButton`), and through it the clickable entry
  rows of `standalone/Selector`'s `MultiSelect` and what is built on it (`BackendMultiSelect`,
  the model's multi-select renderers)

## What changed

A keyboard-focused `SmallListItemButton` (MUI's `Mui-focusVisible`) now draws a 2px solid
outline in `palette.primary.main`, just inside its edges, over MUI's `action.focus`
background. It is the ring of the Small icon buttons, the menus and the grids. A mouse
click shows no ring.

When the theme sets MUI's `focusVisible` option, MUI draws that ring, inside the button as
on its own list items, and CC adds none of its own.

In the library this reaches the entry rows of a `MultiSelect` whose entries have an
`onClick`, for example entries that open the selected role or team.

## Why

The focus background (12% grey, 1.32:1 against white) was the only sign of the focused
entry row, and forced colors (Windows High Contrast) drop it, so the focused row looked
like the others (WCAG 2.4.7, 1.4.11). The outline has the contrast of `primary.main`
against the focused row (3.5:1 with MUI's default blue on the grey), and forced colors keep
outlines.

## Migration

Nothing to do, but expect the ring in screenshots of keyboard-focused entry rows. To
restyle it, override `&.Mui-focusVisible` in `CcSmallListItemButton`'s `root`
`styleOverrides` (or in `CcMultiSelectEntry`'s `selected` for the multi-select rows), or set
MUI's `focusVisible` theme option.

# The Small list items narrow MUI's gutters, and MultiSelect's entries move 8px to the left

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/Small`, `standalone/Selector` (MultiSelect and everything built on
  it: BackendMultiSelect, the form multi selectors, the model's multi-select renderers)

## What changed

The list items of `standalone/Small` now have the gutters (left and right padding) they
are made for. They used to render MUI's 16px on both sides, like MUI's own `ListItem` and
`ListItemButton`.

| Component                                              | Left | Right |
| ------------------------------------------------------ | ---- | ----- |
| `SmallListItem`, `SmallListItemButton`                 | 8px  | 8px   |
| `SelectorSmallListItem`, `SelectorSmallListItemButton` | 0    | 8px   |

- `disableGutters` removes the gutters. On `SmallListItem` and `SelectorSmallListItem`,
  `disablePadding` removes all padding, and with `secondaryAction` the right padding stays
  MUI's 48px, so the text keeps clear of the action.
- `sx`, `styled()` and theme overrides of a component built on them still set the padding.

In the library this moves the rows of MultiSelect's selected entries: their text starts
8px from the edge instead of 16px. That holds for entries with and without `onClick`,
so both kinds stay aligned. The Selector's option rows keep their 16px.

## Why

The gutter rules selected a descendant of the item, but MUI puts the gutters class on the
item itself, so they never applied.

## Migration

Nothing to do. Expect the selected entries of multi selects 8px further left in
screenshots. A theme that wants the old spacing back sets
`CcMultiSelectEntry.styleOverrides.selected` to `{ paddingLeft: 16, paddingRight: 16 }`.

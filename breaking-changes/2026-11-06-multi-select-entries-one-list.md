# MultiSelect lists its entries in one list, and only an entry with onClick is a button

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Selector`

## What changed

The markup of MultiSelect's selected entries changed. They look the same as before, in the
default theme and with SCF's theme.

- The selected entries are the items of one `<ul>`. Each `MultiSelectEntry` renders one
  `<li>` (MUI `ListItem`), which is its `root` slot. It used to render a `<ul>` per entry.
- The row (`selected` slot) is a button only when the entry has `onClick`. Without
  `onClick` it is a plain `<div>`: no tab stop, no hover tint, no ripple. It used to be a
  `role="button"` element in every case, also while the MultiSelect was disabled.
- The remove button (`icon` slot) is beside the row in the `<li>`, not inside it. Hovering
  it no longer tints a clickable row.
- The divider (`enableDivider`, `divider` slot) is inside the `<li>`, along its bottom
  edge. It used to follow the entry's `<ul>`. MultiSelect does not show dividers yet.
- A custom `selectedEntryRenderer` is rendered inside the `<ul>`, so its root must be an
  `<li>`, for example MUI's `ListItem`.

## Why

Screen readers announced one single-item list per entry, made of unnamed buttons that
contained their own remove button. Keyboard users stopped on every row, although a row does
nothing unless its entry has `onClick`, so three entries took seven Tab presses.

## Migration

- Theme overrides of `CcMultiSelectEntry`'s `root` now style the `<li>`. Its vertical
  padding is the space around an entry, as the `<ul>`'s was, so padding overrides keep
  their effect. SCF's overrides of `root` and `selected` need no change.
- Styles or tests that select the per-entry `ul`/`.MuiList-root`, or a
  `.MuiListItemButton-root` row of an entry without `onClick`, have to use the slot classes
  (`classes.root`, `classes.selected`) or roles instead.
- A custom `selectedEntryRenderer` has to render an `<li>` as its root.

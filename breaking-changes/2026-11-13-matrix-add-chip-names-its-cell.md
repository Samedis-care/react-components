# The Matrix add chip is named after its cell

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

The add chip of `MatrixGrid` (the "+" button on an occupied cell that accepts an entry) has
a different accessible name and tooltip:

- Its name is `addLabel`, then the row's `label`, then the column's new `name`, joined with
  commas: "Add, Alice Weber, Thursday, March 5, 2026". It used to be `addLabel` alone, the
  same on every chip of the grid. A part that is missing is left out.
- The name is visually hidden text inside the chip (the new `addChipLabel` slot and
  `classes` key), no longer an `aria-label`. An `addLabel` that is a node, such as a
  `<Trans>` element, now names the chip too. It used to leave the chip without a name.
- The tooltip (`title`) is the whole name when `addLabel` is a string, and there is none
  when it is a node, as before.
- `MatrixColumn` has a new optional `name`: the column in words. Without it, a chip
  uses the column's `label` if that is a string or a number.
- `buildDateColumns` sets `name` to the full date in the given locale ("Thursday, March 5,
  2026", "Donnerstag, 5. März 2026").

The hover hint on a cell still shows `addLabel` alone.

## Why

The chip shows only an icon. Named by `addLabel` alone, every chip sounded the same to a
screen reader ("Add, button" on every cell), so a user tabbing through could not tell
which person and day a chip adds to, and a node `addLabel` left every chip without a name.

## Migration

Nothing to do for grids that build their columns with `buildDateColumns` and give their
rows a `label`. Columns built by hand can set `name` to what the column stands for.

Tests or scripts that find the chip by its name (`getByRole("button", { name: "Add" })`)
or by its `aria-label` need the new name, or a pattern such as `{ name: /^Add,/ }`.

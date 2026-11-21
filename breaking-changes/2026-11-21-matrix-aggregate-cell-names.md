# Matrix aggregate cells say their badge and their column

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

The cells of a `MatrixExtraRow` with `onCellClick` (buttons) have new accessible names:

- A cell that shows a badge is announced with the badge first, then its name: "2 Open
  demand, Thursday, March 5, 2026", or "2 " followed by what `getCellLabel` returns. The
  name used to replace the cell's content, so the badge was never announced. The cell keeps
  its `aria-label` and is now also labelled by its badge (`aria-labelledby`, the badge and
  then the cell itself).
- Without `getCellLabel`, a cell is named by the row's `label` and the column's name
  (`MatrixColumn.name`, or its `label` when that is text), joined with a comma: "Open
  demand, Thursday, March 5, 2026". It used to be named by `label` alone, the same on every
  cell of the row. A `getCellLabel` that returns an empty string is treated the same way.
- Without `label`, the row is named by its `header` when that is a string or a number.
- A cell whose row and column have no name at all is named by its badge, or "Add" in the
  current language for the "+" it shows without a badge (new translation key
  `standalone.matrix.extra-cell-add`). It used to be a button without a name.

Cells of an aggregate row without `onCellClick` are unchanged.

## Why

The badge is the value the row exists to show, yet a screen reader heard only the name.
With `label` alone, every cell of a row (up to one per day of the range) sounded the same,
and without `label` the cells without a badge had no name at all.

## Migration

**Required for apps whose `getCellLabel` already includes the badge's value** ("2 open
requests on March 5"): the value is now announced twice. Leave it out of the text:

```tsx
getCellLabel: (columnKey) => `Open requests on ${formatDay(columnKey)}`,
```

Nothing else to do. Tests or scripts that find an aggregate cell by its name need the new
name: with a badge it starts with the badge (`{ name: "2 Open demand on 2026-03-05" }`), and
without `getCellLabel` it ends with the column's name (`{ name: /^Open demand, / }`).

# Matrix columns are 56px wide by default, and the add chip is 24x24

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Matrix`

## What changed

- `MatrixGrid`'s `columnWidth` defaults to `56` (px). It used to be `46`. A grid that does
  not set `columnWidth` is 10px wider per column, 300px over 30 days.
- The add chip (the "+" button on an occupied cell that accepts an entry) is 24x24px. It
  used to be 26x20px. It stays in the same corner, 3px from the cell's right and bottom
  edges, so it covers 4px more of the entry beneath it in height and 2px less in width.
  Its size includes its border (`box-sizing: border-box`), with or without a global
  `box-sizing` rule such as `CssBaseline`'s.
- The documentation of `columnWidth`, `rowHeight` and `MatrixCellTile`'s `splitDirection`
  states which sizes keep clickable entries at 24px or more.

## Why

A clickable target smaller than 24x24px is hard to hit with a finger or an unsteady
pointer (WCAG 2.5.8 Target Size (Minimum)). At 46px, the two entries of a split pair were
19.5px wide each and 2px apart, so a tap aimed at one could open the other. The chip was
20px high and lies on an entry, so a tap aimed at the entry could add instead. At 56px
each entry of a pair is 24.5px wide; stacked (`splitDirection="column"`) at the default
`rowHeight` of 58, each is 25.5px high and keeps at least 24px beside the chip.

## Migration

- A grid that relies on the default gets wider columns: expect it in screenshots and
  layouts. Passing `columnWidth={46}` keeps the old width, and with it entries of a split
  pair narrower than 24px.
- A grid that sets its own `columnWidth` keeps it. Below 55, cells that show two entries
  side by side (`splitDirection="row"`, the default) have entries narrower than 24px; use
  56 or more. The same holds for `rowHeight` with `splitDirection="column"`.
- Tests or screenshots that measure the chip see 24x24px.

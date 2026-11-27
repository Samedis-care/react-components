# On phones the DataGrid footer's row counts are read out in words

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` and the grids built on it that show its footer (`BackendDataGrid`, `CRUD`)

## What changed

- On phones (the theme's xs breakpoint) the footer still shows the short counts, "#10" or
  "#3/10", but assistive technology skips them and reads the words of the wider layouts
  instead: "Total: 10" or "Filtered: 3 Total: 10" (the translations
  `standalone.data-grid.footer.counts` and `.counts-filtered`).
- The count's element (theme slot `paginationText`) holds two `span`s there: the short
  counts with `aria-hidden="true"`, then the words, visually hidden. Wider layouts are
  unchanged.
- The box around the count is `position: relative`, so the words' 1px box lies inside it.

## Why

A screen reader read "#3/10" as "number 3 slash 10", which tells neither what is counted
nor which number is the filtered one.

## Migration

Nothing to do; the footer looks the same. A test that reads the `textContent` of the count
on a phone now gets both texts ("#3/10Filtered: 3 Total: 10"): find the shown part by its
text (`getByText("#3/10")`) instead. A theme override of `paginationText` that styles the
element's children now reaches the two `span`s.

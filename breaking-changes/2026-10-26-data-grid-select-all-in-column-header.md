# DataGrid shows select all in the selection column header too

- **Date:** 2026-10-26
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` with `enableSelectAll`, and the grids built on it
  (`BackendDataGrid`, `CRUD`)

## What changed

With `enableSelectAll`, the header of the selection column (the top-left cell, empty before)
shows the select all checkbox as well. It is the same control as the one in the footer: both show
the same state, and either one checks or unchecks select all. With `disableFooter`, it is the only
one.

It has no visible label; its accessible name is the footer's label ("All", or "First" and the
limit with `limitSelectAll`).

The `CcDataGrid` `selectAllCheckbox` style applies to both checkboxes. The new `selectAllHeader`
slot wraps the header one, at the top of the cell like the column header labels.

## Why

Users look for select all at the top of the selection column, where most tables put it.

## Migration

Nothing to do; expect the checkbox in the selection column header in screenshots.

- A `selectAllCheckbox` style override now styles the header checkbox too. To style the header
  one differently, override it through `selectAllHeader` (`"& .MuiCheckbox-root": …`).

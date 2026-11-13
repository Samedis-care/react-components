# A data grid clamps stored column widths to the column's limits when it opens

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` with a persistence provider (`DataGridLocalStoragePersist`,
  `DataGridStorageManagerPersist`, a custom `DataGridPersistentStateContext`), and `CRUD`

## What changed

A stored column width is clamped like a resize when the grid opens: raised to the header's
minimum (64px, 96px for a filterable column) and to the lower limit of the column's `width`,
lowered to its upper limit. The widths of columns that are not defined during the visit stay
as they are.

- A user who stored narrow widths (a first visit on a phone, at a high zoom level, or edited
  data) sees the columns wider from now on, with the header's sort and filter buttons in view.
- A column whose `width` limits were tightened after a user stored its width opens within the
  new limits, instead of jumping there on the first drag.
- The clamped widths are written with the grid's next change, as any other state.

## Why

A header cell narrower than its padding and buttons overlapped the next one: its filter button
sat under the next header, could be focused but not seen, and a click on it sorted the
neighbouring column. Stored widths were restored on every visit, so the overlap stayed.

## Migration

Nothing to do in the apps.

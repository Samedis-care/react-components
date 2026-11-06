# A data grid writes its persisted state when it changes, not when it opens

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`DataGridPersistentStateContext`, `DataGridLocalStoragePersist`,
  `DataGridStorageManagerPersist`), and `CRUD`, which wraps its grid in one of them

## What changed

A grid no longer calls the persistence setter when it opens. It calls it when the data it
persists changes: a filter, sort, search or custom data change, a column shown, hidden, pinned
or resized, or the first auto-fit of the column widths on a grid that has not stored it yet.

- Opening a grid, leaving and opening it again without a change writes nothing. With
  `DataGridStorageManagerPersist` that is one write per storage bucket less on every grid visit.
- Data in the format from before 2026-08-26 is written in the current format with the next
  change, as the 2026-08-26 entry says. It is no longer rewritten when the grid opens.
- What a visit cannot read stays stored until the grid's state changes: the sort and filter of
  a column that is not defined during this visit, or data written by a newer library version.

## Why

Every grid visit wrote the state it had just read. For server storage that was a request per
visit, and it replaced what the visit could not read with what it could.

## Migration

Nothing to do in the apps. A custom persistence provider gets its setter called with a grid's
first change, not when the grid mounts.

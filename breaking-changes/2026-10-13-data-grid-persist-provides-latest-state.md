# DataGrid persistence provides the latest state

- **Date:** 2026-10-13
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`DataGridStorageManagerPersist`, `DataGridLocalStoragePersist`,
  `DataGridPersistentStateContext`), and `CRUD`, which wraps its grid in one of them

## What changed

The data a persistence provider hands out through `DataGridPersistentStateContext` is what was
written to it last. It used to be what the provider read from storage when it mounted, for as
long as it stayed mounted:

- A grid mounted again under the same provider starts from the state it left. For example a
  `CRUD` with `disableBackgroundGrid`, back from a record: the filters, search, sort, columns and
  custom data changed since the page was opened stay. It used to start from the state stored
  when the page was opened.
- Code that reads the context gets the grid's current state, and renders again when it is
  written (a filter, sort, search or custom data change, a column resize step).

When the storage keys change, the provider hands out what is stored under the new keys, as
before.

## Why

The providers wrote every change to storage, but kept handing out the data they had read on
mount. Everything reading the context after that got the state from when the page was opened.

## Migration

Nothing to do. Code that reads `DataGridPersistentStateContext` renders again on every write
now; keep expensive work on its value out of render.

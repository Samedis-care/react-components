# A grid leaves the stored parts its `persist` leaves out as they are

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`DataGrid` `persist`, `DataGridPersistentStateContext`)

## What changed

- A grid whose `persist` leaves out a part (`"columns"`, `"sort"` or `"filters"`) writes what is
  stored for that part back as it is. Before, its first write dropped the parts it leaves out:
  `persist={["columns", "sort"]}` removed the stored filters, search and custom data.
- Grids with different `persist` settings under one provider (or one storage key) keep each
  other's parts. Grids that persist the same part still share it.
- The data the setter of a persistence provider gets holds the whole state: the parts the grid
  persists, and the others as the provider handed them out (legacy data in the current format;
  nothing of data in a newer format version, as before).

## Why

`persist` reads as "what to persist", but a grid that persisted a part of its state erased the
rest of what was stored under its key, so two grids with different settings on one key erased
each other's state.

## Migration

- Nothing to do for an app whose grids persist everything (the default).
- An app that gives a grid with a smaller `persist` a storage key of its own only to keep it from
  erasing another grid's state may share the key again. The grids then share the parts both of
  them persist.
- Required for any app that relies on a smaller `persist` to clear the stored parts it leaves out:
  clear them in the storage itself. Without it, they stay stored, and a grid that persists them
  restores them.

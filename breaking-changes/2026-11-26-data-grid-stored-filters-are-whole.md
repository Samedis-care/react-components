# A data grid's stored column filters are its whole column filters; defaultFilter only applies when nothing is stored

- **Date:** 2026-11-26
- **Kind:** behavior, type
- **Scope:** `standalone/DataGrid` (`defaultFilter`, `DataGridPersistentState`), and `CRUD`, whose
  grid persists through it

## What changed

- A grid with a stored state opens with the stored column filters, as they are. `defaultFilter`
  applies when nothing is stored for the grid, and when the user resets the filters ("Reset
  filter", "Clear filters", "Reset all"). A default filter added or changed in a later release no
  longer changes the column filters of a user who has a stored state, also on the columns the user
  never filtered.
- `overrideFilter` forces its column filters whatever is stored, as before, for the visit: they
  are not persisted.
- The persisted column filters are the whole column filters: `filter` is a list of
  `[field, filter]`, one entry per filtered column, and empty when no column is filtered. It is
  written also when it equals the default filters. It used to be a record of the columns whose
  filter differed from the default filter (`{ "name": { … } }`, `null` for a default filter the
  user cleared), left out when none did.

  ```json
  { "v": 2, "filter": [["name", { "type": "contains", "value1": "ann", "value2": "" }]] }
  ```

- Stored data keeps being read. A filter record stored by an earlier version, and data without
  `filter`, are read on top of the current default filters, as before; the user's next change
  stores the column filters as a list. Data in the format from before 2026-08-26 has the whole
  column filters, and is read as such: a default filter of a column added since does not apply.
- Types: `DataGridPersistentState.filter` is `DataGridPersistedFilterList |
  Record<string, IFilterDef | null>`. `DataGridPersistedFilterList` is new and exported from
  `standalone/DataGrid`.

## Why

The record held only the deviations from the default filters of the time it was written. Read on
top of a default filter added or changed later, the new default reached every column the user had
not changed, although the stored state is the grid as the user configured it. The stored sort
works this way since 2026-11-10.

## Migration

- Nothing to do in an app that does not read a grid's stored data itself. A new or changed
  `defaultFilter` reaches the users who have nothing stored for that grid, and the ones who reset
  its filters. To show column filters whatever a user stored, pass `overrideFilter`.
- Required for any app that reads a grid's stored data itself (`DataGridPersistentState.filter`,
  in its own persistence provider or elsewhere): handle both forms of `filter`, the list and the
  record, which stays stored until the user's next change. Without it, column filters stored as a
  list read as none.

  ```ts
  if (Array.isArray(data.filter)) {
  	// the whole column filters: [field, filter] per filtered column, no
  	// other column is filtered
  } else {
  	// stored before: field -> filter for the columns that differ from
  	// defaultFilter (null: a default filter cleared), the others have theirs
  }
  ```

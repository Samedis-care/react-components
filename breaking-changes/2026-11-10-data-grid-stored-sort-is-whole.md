# A data grid's stored sort is its whole sort; defaultSort only applies when nothing is stored

- **Date:** 2026-11-10
- **Kind:** behavior, type
- **Scope:** `standalone/DataGrid` (`defaultSort`, `DataGridPersistentState`), and `CRUD`, whose
  grid persists through it

## What changed

- A grid with a stored state opens with the stored sort, as it is. `defaultSort` applies when
  nothing is stored for the grid, and when the user resets the sort ("Reset sort settings",
  "Reset all"). A default sort added or changed in a later release no longer changes the sort
  of a user who has a stored state.
- The persisted sort is the whole sort: `sort` is a list of `[field, direction]`, highest
  priority first, and empty when nothing is sorted. It is written also when it equals the
  default sort. It used to be a record of the columns whose sort differed from the default
  sort (`{ "name": [1, 1] }`).

  ```json
  { "v": 2, "sort": [["created_at", -1], ["name", 1]] }
  ```

- Stored data keeps being read. A sort record stored by an earlier version is read on top of
  the current default sort, as before, except for a default sort that cannot have been in
  place when it was written: one of a column without an entry, with the priority of a stored
  sort. The user's next change stores the sort as a list. Data in the format from before
  2026-08-26 has the whole sort, and is read as such.
- Types: `DataGridPersistentState.sort` is `DataGridPersistedSortList |
  Record<string, DataGridPersistedSort>`. `DataGridPersistedSortList` is new and exported
  from `standalone/DataGrid`.

## Why

The record held only the deviations from the default sort of the time it was written. Read
on top of a default sort added later, the user's sort and the new default were combined: two
sorted columns at the same priority, with the user's sort sometimes second.

## Migration

Nothing to do in the apps. A new or changed `defaultSort` reaches the users who have nothing
stored for that grid, and the ones who reset its sort. Code that reads the stored data handles
both forms of `sort`.

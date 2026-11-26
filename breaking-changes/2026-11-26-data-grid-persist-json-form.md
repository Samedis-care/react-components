# A persistence provider gets the JSON form of a grid's state

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`DataGridPersistentStateContext`, `DataGridLocalStoragePersist`, `DataGridStorageManagerPersist`)

## What changed

- A grid hands the setter of its persistence provider the JSON form of its state, a new object of
  JSON values: a Date in the custom data is its ISO string, an object with a `toJSON` method is
  what that returns, and an `undefined` value is left out (see `DataGridCustomDataType`). Before,
  the setter got the grid's own custom data object.
- So a grid mounted again under a provider that stays mounted gets its custom data in the JSON
  form, as after a reload. Before, it got the values as they were set, until the next reload.
- The open grid keeps its custom data as it was set.

## Why

The providers handed out the object the setter got, while their storage held its JSON: a Date in
the custom data was a Date in a grid mounted again under the same provider, and an ISO string
after a reload.

## Migration

- Nothing to do for an app whose custom data holds JSON values only (strings, finite numbers,
  booleans, null, and arrays and plain objects of these).
- Required for any app that puts other values into the custom data (a Date, a Moment) and reads
  them in a grid that was mounted again (in `getAdditionalFilters`, in a filter bar control):
  convert the JSON form there, as after a reload. Without it, such a value is a string in a grid
  mounted again under the same provider.
- Required for any custom persistence provider that relies on getting the grid's own custom data
  object: it gets a copy now.

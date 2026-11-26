# The persistence providers hold back and mount again only their grids

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`DataGridStorageManagerPersist`, `DataGridLocalStoragePersist`, `DataGridNoPersist`, `DataGrid`)

## What changed

- `DataGridStorageManagerPersist` renders its children at once. Only the grids inside wait for the
  stored state: a Loader takes each grid's place until both buckets are loaded, and the grid opens
  with them then. Before, one Loader replaced everything inside the provider.
- When `StorageManager` answers both buckets synchronously (a bucket routed to
  `LocalStorageProviderInstance` or `SessionStorageProviderInstance`, as by the default routing),
  the provider reads them while it renders, and the grids open in the first render, without a
  Loader.
- When the storage keys change (`storageKeys` of `DataGridStorageManagerPersist`, `storageKey` of
  `DataGridLocalStoragePersist`), only the grids inside are mounted again, with the state stored
  under the new keys. Everything else inside the provider stays mounted and keeps its state: an
  open form and its input, a scroll position, keyboard focus outside the grids. Before, both
  providers mounted all their children again. Keyboard focus in a grid moves to the grid mounted
  in its place, as before; with several grids inside a provider, it now goes to the grid at the
  same place (before, the first grid took it).
- While the buckets load, `DataGridPersistentStateContext` is `undefined` inside
  `DataGridStorageManagerPersist`, as outside of a provider, and a grid's ref (`DataGridDispatch`,
  and so CRUD's `getGridQuery`) is `null` until the grid opens.
- A grid inside `DataGridNoPersist` inside one of the providers does not wait for the provider's
  stored state, and is not mounted again when the provider's keys change.

This replaces
[DataGridLocalStoragePersist mounts its children again when its storageKey changes](2026-11-13-data-grid-local-storage-persist-remounts-on-key-change.md),
and "Focus elsewhere inside the providers, outside a grid, still falls back to the page" of
[A grid keeps keyboard focus when its persistence provider's storage keys change](2026-11-20-data-grid-persist-key-change-keeps-focus.md).

## Why

A page that wraps its title, actions, grid and form in `DataGridStorageManagerPersist` opened with
a spinner in place of all of it on every visit, also when the storage answered at once, and showed
only the spinner for as long as a bucket on a server took to load. A change of the storage keys
threw away what the user had typed into a form inside the provider.

## Migration

- Nothing to do for an app that wraps its pages or grids in a provider: the content around a grid
  shows while the grid waits for its stored state.
- Required for any app that relies on a provider mounting everything inside it again when its
  storage keys change (to start a form or other state over for the new keys): put a `key` on the
  provider, or on the part that has to start over. Without it, that part keeps its state across
  the change.

  ```tsx
  <DataGridStorageManagerPersist
  	key={JSON.stringify(storageKeys)}
  	storageKeys={storageKeys}
  >
  	{page}
  </DataGridStorageManagerPersist>
  ```

- Required for any app that reads a grid's ref, or CRUD's `getGridQuery`, as soon as the page
  shows (a form opened by a link, next to the grid): handle `null` / `undefined` while the grid
  waits for its stored state, as while the grid is not shown. Without it, such a read fails in the
  moment before a server storage has answered.
- Required for any app with its own reader of `DataGridPersistentStateContext` inside
  `DataGridStorageManagerPersist`: the context is `undefined` until the buckets are loaded, then
  it holds the stored state. Without handling that, the reader takes the first `undefined` for
  "nothing stored".
- Expect a Loader in the grid's place, instead of one for the whole provider, in screenshots taken
  while a server storage loads.

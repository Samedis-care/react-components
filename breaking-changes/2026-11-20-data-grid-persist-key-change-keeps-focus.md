# A grid keeps keyboard focus when its persistence provider's storage keys change

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`DataGridStorageManagerPersist`, `DataGridLocalStoragePersist`, `DataGrid`)

## What changed

Both persistence providers mount their children again when their storage keys change, so the grids
open with the state stored under the new keys. Keyboard focus in a grid no longer falls back to the
page then:

- `DataGridStorageManagerPersist`: while it loads the new keys' buckets, its Loader takes focus. The
  Loader has `tabindex="-1"` and an `id`, and draws a 2px outline in `palette.primary.main` inside
  its edge while it has keyboard focus. Once the buckets are loaded, focus moves to the grid mounted
  in the Loader's place.
- `DataGridLocalStoragePersist`: focus moves to the grid mounted for the new key at once.

In the new grid, focus goes to the same control: the element at the same place in the grid, if it
is the same kind of element (tag, `role` and `type`). If there is none, it goes to the grid's first
control that takes focus, e.g. its search field. Focus that moved elsewhere in between stays there,
and so does focus that a control of the new grid takes itself (`autoFocus`). A grid that the app
unmounts and shows again under the same keys (CRUD's grid while a form is open) does not take
focus. Focus elsewhere inside the providers, outside a grid, still falls back to the page.

For grids, this replaces "keyboard focus inside it falls back to the page" of
[DataGridLocalStoragePersist mounts its children again when its storageKey changes](2026-11-13-data-grid-local-storage-persist-remounts-on-key-change.md).

## Why

A keyboard or screen reader user whose focus was in the grid (its search field, or a filter bar
control that picks the context the keys are made of) had to start again from the top of the page
after a key change (WCAG 2.4.3).

## Migration

Nothing to do. samedis.care and IMF do not change the keys of a mounted provider. An app that moved
focus back into the grid itself after changing the keys can drop that. Expect the Loader's focus
ring in screenshots taken while the buckets of new keys load after keyboard use.

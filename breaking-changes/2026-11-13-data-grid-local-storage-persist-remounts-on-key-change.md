# DataGridLocalStoragePersist mounts its children again when its storageKey changes

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`DataGridLocalStoragePersist`)

## What changed

When `storageKey` changes, everything inside the provider is mounted again. The grids open with
what is stored under the new key, as they do when the page opens. Anything else inside the
provider is mounted again as well: it starts from its initial state (an open form, a scroll
position, a selection), and keyboard focus inside it falls back to the page.

Rendering with the same `storageKey` keeps the children mounted, as before.

## Why

A grid reads the persisted state only when it mounts. A grid that stayed mounted across a key
change kept showing the previous key's search, filters and columns, and its next change wrote
them under the new key, replacing what was stored there.

## Migration

Nothing to do in the apps: IMF keys its lists by model id, a fixed string per model, and
samedis.care uses `DataGridStorageManagerPersist`. A `key={storageKey}` on the provider, if you
added one for this, can go.

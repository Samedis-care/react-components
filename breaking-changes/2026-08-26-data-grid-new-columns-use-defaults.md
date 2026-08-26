# New data grid columns use their column definition defaults

- **Date:** 2026-08-26
- **Kind:** behavior
- **Scope:** `standalone/DataGrid`

## What changed

A column added to a grid now starts out with the `hidden` and `pinned` state from its
column definition, even for a user who already has persisted grid state. Previously the
persisted state won outright and every new column appeared visible and unpinned no matter
what its definition said.

Making that possible needed a third state — "this user has never seen this column" — which
the persisted format could not express, so the format changed with it.

### Persisted format

`DataGridPersistentState` is now a versioned wire format (`v: 2`) that is deliberately not
the shape of the runtime state. `encodePersistedState` and `decodePersistedState` in
`PersistFormat.ts` translate between the two.

```json
{
  "v": 2,
  "shown": ["device_number", "device_location_path"],
  "hidden": ["serial_number", "department_title"],
  "pinned": ["device_number"],
  "sort": { "created_at": [-1, 1] },
  "filter": { "device_number": { "type": "contains", "value1": "42", "value2": "" } },
  "search": "",
  "customData": { "filter[status]": "active" },
  "width": { "device_number": 240 },
  "initialResize": true
}
```

`shown` and `hidden` together are the set of columns the user has already seen. A column in
neither list is new to that user, which is what makes the fix above possible. Everything
else only records deviations from the defaults, so a column that is unsorted and unfiltered
costs nothing but its name.

**Reading the old formats is unchanged and lossless** — nobody's grid gets reset. Data
without a `v` is migrated on read: the legacy `columnState` carries an entry for every
column the grid rendered, so its keys plus `hiddenColumns`/`lockedColumns` are exactly the
set of columns that user had seen. The migrated data is written back in the new format on
the next state change. A real 72 column device grid goes from 3830 to 1640 bytes (43%) in
the process, since most of the old payload was `{"sort":0}` entries and empty filter
objects.

If the legacy data carries no visibility arrays at all, or the derived known set is empty,
every column keeps its definition default rather than being hidden retroactively.

### Reading is total

`decodePersistedState` never throws. Persisted data is whatever sits in a user's storage —
possibly written by an older version, hand edited, or truncated — so every value out of it
is coerced: a list that isn't a list of strings, a sort that isn't `[direction, order]`, a
width that isn't a finite positive number, a `search` that isn't a string are all treated
as not stored. A `nextFilter` chain is followed at most 512 deep. On top of that the whole
decode is wrapped: anything unanticipated is logged and the grid falls back to the column
definition defaults rather than failing to render.

This matters because decode runs while rendering the grid, so a throw there would take the
grid — and without an error boundary, the page — down with it.

### Runtime state

`IDataGridState.hiddenColumns: string[]` and `lockedColumns: string[]` are replaced by
`columnHidden: Record<string, boolean>` and `columnPinned: Record<string, boolean>`. They
hold an entry per column the user has seen, including columns that are not currently
defined — a column gated behind a permission must not look new once it comes back.

Visibility stays out of `columnState` on purpose: `columnState` is hashed to decide when to
refetch, so putting display state in there would turn every show/hide into a data reload.

### Columns leaving the definition

The other direction is deliberate and unchanged in spirit: a column that disappears from
the definition keeps its stored visibility, pin state and width, so a column gated behind a
permission or a module toggle comes back exactly as the user left it rather than looking
new. Its sort and filter are dropped instead, because those would be sent to the backend
for a field the grid has no column for.

Nothing prunes those retained entries — a grid whose field *names* churn accumulates them
at roughly 50 bytes per dead column. `Reset columns` in the grid's own reset menu drops
them, since it rebuilds the state from the current definitions.

Note that a column which is removed and later re-added with a *different* `type` keeps the
filter that was stored against the old type. Whether a filter type fits a column type is up
to the consumer's `isFilterSupported`, so this can't be validated on read; the filter UI
falls back to letting the user pick a type manually, which is what it already did.

### Signatures

- `getActiveDataGridColumns(columns, columnHidden, columnPinned)` takes the two records
  instead of the two arrays. New export `isDataGridColumnPinned(column, columnPinned)`.
- `filterPersistedState` is gone; `decodePersistedState` replaces it.
- `IDataGridSettingsDialogProps.hiddenColumns`/`lockedColumns` → `columnHidden`/`columnPinned`.
- New exports from `standalone/DataGrid`: `DATA_GRID_PERSIST_VERSION`, and the types
  `DataGridPersistedData`, `DataGridPersistentStateLegacy`, `DataGridPersistedSort`.
- The write half of `DataGridPersistentStateContextType` takes a `DataGridPersistentState`;
  the read half is `DataGridPersistedData`, which may be any format ever written.

### Smaller behavioral changes that came with it

- Persistence only writes when the encoded data actually changed. It used to write on every
  state change, which includes every page of rows loaded and every selection change — a
  request per scroll for server backed storage.
- A filter with no value entered is no longer persisted. Reopening a grid no longer restores
  a half-filled filter row that had no effect on the query anyway.
- Sort and filter for columns that no longer exist are dropped on read instead of being sent
  to the backend.
- `forcePin` now always wins over persisted state.
- Column widths are persisted rounded to whole pixels.
- `initialResize` survives with `DataGridStorageManagerPersist`. It was silently lost before:
  the two storage buckets both nested data under `state` and the second overwrote the first,
  so the initial width auto-fit re-ran on every load.

## Why

Reported as [samedis-care-issues#2602](https://github.com/Samedis-care/samedis-care-issues/issues/2602).

`hiddenColumns` was a set-difference encoding: absent from the array meant "visible", and
there was no way to say "never asked". So a column added to a model showed up unhidden and
unpinned for every existing user, regardless of its definition — and on a grid with 70+
columns, mostly hidden by default, each new field landed in everyone's view uninvited.

The two persisted pieces that were already keyed per column (`columnState`, `columnWidth`)
never had this problem, which is what pointed at the shape rather than at a special case.

## Migration

Persisted data needs no action. Existing state is migrated on read and rewritten smaller.

Code that read `state.hiddenColumns` / `state.lockedColumns` from the data grid state
contexts, called `getActiveDataGridColumns`, or rendered `SettingsDialog` directly has to
move to the records — `hiddenColumns.includes(field)` becomes `columnHidden[field]`.

Custom persistence providers keep working as long as they only move opaque JSON. A provider
that inspected the stored object has to handle `v: 2`; use `splitPersistedState` /
`mergePersistedState` if it splits storage the way `DataGridStorageManagerPersist` does.

One thing to know when rolling this out: a client running an older version of the library
cannot read `v: 2` data. It finds no `hiddenColumns` and falls back to the column definition
defaults rather than failing, so an old tab during a deploy window shows a default column
layout instead of the user's — it does not break.

# DataGrid takes a ref and updates single rows through it

- **Date:** 2026-09-16
- **Kind:** behavior, type
- **Scope:** `standalone/DataGrid`, `backend-components/DataGrid`

## What changed

`DataGrid` and `BackendDataGrid` forward a ref now, and what it resolves to is a
`DataGridDispatch`:

```ts
export interface DataGridDispatch {
	updateRow: (id: string, update: DataGridRowUpdate) => void;
}

export type DataGridRowUpdate =
	| Partial<Omit<DataGridRowData, "id">>
	| ((row: DataGridRowData) => Partial<Omit<DataGridRowData, "id">>);
```

`updateRow` rewrites the data of a row the grid has already loaded, in place:

```tsx
const grid = useRef<DataGridDispatch>(null);

// after your own mutation came back
grid.current?.updateRow(record.id, {
	name: record.name,
	name_raw: record.name,
});
// or derived from what is shown
grid.current?.updateRow(record.id, (row) => ({
	hits: (row.hits as number) + 1,
}));

<BackendDataGrid ref={grid} model={model} />;
```

The fields you pass are merged into the row, so anything left out stays as it is. The
row ID is not writable — an update naming `id` keeps the old one. A row that is not
currently loaded is a no-op, not an error.

The update lives in the grid only. The next refresh — pagination, a filter, sort or
search change, `forceRefreshToken`, `CrudDispatch.refreshGrid` — asks `loadData` for
the row again and overwrites it.

`BackendDataGrid` renders rows through the model, so a manual update writes the cells
directly. That means both halves of the pair the model emits per field: `field` (the
rendered value) and `field_raw` (what filters, sorting and exporters read).

## Why

Reflecting one changed record cost a full reload of the view, and a reload is not free:
it drops the loaded pages and sends the user back to the top of an infinite scroll. The
grid already keeps its rows as state, so a caller that knows the new values for one row
can put them there.

## Migration

Nothing to do for existing code — `DataGrid` and `BackendDataGrid` did not use a ref
before, so nothing can have been passing one.

Two type-level details for anyone reaching past the default export:

- `DataGrid`'s props type is unchanged, but the component is now
  `React.memo(React.forwardRef(DataGrid))`. Code that named the old type explicitly
  (`React.MemoExoticComponent<...>`) needs to follow.
- `BackendDataGrid` is exported as the new `BackendDataGridType` instead of
  `typeof BackendDataGrid`; it takes the same generic parameters and adds
  `React.RefAttributes<DataGridDispatch>`.

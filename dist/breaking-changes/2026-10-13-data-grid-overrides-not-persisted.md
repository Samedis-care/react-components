# DataGrid overrides are not persisted

- **Date:** 2026-10-13
- **Kind:** behavior, type
- **Scope:** `standalone/DataGrid` (`overrideFilter`, `overrideCustomData`,
  `DataGridPersistentStateContext`, `DataGridDispatch`, `IDataGridState`), and `CRUD`
  (`CrudDispatch`, `gridComponent`)

## What changed

A grid opened with `overrideFilter` or `overrideCustomData` still shows the overrides, but no
longer persists them:

- Until the user resets the filters ("Reset filter", "Reset all", or "Clear filters" when no rows
  match), the grid keeps persisting what was stored for the parts the overrides replaced: the
  column filters for `overrideFilter`, the custom data for `overrideCustomData`. Changes the user
  makes to those parts in the meantime aren't persisted either.
- Everything else is persisted as before: columns, widths, sort, the search, and a part that no
  override replaced.
- After a reset, the filters are the user's own again and are persisted.

`IDataGridState` has a new field for this, `filtersOverridden`.

The data `DataGridPersistentStateContext` hands out is what is persisted, so for such a grid it
isn't what the grid shows. (The 2026-10-13 entry "DataGrid persistence provides the latest state"
called it the grid's current state; that no longer holds while an override is shown.) What a grid
shows now comes from the grid itself, with or without a persistence provider:

- `DataGridDispatch.getQuery()` (the grid's ref) returns the query as `loadData` gets it, without
  the paging: `quickFilter`, `additionalFilters` (after `getAdditionalFilters`), `fieldFilter` and
  `sort`. The new type is `DataGridQuery`.
- `CrudDispatch.getGridQuery()` returns it for a `CRUD`'s grid, or `undefined` while the grid isn't
  mounted (`disableBackgroundGrid` with a form open). `CRUD` passes a ref to its `gridComponent` for
  this.

## Why

Links open grids with a query passed as overrides, for example a report's drill-down. The grid
persisted every state, including the one the overrides set. The user's next visit without the link
opened narrowed to the link's filters, and the column filters and custom data they had saved were
gone.

## Migration

- Code that reads `DataGridPersistentStateContext` to learn what a grid shows (for example to load
  the next record within the grid's rows) uses the query instead: `useCrudDispatchContext()
  .getGridQuery()` inside a `CRUD` form, or `getQuery()` on the grid's ref. It returns `loadData`'s
  parameters, so there is no persisted format to decode, and default column filters and
  `getAdditionalFilters` are already applied.
- A custom `CrudProps.gridComponent` passes its ref on to `BackendDataGrid`, or `getGridQuery()`
  returns `undefined`. On React 18 that takes `forwardRef`:

  ```tsx
  const MyGrid = React.forwardRef(function MyGrid(
    props: BackendDataGridProps<ModelUnknown>,
    ref: React.Ref<DataGridDispatch>,
  ) {
    return <BackendDataGrid {...props} ref={ref} />;
  });
  ```

- Code that builds an `IDataGridState` itself sets `filtersOverridden: false`
  (`getDataGridDefaultState` does).
- A grid which persisted an override as a workaround should drop it. For example, a grid limited to
  `persist: ["columns", "sort"]` on drill-down visits no longer needs that.

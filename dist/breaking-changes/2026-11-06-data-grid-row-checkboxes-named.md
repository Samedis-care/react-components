# DataGrid row checkboxes are named after their row

- **Date:** 2026-11-06
- **Kind:** behavior, type
- **Scope:** `standalone/DataGrid` and the grids built on it (`BackendDataGrid`, `CRUD`,
  `BackendDataGridMultiSelect`)

## What changed

- Each row checkbox has an accessible name that identifies its row: "Select Carol Jones".
  The checkbox had no name; a screen reader read every one as "checkbox, not checked".
  The look is unchanged.
- The row's label comes from the new `DataGridProps.getRowLabel(row)`. Without it, the
  grid takes the text of the first visible column that has any, in the order the columns
  are shown, with the columns of type `"string"`, `"localized-string"` and
  `"combined-string"` first. For a rendered value (a React element, as in
  `BackendDataGrid`'s rows) that is the text among the element's children. A row without
  a label gets "Select row".
- `BackendDataGrid` (and so `CRUD`'s `gridProps`) and `BackendDataGridMultiSelect` take
  their own `getRowLabel(record)`, whose `record` is the model's record
  (`ModelRecord<M>`, as the model's index returned it), not the rendered grid row. The
  new hook `useBackendDataGridRowLabel(model, getRowLabel)` turns such a function into the
  DataGrid's, for a grid of its own built on `renderDataGridRecordUsingModel` (e.g. a
  CRUD `gridComponent`).
- `IDataGridContentSelectRowViewProps`, the props of a `customSelectionControl`, has a new
  required `rowLabel: string`: the row's label, `""` if it has none.

New translation keys: `standalone.data-grid.content.select-row` (`"Select {{ROW}}"`) and
`standalone.data-grid.content.select-row-fallback` (`"Select row"`).

## Why

The checkbox column is pinned, so its checkboxes come before the rows' text in the page.
Without a name a screen reader user could not tell which row a checkbox selects, and could
tick the wrong row before a delete.

## Migration

Required for code that renders a `customSelectionControl` component itself, outside the
grid (a test, a mobile list that reuses the control): pass `rowLabel`, or the call does not
compile.

```tsx
<OpenDataGridRecord
	id={record.id}
	checked={false}
	disabled={false}
	rowLabel={name}
/>
```

Required for a CRUD `gridComponent` that renders a `DataGrid` itself from the
`BackendDataGridProps` it gets: pass
`getRowLabel={useBackendDataGridRowLabel(props.model, props.getRowLabel)}` to the DataGrid,
after spreading the props. Without it the DataGrid calls the app's `getRowLabel` with the
rendered row instead of the model's record, which the types do not catch for a
`ModelUnknown` grid.

Recommended:

- A grid whose first visible text column does not identify a row (a status, a category), or
  whose identifying value is rendered by a component that takes its text as a prop rather
  than as children, passes `getRowLabel`. For a model-backed grid, the model's selector
  data helper gives the label:

  ```tsx
  <BackendDataGrid
  	model={model}
  	getRowLabel={(record) => PersonModelToSelectorData(record).label}
  />
  ```

- A `customSelectionControl` names itself after its row with `rowLabel`, e.g.
  `aria-label={t("open-record", { ROW: props.rowLabel })}` ("Open Carol Jones") instead of
  one "Open" per row.

# Inline checkboxes in the DataGrid are named after their field and row

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** the boolean checkbox renderers (`ModelDataTypeBooleanCheckboxRendererMUI`,
  `ModelDataTypeBooleanCheckboxRendererCC`) in the cells of `BackendDataGrid` (and so
  `CRUD`'s grid) and `BackendDataGridMultiSelect`, for a field with overview visibility
  `ModelVisibilityGridEdit`

## What changed

- Each inline checkbox has an accessible name: the field's label and the row's label,
  e.g. "Active, example.com". It had none; a screen reader read "checkbox, checked" for
  every row's control. The look is unchanged.
- The row's label is `BackendDataGridProps.getRowLabel(record)` where the app passes one,
  as for the row checkboxes. Without it, the value of the record's first visible text
  field names the row. A record without such a value gets the field's label alone.
- `ModelRenderParams` has a new optional `gridCellLabel`: the accessible name of a grid
  cell's control. `renderDataGridRecordUsingModel` takes an optional third argument, the
  `getRowLabel` over the model's record, and passes the composed name to the cells it
  builds.

## Why

A grid cell has no label element to point at its control, so every inline checkbox was
unnamed (WCAG 4.1.2 Name, Role, Value; axe's `label` rule). Naming it after the column
alone would leave every row with the same name; the row's label tells the rows apart.

## Migration

Nothing to do.

Recommended: an app that renders `renderDataGridRecordUsingModel` itself (e.g. a CRUD
`gridComponent`) passes its `getRowLabel` as the third argument, so its inline checkboxes
and its row checkboxes use the same row label:

```tsx
rows: records.map(
	renderDataGridRecordUsingModel(model, refreshGrid, props.getRowLabel),
),
```

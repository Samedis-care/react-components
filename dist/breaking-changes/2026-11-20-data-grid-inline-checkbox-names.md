# A control in a DataGrid cell is named after its field and row

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** the boolean checkbox renderers (`ModelDataTypeBooleanCheckboxRendererMUI`,
  `ModelDataTypeBooleanCheckboxRendererCC`) and `ModelDataTypeEnumSelectRenderer` in the
  cells of `BackendDataGrid` (and so `CRUD`'s grid) and `BackendDataGridMultiSelect`, for
  a field with overview visibility `ModelVisibilityGridEdit`

## What changed

- A control edited in a grid cell has an accessible name: the field's label and the row's
  label, e.g. "Active, example.com". The inline checkboxes had none, so a screen reader
  read "checkbox, checked" for every row's control; the enum select was named after its
  field alone. The look is unchanged.
- The row's label is the same one that names the row's checkbox:
  `BackendDataGridProps.getRowLabel(record)` where the app passes one, else the text of
  the first visible text column. It follows the columns the user sees, in their order,
  and a `getRowLabel` replaced after mount. A row without a label gets the field's label
  alone ("Active").
- `ModelRenderParams` has a new optional `gridCellLabel`: the accessible name of a
  control rendered in a grid cell. Renderers give it to their control as `aria-label`,
  falling back to `label`.

## Why

A grid cell has no label element to point at its control, so the inline checkboxes were
unnamed (WCAG 4.1.2 Name, Role, Value; axe's `label` rule). Naming a control after its
column alone would leave every row with the same name; the row's label tells the rows
apart.

## Migration

Nothing to do. An app that writes its own grid editor should use `gridCellLabel ?? label`
as the control's `aria-label` in the grid branch (see the renderer guide).

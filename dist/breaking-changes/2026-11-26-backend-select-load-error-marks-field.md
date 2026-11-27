# A selected record that fails to load marks its field as erroneous

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendSingleSelect`, `BackendMultiSelect`,
  `BackendMultipleSelect`, `useSelectedCache`, and so also `CrudMultiSelect`,
  `FormBackendSingleSelect`, `FormBackendMultiSelect`, the model renderers
  `RendererBackendSingleSelect` and `RendererBackendMultiSelect`, and the data grid's
  backend select filters)

## What changed

While a backend selector shows the entry of a selected record that failed to load, the
field is now in its error state, as if `error` were passed: the label and the outline turn
to the theme's error color and the input has `aria-invalid="true"`. This holds for either
label of such an entry: "Unknown entry" or "Error while fetching data" without
`onLoadError`, or the label an `onLoadError` returned.

In `BackendSingleSelect` the error state ends when another record is picked or the field
is cleared. In the multi selectors it lasts while any listed entry is one that failed to
load, and ends when the last of them is removed.

`useSelectedCache` returns a new `loadError` flag that says whether a listed entry failed
to load.

## Why

Such an entry is not the name of a record: it stands for a reference the user cannot see,
for example to a record that has since been deleted. It was shown like any other value, so
nothing told the user, or a screen reader, that the field needs attention before saving.

## Migration

Nothing to do. Expect fields that reference a record the backend no longer returns to show
in the error colors. An `onLoadError` that returns `null` still drops the id instead.

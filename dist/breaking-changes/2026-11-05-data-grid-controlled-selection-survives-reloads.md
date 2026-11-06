# A controlled DataGrid selection survives reloads

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/DataGrid`, `backend-components/Selector` (`BackendDataGridMultiSelect`)

## What changed

- A DataGrid with the `selection` prop keeps its selection when it reloads: after a
  search, a column filter, a sort, a custom data change (filter bar) or a
  `forceRefreshToken` change. It used to clear the selected ids 500ms after the change
  and report `onSelectionChange(false, [])`, or, when the ids came from the prop and the
  user had not changed them since, show nothing ticked while the parent still held the
  ids. The kept ids include those the new result does not contain, and with
  `invert: true` the exceptions stay too.
- A successful Delete reports the emptied selection through `onSelectionChange` also
  when the `selection` prop set it. It used to clear the ticks without telling the
  parent.
- With `limitSelectAll`, a reload unchecks the select all checkbox: the rows "First N"
  selected were the first rows of the previous query. A kept selection shows it
  indeterminate.
- Without the `selection` prop nothing changes: a reload clears the selected ids (an
  active select all stays on) and reports that.

## Why

A controlled selection is the parent's value, as a picker's value is: the user ticks a
record, searches for the next one and ticks it too. `BackendDataGridMultiSelect` (and
with it every `RendererBackendDataGridMultiSelect` field) lost its value on every search,
and on every refresh a rendered record triggered.

## Migration

Nothing to do for `BackendDataGridMultiSelect` and for grids without the `selection`
prop.

A grid that passes `selection` and wants it emptied when the query changes has to do it
itself now, e.g. by passing `[false, []]` from the handler that changes the query. With
a kept selection, Delete, Edit and the custom data action buttons act on rows the
current result may not show.

A multi pick that passes only `onSelectionChange` still loses earlier picks on a search.
To keep them, it passes `selection` as well and holds the ids itself.

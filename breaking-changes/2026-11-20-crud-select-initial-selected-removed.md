# The CRUD selects no longer take initialSelected

- **Date:** 2026-11-20
- **Kind:** type, behavior
- **Scope:** `backend-components/Selector` (`useCrudSelect`, and with it `CrudMultiSelect`, `CrudMultiSelectWithGroups`), `backend-components/Form/CrudControls` (`FormCrudMultiSelect`)

## What changed

`useCrudSelect` no longer takes `initialSelected`, and neither do `CrudMultiSelect`,
`CrudMultiSelectWithGroups` and `FormCrudMultiSelect`. The selection always starts as
what the connector's `index` lists, and mounting the control writes nothing. A value
still passed from untyped code is ignored.

## Why

`initialSelected` replaced the `index` call and handled every entry as a new pick: each
entry was created on every mount, twice under `React.StrictMode`, and `prepareNewEntry`
ran for it at mount. Rows the connector already had were not listed. In a Form, an
untouched record was dirty right after loading, and saving it created the joins it
already had a second time.

The connector is where the selection comes from. In a Form, its `index` also lists the
picks and removals queued before the control was last unmounted (another tab, a language
switch), so a remount shows them again.

## Migration

- **Required for code that passes `initialSelected`:** remove the prop. The control lists
  the rows the connector's `index` returns; an entry that should be selected has to be a
  row there, picked by the user or created by the backend, not passed in.

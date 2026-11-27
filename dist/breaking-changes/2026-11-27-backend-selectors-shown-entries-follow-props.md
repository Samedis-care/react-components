# The backend selectors convert their shown entries again for a new modelToSelectorData, and load them again for another modelFetch or a new refreshToken

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendSingleSelect`, `BackendMultiSelect`,
  `BackendMultipleSelect`, `BackendMultiSelectWithTags` with `convData` and `dataModel`),
  and what renders them: `FormBackendSingleSelect`, `FormBackendMultiSelect`,
  `ModelDataTypeBackendSingleSelectRenderer`, `ModelDataTypeBackendMultiSelectRenderer`,
  the DataGrid's backend filters

## What changed

The entries a backend selector shows for `selected` used to be converted and loaded once
per id, and then kept until the id changed or the field remounted. They now follow the
props:

- A new `modelToSelectorData` (`convData`) converts the shown entries again, from the
  records the field listed or loaded for their ids, without a request. Entries without
  such a record are shown as they are: `additionalOptions` entries, an entry `onAddNew`
  returned or a group pick added for a record the field has not listed, and the entry of
  a record that failed to load.
- A `modelFetch` (or, without one, a `model`) whose react-query keys differ from the
  previous one, that is another model id or other cache keys, loads the shown records
  again through it. So does a change of `disableRequestBatching`. A new instance of the
  same model (same model id, same cache keys) loads nothing.
- A new `refreshToken` loads the shown records again through `modelFetch.getCached`. That
  reads the model's cache while the record there is fresh (the model's `staleTime`), so
  a changed record shows only once the app has invalidated it.
- `additionalOptions` entries are never loaded again.

The field keeps showing the previous entries while they load or convert; there is no
"Loading…" in between. A record that fails to load again is handled as on the first load:
`onLoadError` labels or drops it (a drop reports the selection without it), and without
`onLoadError` it shows "Unknown entry" or "Error while fetching data". An id `onLoadError`
dropped while the parent keeps it is looked up again for a new selection, `modelFetch` or
`refreshToken`, not for a new `modelToSelectorData`.

## Why

After a language switch the options were in the new language and the selected entries in
the old one; a `modelFetch` for another scope (built from the form's values) kept the
entry the old one had loaded; and a record renamed in an edit dialog kept its old name in
the field after the app invalidated the model and changed `refreshToken`, while the list
showed the new one.

## Migration

- **Required for any app that passes a `modelToSelectorData` (or `convData`) that is new
  on every render**, such as an inline arrow function or a factory call in the render
  (`modelToSelectorData={makeConverter(x)}`): the shown entries are now converted on every
  render, and each conversion hands the selector new entry objects, after which it reloads
  its options. Memoize the function on what it reads, so it changes only when its output
  can:

  ```tsx
  const modelToSelectorData = useCallback(
  	(record: Record<string, unknown>) => ({
  		...EmployeeToSelectorData(record),
  		group: groupNameOf(record),
  	}),
  	[groupNameOf],
  );
  const convertForTask = useMemo(() => makeConverter(x), [x]);
  ```

- An app that renames or deletes a record the field may show and wants the field to
  follow invalidates the model's cache for it (`model.invalidateCacheForId(id)` or
  `model.invalidateQueries()`) and then changes `refreshToken`.
- An app that changes `refreshToken` only to reload the options (for example a token
  built from the selected ids or `filterIds`) now also loads the shown records again on
  each change: one lookup per shown record (batched unless `disableRequestBatching`),
  answered from the model's cache while it is fresh. Nothing to do unless that matters.
- A `modelFetch` built anew on every render (also through a renderer's
  `modelFetch: (values) => …`) loads nothing more as long as its model id and cache keys
  stay the same; one whose cache keys follow the form's values loads the shown record
  again when they change.

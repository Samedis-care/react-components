# A selected initialData record whose conversion fails is listed as a failed load

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendMultiSelect`, `BackendMultipleSelect`,
  `BackendMultiSelectWithTags`, `useSelectedCache`, and so also `CrudMultiSelect`,
  `CrudMultiSelectWithGroups` and the model renderers `RendererBackendMultiSelect` and
  `RendererBackendMultiSelectWithTags`)

## What changed

When `modelToSelectorData` (`convData` in `BackendMultiSelectWithTags`) throws or rejects
for an `initialData` record, the field now lists that id like a record that failed to load,
as it already did for a record loaded through `modelFetch`:

- `onLoadError` is called with the error. Its label is shown, and `null` drops the id from
  the selection through `onSelect`.
- Without `onLoadError` the entry reads "Error while fetching data".
- The record is not looked up instead.

The other entries are shown as usual. Before, one failing record stopped the whole pass:
every selected entry not shown yet stayed "Loading…" (with a "Remove Loading…" button) for
as long as the field was mounted, nothing was looked up, and the rejection was unhandled.

An `initialData` record is now converted when its id is selected, alongside the lookups of
the other ids, instead of every `initialData` record before any lookup. A record whose id
is not selected is not converted, so its failure is not reported either; it is converted
once its id is selected.

## Why

An app's `initialData` record that lacks a field its `modelToSelectorData` reads, or an
asynchronous conversion that fails, left the whole field unusable without any message,
while the same failure for a loaded record was explained in the entry.

## Migration

Nothing to do. An `onLoadError` now also receives the errors `modelToSelectorData` raises
for `initialData` records, as it already did for loaded ones.

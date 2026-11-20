# A drop by onLoadError removes the id from the current selection

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendMultiSelect`, `BackendMultipleSelect`,
  `useSelectedCache`, and so also `CrudMultiSelect` and `GridMultiSelectFilterBackend`)

## What changed

When `onLoadError` returns `null` for a selected id, the field reports the selection
without that id through `onSelect`. It built that selection from the `selected` the lookup
had started with: a pick or removal made while the record loaded was undone, and the drop
was reported even after the field had unmounted.

Now the drop removes the dropped ids from the current selection (the latest `selected`, or
the selection an earlier drop reported if the parent has not rendered it yet) and reports
it to the latest `onSelect`:

- A pick or removal made while the record loaded is kept.
- An id picked again from the list while its lookup was failing has an entry and stays.
- Nothing is reported, and nothing cached, once the field has unmounted.
- `onSelect` is called only when the selection loses an id, so an id that two lookups drop
  (an outside change of `selected` while it loads, StrictMode's second effect) is reported
  once.

`raw` holds the entries of the reported ids that are known; an id still loading has none,
as in every `onSelect`.

`BackendSingleSelect` already discarded a failed lookup once `selected` had changed or the
field had unmounted; its `onLoadError` documentation now says so.

## Why

With `onLoadError={() => null}` (an app's handler for a deleted record) and a slow lookup,
the user's pick was lost: `["1"]`, a pick of Bob gives `["1", "2"]`, then the drop of 1
reported `[]`. A field that unmounted before its lookup failed (a tab switch, a
conditional field) changed a form value behind a field nobody sees.

## Migration

Nothing to do. A parent that applies every `onSelect` ends with the selection the user
made, minus the dropped ids.

# An id dropped by onLoadError is not shown, also while the selection keeps it

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendSingleSelect`, `BackendMultiSelect`,
  `BackendMultipleSelect`, `useSelectedCache`, and so also `CrudMultiSelect`,
  `FormBackendSingleSelect`, `FormBackendMultiSelect`, the model renderers
  `RendererBackendSingleSelect` and `RendererBackendMultiSelect`, and the data grid's
  backend select filters)

## What changed

When `onLoadError` returns `null` for a selected id, the field reports the selection
without it through `onSelect`. A field whose `selected` still held the id afterwards
(no `onSelect`, or a parent that does not apply the reported value) showed it as
"Loading…" for good: `BackendSingleSelect` as its value, the multi selectors as an entry
with a "Remove Loading…" button.

Now the dropped id is not shown, whether or not `selected` is updated:

- `BackendSingleSelect` is empty.
- `BackendMultiSelect` and `BackendMultipleSelect` leave the id out of their entries. The
  next change the user makes (a pick, a removal) therefore reports the selection without
  it, as `onSelect` had already reported it.
- An id that was dropped is also not shown as "Loading…" when `selected` holds it again and
  it is looked up again. It is shown once a lookup loads it, `onLoadError` labels it, or the
  user picks it from the list.

## Why

`onLoadError` returning `null` means the record is to be removed. "Loading…" told the user
that a record was on its way that would never arrive, and in the multi selectors the
user's next change carried the dropped id along.

## Migration

Nothing to do for a parent that applies every `onSelect`: it no longer holds the id. A
parent that keeps a dropped id in its value on purpose loses it with the user's next change
in a multi selector; keep such an id outside the selector's `selected`.

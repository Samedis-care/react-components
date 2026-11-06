# BackendSingleSelect shows only the selected record

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendSingleSelect`, so also
  `FormBackendSingleSelect`, `RendererBackendSingleSelect` and the DataGrid's backend
  single select filter)

## What changed

When `selected` changed from outside the field (a form reset, a model `onChange` hook, a
picker dialog that writes the id), the field kept showing the previous record, with its
tooltip and icon, until the new one had loaded. A lookup that finished after `selected`
had moved on was still applied: its record replaced the right one for good, and if it
failed, `onLoadError` was called and a dropping handler (`null`) called `onSelect(null)`,
also after the field had unmounted.

Now the field only ever shows the record of the current `selected`:

- Until that record is there, the field shows the translated "Loading…", as it does on
  mount. A record picked from the list and an `additionalOptions` entry are shown at once.
- A lookup of an id that is no longer selected, or that finishes after the field
  unmounted, is discarded, also when it fails: no `onLoadError`, no `onSelect(null)`.

## Why

The field showed one record while the value was another, so the user saw one record and
the form saved another.

## Migration

Nothing to do. Expect "Loading…" in the field for as long as the new record loads after
an outside change.

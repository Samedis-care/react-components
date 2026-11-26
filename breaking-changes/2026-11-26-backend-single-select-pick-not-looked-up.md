# BackendSingleSelect shows a picked record as picked, without looking it up

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendSingleSelect`, so also
  `FormBackendSingleSelect`, `RendererBackendSingleSelect` and the DataGrid's backend
  single select filter)

## What changed

When the user picked a record from the list, or `onAddNew` returned a new entry, the field
looked that record up again through `modelFetch` once the parent had applied its id. With
`disableRequestBatching` every pick sent a `read` request; with batching an `id inSet`
query went out whenever `modelFetch`'s cache did not hold the record (a `modelFetch` with
another model id or cache keys than `model`, a search older than the cache's `staleTime`,
30 seconds by default, a created record). The entry built from that lookup replaced the picked one, and a failing
lookup went to `onLoadError`: a returned label replaced the picked record's name, `null`
undid the pick (`onSelect(id)`, then `onSelect(null)`).

Now the picked or created entry is shown as it came from the list or from `onAddNew`, and
nothing is sent. `onLoadError` is called only for a `selected` the field did not pick
itself (on mount, after a form reset, a picker dialog that writes the id).

## Why

Every pick could cost a request, and a lookup that failed for the record the user had just
picked (a `modelFetch` on an endpoint that refuses it) undid the pick or showed an error
text in its place.

## Migration

Nothing to do, unless `modelToSelectorData` builds another entry from `modelFetch`'s
record than from the search result of `model`: after a pick the field now shows the entry
of the search result, until `selected` changes from outside or the field remounts. Build
the entry from fields both records carry.

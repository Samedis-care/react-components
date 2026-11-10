# A record batched by enableRequestBatching is deserialized for edit

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `backend-integration/Model` (`getCached`, `getRaw`, `useModelGet`, `useModelMutation`,
  `RequestBatching`), and so `Form`

## What changed

On a model with `enableRequestBatching`, a get that does not pass `batch` (`getCached(id)`,
`useModelGet(model, id)`, and so every `Form`) still loads the record through the batched
index request, but deserializes it with the **edit** visibility, as a show would. Before, it
was deserialized with the overview visibility.

- Fields that are disabled in overview but enabled in edit have their values in such a record,
  so a `Form` on a batching model shows and saves them. Before, they were `undefined`.
- Such a record has a cache key of its own: `getReactQueryKey(id, true)` followed by `"edit"`.
  `Model.getReactQueryKeyGet(id, options)` returns the key of any get. Invalidating or refetching
  by `getReactQueryKey(id, true)` still reaches it (react-query matches the key as a prefix), but
  an exact `setQueryData` / `getQueryData` on `getReactQueryKey(id, true)` does not.
- The rows a data grid loads still seed `getReactQueryKey(id, true)` only. A `Form` opened from
  such a grid therefore loads its record with one batched request instead of taking the grid's
  row.
- A get that passes `batch: true` itself, such as the selectors or a list of records for a
  custom view, is unchanged: an overview record under `getReactQueryKey(id, true)`.
- Gets of both kinds share one index request. `RequestBatching.get` takes the visibility to
  deserialize with as a third argument (default `"overview"`), and `Model.fetchAllRaw` loads
  index records without deserializing or caching them.
- A save writes the saved record into the new key as well.

## Why

`enableRequestBatching` means the model's index returns the same data as its show, so a record
batched because of it stands in for a show. Deserializing it for overview dropped every field
that is disabled in overview, and a form on such a record showed those fields empty although
the record has values for them.

## Migration

- Nothing to do for models whose index returns what their show returns.
- Set `enableRequestBatching` only on such models. Where the index returns less, pass
  `batch: true` to the gets that may use it instead.
- Code that reads or writes a batching model's record with an exact
  `getReactQueryKey(id, true)` (for example `setQueryData`) uses
  `model.getReactQueryKeyGet(id)` for the record a `Form` shows.

# Connectors get a copy of the index params

- **Date:** 2026-09-30
- **Kind:** behavior
- **Scope:** `backend-integration/Model` (`Model.index`, `Model.index2`), `backend-integration/Connector` (the `index2` polyfill)

## What changed

`Model.index` and `Model.index2` hand the connector a deep copy of the params, and the `index2`
polyfill gives each of its `index` calls a copy of its own. This covers everything that loads
through the model: `fetchAll`, the `useModelIndex`/`useModelIndex2`/`useModelFetchAll` hooks,
the backend DataGrid and the selectors.

A connector that changes the params it gets, e.g. by chaining a forced filter into
`fieldFilter`, now only changes its copy. The caller's params stay as they were, whether they
are the grid's state, a hook's query key or a constant in the app.

## Why

The model's react-query keys hold the params. A connector that changed them changed the key
of a cached query, and when the same params were used again, the changes piled up.

## Migration

- Drop clones that only protect the params before `model.index`, `model.index2` or
  `model.fetchAll`.
- A connector that relied on its changes reaching the caller has to return them another way.
- The copy is made with `deepClone`. Objects, arrays and Dates are copied, Blobs and functions
  are passed as they are. An instance of a class (a `Map`, a date library's object) arrives as
  a plain object, so keep plain data in the params.

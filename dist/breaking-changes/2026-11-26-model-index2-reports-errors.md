# Model.index2 reports an unexpected error, as index does

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `backend-integration/Model`: `Model.index2` (and so `useModelIndex2` and
  `BackendDataGridMultiSelect`)

## What changed

A failed `Model.index2` is now reported through `captureError`, like a failed
`Model.index`, `Model.fetchAll` or `Model.getRaw`: the configured `report` receives it with
the source `Model.index2` and the model's id as `extra.model`, and the configured
`shouldReport` decides whether it is reported. The same rules apply as for `Model.index`:

- A request whose `params.signal` was aborted is not reported, whatever it rejects with.
  `BackendDataGridMultiSelect` passes the grid's signal on, so a load that a reload
  supersedes stays unreported.
- A load marks `BackendError` and `AbortError` as expected (`context.ignoreNames`); the
  default policy skips them and a `NetworkError`.

This holds for a connector's own `index2` and for the polyfill that loads through the
connector's `index`. The rejection still reaches the caller unchanged.

## Why

An unexpected error while loading through `index2` (a connector that throws a `TypeError`,
a field that fails to deserialize) failed the load and reached no error tracker, while the
same error through `index`, `fetchAll` or `getRaw` was reported.

## Migration

Nothing to do. Expect reports with the source `Model.index2` from now on; an app whose
`shouldReport` or `report` picks Model's errors by their source should include it.

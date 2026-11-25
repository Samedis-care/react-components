# An aborted index, fetchAll or getRaw request is not reported to Sentry

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-integration/Model`: `Model.index`, `Model.fetchAll`, `Model.getRaw`

## What changed

`Model.index` and `Model.fetchAll` no longer report a failed request to Sentry when that
request was aborted: when `params.signal` is aborted, or the connector rejects with an error
named `AbortError`. The rejection still reaches the caller unchanged, so a caller that
ignores the result of an aborted request (as `DataGrid` does) sees no difference.
`Model.getRaw` takes no signal, but it too skips an error named `AbortError`, so the model
has one rule for what counts as unexpected.

An abort is asked for. `BackendDataGrid` passes the grid's `params.signal` to `Model.index`,
and the grid aborts it when a reload (search, filters, sort, custom data,
`forceRefreshToken`) supersedes the pages being loaded, or when the grid unmounts. A
connector that forwards the signal to `JsonApiClient` rejects those requests with an
`AbortError`; until now every one of them reached Sentry as an unexpected error, while
`JsonApiClient` already skips its own exception hook for aborts.

## Why

Typing a search into a grid, or leaving a page before its request finished, sent an event
per superseded request to the error tracker. None of them is actionable: the request was
dropped on purpose.

## Migration

Nothing to do.

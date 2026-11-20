# Model reports its errors through configureErrorReporting

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-integration/Model`: `Model.index`, `Model.fetchAll`, `Model.getRaw`, `Model.validate`

## What changed

Model reported its errors to Sentry itself, past `configureErrorReporting`. It now reports
them through `captureError`, like the library's other components, so the app's
configuration applies to them:

- The configured `report` receives them, with the source `Model.index`, `Model.fetchAll`,
  `Model.getRaw` or `Model.validate`, and the model's id as `extra.model` (for
  `Model.validate` also the field's name as `extra.field`). The default reporter sends
  them to Sentry as before, now with `extra.ccSource`, `extra.model` and `extra.field`.
- The configured `shouldReport` decides which are reported. A failed load marks
  `BackendError` and `AbortError` as expected (`context.ignoreNames`), which the default
  policy honors, so the default policy skips the same load failures as before
  (`NetworkError`, `BackendError`, `AbortError`). A custom `shouldReport` that ignores
  `context.ignoreNames` now also gets a load's `BackendError` and `AbortError`.
- A request whose `params.signal` was aborted stays unreported, whatever `shouldReport`
  says.
- A load that rejects with a value that is not an `Error` is reported, wrapped in an
  `Error`. An error thrown while validating that is named `CcValidationError` or
  `NetworkError` is no longer reported by the default policy.
- An error that happens before the optional `@sentry/react` import has loaded is reported
  once it has, instead of being dropped.

## Why

An app that routes or filters errors with `configureErrorReporting` got Model's errors in
Sentry anyway, past its own `report` and `shouldReport`.

## Migration

Nothing to do for an app that doesn't call `configureErrorReporting`.

Required for an app that sets its own `shouldReport` and doesn't want a load's backend
refusals and aborts reported: honor `context.ignoreNames`, for example by building on the
default policy:

```ts
configureErrorReporting({
	shouldReport: (error, context) =>
		defaultShouldReportError(error, context) && myFilter(error),
});
```

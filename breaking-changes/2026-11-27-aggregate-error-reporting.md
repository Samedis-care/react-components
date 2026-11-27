# The default error-reporting policy judges an AggregateError by the errors it wraps

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `framework/ErrorReporting`: `defaultShouldReportError`

## What changed

`defaultShouldReportError` judges an `AggregateError` by its `errors`, as it judges a
`PartialApplyError` by its failures: it reports it if at least one of them would be reported on
its own (a `BackendError`, a code error), and no longer reports it if none would, i.e. when all of
them are `NetworkError`s or `ValidationError`s, or names in the call site's
`context.ignoreNames`. An entry that is no `Error` counts as reported, and an `AggregateError`
without errors is reported as before. It is matched by its name, `"AggregateError"`, and its
`errors`, so one from another realm counts too.

This holds for every `AggregateError` that reaches `captureError` under the default policy, also
one an app's own code raises, e.g. a `Promise.any` whose promises all failed.

## Why

`LazyConnector.workQueue` rejects with an `AggregateError` of the refused writes when several were
refused and no queue error factory is set, and so does a Form's save with a control of an app's
own on `useLazyCrudConnector`. When the connection dropped while the queue was sent, every error
inside is a `NetworkError`, which the default policy does not report on its own; the error that
wraps them was reported anyway.

## Migration

Nothing to do for an app that uses the default policy, or builds its `shouldReport` on
`defaultShouldReportError`.

A `shouldReport` of an app's own gets the `AggregateError` itself; a check of `error.name` does
not see the errors inside it. Required for an app with its own `shouldReport` that wants a save
whose queued writes failed only for the connection kept out of its tracker: look into `errors`,
or build on `defaultShouldReportError`:

```ts
import {
	configureErrorReporting,
	defaultShouldReportError,
} from "components-care";

configureErrorReporting({
	shouldReport: (error, context) =>
		defaultShouldReportError(error, context) && myFilter(error),
});
```

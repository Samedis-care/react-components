# The default error-reporting policy judges a PartialApplyError by the errors it wraps

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `framework/ErrorReporting`: `defaultShouldReportError`, `CcErrorNames`

## What changed

- `CcErrorNames.PartialApplyError` is the name of a `PartialApplyError`,
  `"CcPartialApplyError"`.
- `defaultShouldReportError` judges a `PartialApplyError` by the errors of its failed writes
  (`failures[].error`): it reports it if at least one of them would be reported on its own (a
  `BackendError`, a code error), and no longer reports it if none would, i.e. when all of them
  are `NetworkError`s or `ValidationError`s, or names in the call site's
  `context.ignoreNames`. A failure whose error is no `Error`, and a `PartialApplyError`
  without failures, are reported as before. It is matched by its name and `failures`, so one
  from another copy of the library counts too.

## Why

A Form's save rejects with a `PartialApplyError` when the backend refused writes of a lazy
control's queue (`FormCrudMultiSelect`, `FormCrudFileUpload`, `FormCrudMultiImage`), and the
form reports it. When the connection dropped while the queue was sent, every failure is a
`NetworkError`, which the default policy does not report on its own; the error that wraps
them was reported anyway.

## Migration

Nothing to do for an app that uses the default policy, or builds its `shouldReport` on
`defaultShouldReportError`.

A `shouldReport` of an app's own gets the `PartialApplyError` itself; a check of
`error.name` does not see the errors inside it. Required for an app with its own
`shouldReport` that wants a save whose queued writes failed only for the connection kept out
of its tracker: look into `failures`, or build on `defaultShouldReportError`:

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

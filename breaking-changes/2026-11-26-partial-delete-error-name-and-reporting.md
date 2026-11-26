# A PartialDeleteError is named CcPartialDeleteError, and the default error-reporting policy judges it by its cause

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `backend-integration/Connector`: `PartialDeleteError`; `framework/ErrorReporting`:
  `defaultShouldReportError`, `CcErrorNames`

## What changed

- The `name` of a `PartialDeleteError` is `"CcPartialDeleteError"`; it was
  `"PartialDeleteError"`. The class, its constructor, `failedIds` and `cause` are unchanged.
- `CcErrorNames.PartialDeleteError` is that name.
- `defaultShouldReportError` judges a `PartialDeleteError` by its `cause`, the error its deletes
  failed with: it reports it if the cause would be reported on its own (a `BackendError`, a code
  error), and no longer reports it if the cause is a `NetworkError` or a `ValidationError`, or a
  name in the call site's `context.ignoreNames`. One without a cause, or whose cause is no
  `Error`, is reported as before. It is matched by its name and `cause`, so one from another copy
  of the library counts too.

## Why

Errors of the library are told apart by `Error.name`, and `CcErrorNames` lists the name of every
error class the library raises; a `PartialDeleteError` was missing from it, so a reporting policy
could not name it. The `Cc` prefix keeps it apart from an app's own error class of the same name,
as for `CcPartialApplyError`. A `PartialDeleteError` whose deletes failed only because the
connection dropped is no more actionable than the `NetworkError` it wraps, which the default
policy does not report.

## Migration

Nothing to do for an app that creates and checks a `PartialDeleteError` through the class
(`new PartialDeleteError(…)`, `instanceof PartialDeleteError`), and for one that uses the default
policy or builds its `shouldReport` on `defaultShouldReportError`.

Required for any app that compares an error's name with the string `"PartialDeleteError"` (in a
`shouldReport`, an error tracker's filter such as Sentry's `beforeSend`, or a test): compare with
`CcErrorNames.PartialDeleteError` instead.

```ts
import { CcErrorNames } from "components-care";

if (error.name === CcErrorNames.PartialDeleteError) {
	// …
}
```

A `shouldReport` of an app's own gets the `PartialDeleteError` itself; a check of `error.name`
does not see its cause. Required for an app with its own `shouldReport` that wants a partial
delete that failed only for the connection kept out of its tracker: look at `error.cause`, or
build on `defaultShouldReportError`.

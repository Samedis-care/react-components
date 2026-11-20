# SentryHistory is removed

- **Date:** 2026-11-20
- **Kind:** type
- **Scope:** `framework/History`

## What changed

`components-care` no longer exports the `SentryHistory` class. `FrameworkHistory` and
`setFrameworkHistory` stay as they are.

## Why

`SentryHistory` wrapped `FrameworkHistory` in the `location` / `listen(location, action)`
shape of Sentry's old react-router instrumentation, which Sentry 11 no longer has. Its
`listen` added a listener that could never be removed.

## Migration

Nothing to do for SCF, IMF and the hlth.care frontend: none of them imports it.

- **Required for code that passes `new SentryHistory()` to a Sentry routing
  instrumentation:** remove it and add `componentsCareBrowserTracingIntegration()` from
  `components-care/dist/sentry` to `Sentry.init({ integrations })`, which names the
  transactions after the matched routes.
- **Required for code that reads `location` or calls `listen` on a `SentryHistory`:** use
  `FrameworkHistory` directly. Its `listen` passes one `Update` (`{ location, action }`)
  and returns the function that removes the listener:

  ```ts
  const unlisten = FrameworkHistory.listen(({ location, action }) => {
  	// …
  });
  // later
  unlisten();
  ```

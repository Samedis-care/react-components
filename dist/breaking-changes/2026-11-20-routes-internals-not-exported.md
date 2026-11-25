# The router's internals are no longer exported from the package root

- **Date:** 2026-11-20
- **Kind:** type
- **Scope:** `standalone/Routes`

## What changed

`components-care` no longer exports `useRoutePrefix`, `sentrySetRoutePath`,
`sentryHandleNavigation`, `setRoutingInstrumentation` and the `RoutingInstrumentation`
type. Routes and Route compute their path prefix themselves, and
`componentsCareBrowserTracingIntegration` (`components-care/dist/sentry`) connects Sentry
to HistoryRouter and Route; neither needs the app.

## Why

They are the wiring between Routes, Route, HistoryRouter and the Sentry integration, not
API for apps. Called from an app, `sentrySetRoutePath` renames the current Sentry
transaction and `setRoutingInstrumentation` replaces or disconnects the integration.

## Migration

Nothing to do for SCF and IMF: neither imports any of them.

- **Required for code that reads the path of the enclosing Route with
  `useRoutePrefix()`:** read the route context instead. Outside of every Route the
  prefix was "/":

  ```ts
  const route = useContext(RouteContext);
  const prefix = route ? route.path.replace(/\/\*$/, "/") : "/";
  ```

- **Required for code that calls `sentrySetRoutePath`, `sentryHandleNavigation` or
  `setRoutingInstrumentation`:** remove the calls and set up
  `componentsCareBrowserTracingIntegration()` from `components-care/dist/sentry` in
  `Sentry.init({ integrations })`, which names the transactions after the matched routes.

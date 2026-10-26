# componentsCareBrowserTracingIntegration is imported from components-care/dist/sentry

- **Date:** 2026-10-26
- **Kind:** type
- **Scope:** `componentsCareBrowserTracingIntegration`, `standalone/Routes`

## What changed

- `componentsCareBrowserTracingIntegration` is no longer exported by `components-care`. Import it
  from `components-care/dist/sentry`.
- The routes (`HistoryRouter`, `Route`) no longer load Sentry themselves. The integration
  registers itself with them through `setRoutingInstrumentation`, which takes a
  `RoutingInstrumentation`. Without the integration, `sentrySetRoutePath` and
  `sentryHandleNavigation` do nothing.
- No module of `components-care` uses top-level `await` anymore.

## Why

To work without Sentry, the routes loaded it with a top-level `await`. That made every module
importing them asynchronous, and some bundlers generate broken code for it. The integration now
imports Sentry directly, so it lives outside the index, which has to work without Sentry.

## Migration

```ts
// before
import { componentsCareBrowserTracingIntegration } from "components-care";
// after
import { componentsCareBrowserTracingIntegration } from "components-care/dist/sentry";
```

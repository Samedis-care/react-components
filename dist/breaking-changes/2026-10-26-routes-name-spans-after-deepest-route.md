# Routes name spans after the deepest matched route, on every location

- **Date:** 2026-10-26
- **Kind:** behavior, type
- **Scope:** `Route`, `RouteContext`, `sentrySetRoutePath`

## What changed

- `Route` names the active pageload or navigation span, and the transaction of the current
  Sentry scope, after the deepest matched route, on every location change. Previously:
  - on page load, a nested route was named after its outermost parent (`/tenant/:tenantId/*`
    instead of `/tenant/:tenantId/devices/:deviceId`),
  - a navigation that didn't mount a new route (another id on the same route, a changed query,
    back to a parent route) wasn't named after a route at all.
- `sentrySetRoutePath(routePath, depth, location)` takes the route's nesting depth and the
  location it matched. It used to be `sentrySetRoutePath(pathname)`.
- The `RouteContext` value has a `depth` field: how many routes the route is nested in, 0 for a
  top-level route.

## Why

The span and transaction names were wrong for nested routes and missing for most navigations.

## Migration

Nothing to do unless the app calls `sentrySetRoutePath` itself: pass the depth and location.
Expect transactions in Sentry under the full route names.

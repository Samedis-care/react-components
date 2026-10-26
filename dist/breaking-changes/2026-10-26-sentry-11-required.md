# Sentry 11 is required

- **Date:** 2026-10-26
- **Kind:** type, behavior
- **Scope:** `package.json` peer dependencies, `componentsCareBrowserTracingIntegration`

## What changed

- The optional peer dependency `@sentry/react` is `^11`. Versions 9 and 10 are no longer listed.
  `componentsCareBrowserTracingIntegration` throws "componentsCareBrowserTracingIntegration
  requires @sentry/react 11" with an older Sentry.
- Pageload and navigation spans follow Sentry 11's conventions:
  - With span streaming (Sentry 11's default), a span that no route has named yet is called
    `Pageload` or `Navigation` instead of the URL path. In transaction mode
    (`traceLifecycle: "static"`) it keeps the URL path.
  - The name source is set as `sentry.segment.name.source` instead of `sentry.source`, and a
    span named after a route also gets `url.template`.
- `sentry.origin` is `auto.pageload.react.components_care` and
  `auto.navigation.react.components_care` (previously misspelled `compoenents_care`).

## Why

Sentry 11 removed `sentry.source` and requires low-cardinality span names, so the URL can't be
a span name.

## Migration

Upgrade `@sentry/react` to 11 together with this version, and adjust the app's `Sentry.init` as
described in Sentry's
[migration guide](https://docs.sentry.io/platforms/javascript/guides/react/migration/v10-to-v11/).
Update filters, dashboards and alerts that match URL-named pageload or navigation spans,
`sentry.source`, or the misspelled origin.

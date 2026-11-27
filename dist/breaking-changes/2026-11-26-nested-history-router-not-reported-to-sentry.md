# A HistoryRouter inside another one reports nothing to Sentry

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/Routes` (`HistoryRouter`, `Route`) with
  `componentsCareBrowserTracingIntegration` (`components-care/dist/sentry`)

## What changed

With `componentsCareBrowserTracingIntegration` set up, only the outermost `HistoryRouter`
(the one `Framework` renders on `FrameworkHistory`) and its `Route`s report to Sentry. A
`HistoryRouter` rendered inside another one, e.g. a wizard on a `createMemoryHistory()`
inside a page under "/devices/*":

- starts no navigation span when its history pushes or goes back or forward. Before, every
  step of the wizard started a navigation span named after the wizard's location
  ("/step2"), which ended the page's span.
- leaves the Sentry transaction name and the name of the active pageload or navigation span
  alone: its `Route`s don't name them. Before, they renamed both after the wizard's route
  ("/step2") whenever the wizard navigated, or mounted after the page had rendered.

Errors and spans on such a page stay named after the page's route ("/devices/*").

## Why

A nested `HistoryRouter` routes within a page: its locations are not pages of the app.
Named after them, the errors of the page were grouped under the wizard's steps, and the
page's performance data was split into one span per step.

## Migration

Nothing to do.

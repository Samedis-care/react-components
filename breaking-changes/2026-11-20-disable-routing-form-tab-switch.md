# A dirty disableRouting Form switches routed tabs without asking

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-components/Form/Form` with `disableRouting` (the leave guard of every
  form page: `DefaultFormPage`, `EditOnlyFormPage`, `FlowEngineFormPage`), `CRUD` with
  `disableRouting`

## What changed

The leave guard of a dirty Form with `disableRouting` lets a navigation pass without
"Leave form page?" when the Form stays mounted, as it already did for a routed Form: the
Form's nearest Route must still be rendered at the target, with the same url. For a
`disableRouting` Form that Route is the one of the page around it. Before, every
navigation asked, also one that kept the Form and its edits.

| A dirty `disableRouting` Form …                                   | Navigation                          | Before                                      | Now                           |
| ----------------------------------------------------------------- | ----------------------------------- | ------------------------------------------- | ----------------------------- |
| under a Route `/page/*`, `RoutedTabs` in or next to its form page | opening another tab                 | asks, Yes opens the tab and keeps the edits | opens the tab, the edits stay |
| under a Route `/page/*`                                           | a path below it that no entry takes | asks                                        | passes, the edits stay        |
| in a `RoutedTabs` panel (e.g. a `disableRouting` CRUD in a tab)   | opening another tab                 | asks                                        | asks                          |
| under a Route `/page/*`                                           | a path outside `/page`              | asks                                        | asks                          |
| outside of every Route                                            | any                                 | asks                                        | asks                          |

A Form in a dialog is under the Route its `DialogContextProvider` is rendered in: the
dialogs that a CRUD record page pushes are under the Route around that page and stay open
on a navigation inside it, so such a navigation passes; the dialogs of the Framework's own
provider are outside of every Route.

## Why

The prompt said "Changes are lost" for a tab switch that kept the Form, so nothing was
lost, and whoever answered No could not open another tab before saving.

## Migration

Nothing to do. A `disableRouting` Form outside of every Route asks for every navigation as
before; one under a Route asks when the navigation unmounts it.
`disableRouting` is no longer a way to make every navigation ask: put the pages that
should be left with a prompt into their own `Routes` entries, as a navigation to another
entry unmounts the Form and asks.

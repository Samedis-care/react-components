# A dirty Form in a tab panel asks before another tab replaces it

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `backend-components/Form/Form` (the leave guard of every form page:
  `DefaultFormPage`, `EditOnlyFormPage`, `FlowEngineFormPage`, every CRUD record page),
  `standalone/Routes/Route` (`RouteContext`, `useRouteInfo`), `Routes`

## What changed

A navigation from a dirty routed form passes without "Leave form page?" as one inside the
form page only when the Form stays mounted: the Form's nearest Route must still be
rendered at the target, with the same url. Whether it is rendered follows every `Routes`
around it now: a `Routes` renders the first of its entries that matches, so an entry
listed before the Form's route takes the target over and the Form unmounts.

The case where this differs is a Form placed in the default panel of `RoutedTabs`
(`tab("", <Form …>)`, the Form itself in the panel, not around the tabs and panels). The
default panel's route `/*` matches every path below the record, but the panel of the tab
that is opened is listed before it and wins:

| A dirty routed Form …                        | Navigation                              | Before                              | Now                     |
| -------------------------------------------- | --------------------------------------- | ----------------------------------- | ----------------------- |
| in the default panel                         | opening another tab                     | switches, the Form and its edits go | asks "Leave form page?" |
| in the default panel                         | a path below it that no other tab takes | passes, the edits stay              | passes, the edits stay  |
| around the tabs and panels                   | opening another tab                     | passes, the edits stay              | passes, the edits stay  |
| on a route `/rec/*`, listed after `/rec/new` | `/rec/new`                              | passes, the Form and its edits go   | asks "Leave form page?" |

Yes leaves as it does for any other navigation: the tab opens and the edits are discarded.

The `RouteContext` value (`useRouteInfo()`) has a new field, `rendersAt(pathname)`: whether
the route would still be rendered at that pathname, taking every `Routes` and `Route`
around it into account. It stays the same function as long as the route's path does.

## Why

The guard took a route that matches the target to keep rendering there. Inside a `Routes`
that holds only for the entry the `Routes` picks, so a tab switch on a dirty Form in the
default panel unmounted the Form without asking and its edits were lost.

## Migration

- Code that provides a `RouteContext` value itself (a test or a mock) adds `rendersAt`,
  e.g. `rendersAt: (pathname) => !!matchPath({ path }, pathname)`; it no longer
  type-checks without it.
- Nothing else to do. Expect the prompt when the user opens another tab while a Form in
  the default panel is dirty. To keep the edits across tabs instead, put the Form around
  the tabs and the panels (its form page wrapping `RoutedTabs` and
  `RoutedTabPanelWrapper`).

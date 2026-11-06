# RoutedMenu fills route params from the whole menu, and hides and reports entries it cannot fill

- **Date:** 2026-11-06
- **Kind:** type, behavior
- **Scope:** `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`), `utils/routeUtils` (`insertRouteParameters`, `getMissingRouteParameters`)

## What changed

- **Where the params come from:** the `:name` params of an entry's `route` are filled from
  the current URL, read with the route of the whole menu tree that matches the URL best (an
  exact match first, otherwise the longest route that matches as a prefix). Only the
  top-level entries used to be searched, so a param that only a route inside a group
  provides was left empty.
- **Entries that cannot be filled are hidden:** while the current URL has no value for one
  of an entry's route params, RoutedMenu does not render the entry or its children, as if
  its `shouldRender` were false. `useRoutedMenuLogic` returns such an entry with
  `shouldRender: false`; its `onClick` and `onAuxClick` still call the definition's own
  handlers, but neither navigates nor opens a tab.
- **In development such an entry is an error:** outside production builds
  (`process.env.NODE_ENV !== "production"`), RoutedMenu and `useRoutedMenuLogic` log a
  `console.error` that names the entry (its title path and route), the current URL and the
  missing param, once per mounted menu, entry and param. Entries the definition hides itself
  (`shouldRender: false`), and the entries below them, are not reported. Production builds
  only hide the entry.
- **`insertRouteParameters(route, params)`** returns `string | null`: `null` when `params`
  has no value, or an empty one, for one of the route's params. A missing param used to
  become an empty segment. The new `getMissingRouteParameters(route, params)` lists those
  params.

## Why

An empty segment made a broken target. On `/projects/42/review`, an entry
`/projects/:id/capture` inside a group navigated to `/projects//capture`, which the routes
read as `/projects/capture` (a NotFound page, or the wrong page). With the param in the
first segment the target was `//b`, which the browser reads as the host `b`: the click left
the app. The same happened for any entry whose param the current page has no value for
(another param name, or a page outside the param's scope).

A menu entry is not meant to depend on params the current page may lack, so this is a
mistake in the menu definition: hiding the entry keeps production usable, and the
development error points at the entry to fix.

## Migration

Nothing to do for IMF and SCF, and neither logs the development error. IMF's param routes
are all at the top level and shown only on pages that provide their params; SCF's routes
with params are hidden detail pages (`shouldRender: false`).

- **Required for an app that renders `useRoutedMenuLogic`'s definitions itself:** skip the
  entries with `shouldRender: false`, as MenuBase does. Otherwise such an entry is shown
  and does nothing when clicked. SCF's `SamedisMenuGroup` already skips them.
- **Required for callers of `insertRouteParameters`:** handle `null` (the route needs a
  param that `params` does not have).
- An entry whose route has a param that some pages do not provide is now hidden on those
  pages, and logs an error in development. If it is meant only for the pages that provide
  the param, set its `shouldRender` to false on the other pages; to show it everywhere,
  give it a route without that param.
- A group whose children are all hidden this way still shows as an expandable group with
  nothing inside, as it does when `shouldRender` hides all of a group's children.

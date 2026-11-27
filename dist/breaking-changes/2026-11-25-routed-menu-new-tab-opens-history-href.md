# A routed menu entry opens a new tab at the URL a click navigates to

- **Date:** 2026-11-25
- **Kind:** behavior
- **Scope:** `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`)

## What changed

A Ctrl, Meta or Shift click and a middle click on a routed menu entry open the URL that a
plain click on the entry navigates to, in a new tab. The menu builds it the way a click
hands the target to the history: leading slashes collapse into one, as `useNavigate` does
it, and the history's `createHref` writes the URL.

- With a hash history, an entry with the route `/profile` opens `#/profile` (the app's
  page) instead of `/profile` (outside of the app).
- With a history whose `createHref` puts a base path or another prefix before a path, the
  new tab gets that prefix too.
- A route that starts with `//`, such as `` `${useRouteInfo().url}/devices` `` under a
  Route at the root, opens `/devices`, where a click goes, not the host `devices`.

With the browser history Framework provides, every other route opens the same URL as
before.

## Why

The new tab opened the entry's target as it is, not the URL the history writes for it, so
it could land outside of the app, or on another host, while a plain click on the same entry
stayed in the app.

## Migration

Nothing to do. An app that renders `useRoutedMenuLogic`'s definitions with its own
components gets the new URLs from the `onClick` and `onAuxClick` handlers too.

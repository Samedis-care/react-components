# A RoutedMenu group only shows and hides its entries; its `route` is ignored

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`)

## What changed

A group, an entry with at least one child, ignores its `route`:

- A click, Enter or Space on the group expands or collapses it and runs its `onClick`. It
  no longer navigates to the route. A Ctrl, Meta or Shift click and a middle click no
  longer open the route in a new tab.
- The route takes no part in finding the entry of the current URL: on the group's path
  the group is not the current entry, and its route's params fill no other entry's route.
- A param that the group's route needs and the current URL lacks no longer hides the
  group, and is not reported in development.
- `useRoutedMenuLogic` returns the group with `href: undefined` and `current: false`. The
  group's `route` field is still passed through, unchanged.

An entry with `children: []` is no group: its `route` works as before.

## Why

A group with a route was one control with two effects: activating it expanded the group
and opened its page, and activating it again collapsed the group and opened the page
again. A keyboard or screen-reader user who only wanted to reach an entry inside the group
also changed the page, and assistive technology was told about a toggle (`aria-expanded`)
that also navigated. A group is now a disclosure button and nothing else; the pages are its
entries.

## Migration

- **Required for any app whose RoutedMenu or `useRoutedMenuLogic` definition gives an
  entry both `children` and a `route`:** that page is no longer reachable through the
  group. Move the route into an entry among the group's children, for example:

  ```ts
  {
  	title: "Settings",
  	shouldRender: true,
  	children: [
  		{ title: "Overview", route: "/settings", shouldRender: true },
  		{ title: "Profile", route: "/settings/profile", shouldRender: true },
  	],
  }
  ```

  The group's `onClick` still runs on every click, so a navigation started from it still
  happens and makes the group a toggle that navigates again: move such a navigation into
  an entry as well.
- An app whose groups have no `route` has nothing to do.

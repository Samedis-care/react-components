# RoutedMenu reads a route the same way for the highlight and the click

- **Date:** 2026-11-19
- **Kind:** behavior
- **Scope:** `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`)

## What changed

An entry's `route` is both the pattern that highlights the entry and the target a click
navigates to. Three forms of a route are now read the same way for both:

| Route                                              | Highlighted on                               | Click (and new tab) goes to                  | Before                                                                                        |
| -------------------------------------------------- | -------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `/devices/*`                                       | `/devices` and below (as before)             | `/devices`                                   | went to `/devices/*`                                                                          |
| `/devices/:id/*` on `/devices/5/edit`              | `/devices/5` and below (as before)           | `/devices/5`                                 | went to `/devices/5/*`                                                                        |
| `/tasks?tab=open#list`                             | `/tasks` and below, with any search and hash | `/tasks?tab=open#list`                       | never highlighted                                                                             |
| `/devices/:id?tab=info` on `/devices/5`            | `/devices/5` and below (as before)           | `/devices/5?tab=info`                        | went to `/devices/5`, without the search                                                      |
| `users`, menu outside of any Route                 | `/users` and below (as before)               | `/users`                                     | went to the path relative to the current URL (`/apps/users` from `/apps/a1`, browser history) |
| `users`, menu inside `<Route path="/apps/:app/*">` | `/apps/a1/users` and below                   | `/apps/a1/users` from any page of `/apps/a1` | highlighted on `/users`, went to the path relative to the current URL                         |

- A trailing `/*` is no part of the target. It still ranks below the same route without it
  when both match.
- A search and a hash go into the target and play no part in the highlight, so entries whose
  routes differ only in their search or hash match the same pages, and the earlier one is
  highlighted. The current URL's search and hash are still not kept.
- A route without a leading slash is relative to the Route the menu is rendered in, as
  RoutedTabs' values are: the part for the Route is the part of the current URL that the
  Route matched, so the entry is shown and navigates also on pages of the Route that no menu
  entry matches. Outside of any Route it is the same route with a leading slash.
- A route is a path of the app, not a URL: a route with a scheme (`https://…`) has no
  leading slash, so it is resolved as a relative path too. Open an external page from the
  entry's `onClick`.

## Why

Each of these routes was highlighted one way and navigated another: a click on a `/*` entry
led to a page for the literal `*` (NotFound, or a detail page for the id `*`), an entry with
a query string was never highlighted from the URL, and a relative route was highlighted as if
it started at the root while the browser resolved the click against the current URL.

## Migration

Nothing to do for IMF, SCF and hlth.care: their menus use absolute routes without `*`,
search or hash, which behave as before.

A menu rendered inside a Route can now use relative routes instead of putting the Route's
part in front of each one itself, e.g. `route: "users"` instead of
`` route: `/tenant/${tenantId}/users` `` in a menu inside `<Route path="/tenant/:tenantId/*">`.

# RoutedMenu highlights the most specific entry of the whole menu

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`)

## What changed

One rule now picks the entry of the current URL, over the whole menu tree: of all entries
whose `route` matches the URL (as a prefix, at any level and in any group), the most specific
one wins:

1. an exact match before a prefix match,
2. then the route with more segments,
3. then, segment by segment from the left, a literal before a `:name` param (`/apps/new`
   before `/apps/:app`),
4. on a tie the deeper entry (a group's entry with the group's own route), then the earlier
   one.

That entry is highlighted (the active id of `useRoutedMenuLogic`), only the groups above it
are expanded, and its route provides the `:name` params for the targets of all entries.

Before, the menu looked into the groups first, in definition order, and took the first group
with a matching entry, so a match inside any group beat every entry of the level above it,
and an earlier group beat a later one. Within a level the longest route string won, so
`/apps/:app` beat `/apps/new`. Every group with a matching entry was expanded, and the
params were read with a route picked by a different rule (the first exact match in
definition order, otherwise the longest route string).

| Menu                                                                                | URL                | Highlighted before                                     | Now                            |
| ----------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------ | ------------------------------ |
| group Settings: `General (/settings)`; group Advanced: `Expert (/settings/expert)`  | `/settings/expert` | General, both groups expanded                          | Expert, only Advanced expanded |
| group Reports: `Overview (/reports)`; top level: `Device report (/reports/devices)` | `/reports/devices` | Overview, Reports expanded                             | Device report                  |
| `New app (/apps/new)`, `App (/apps/:app)`                                           | `/apps/new`        | App, or nothing when App is listed second (App hidden) | New app                        |

## Why

The highlight showed an entry for a page other than the current one whenever the menu had
overlapping routes in different groups or levels, or a literal route next to a param route,
and the groups of every partial match were held open. The highlight, the expanded groups and
the params now always come from the same entry, the one that describes the current page best.

## Migration

Nothing to do for IMF and SCF: their menus have no routes for which the two rules differ, so
the same entries are highlighted and expanded as before.

For other menus, check the pages where routes in different groups or levels overlap, or where
a literal route sits next to a param route: the more specific entry is highlighted there now,
whatever the definition order. On the page of a literal route (`/apps/new`), the entries whose
route needs the param of the param route next to it (`/apps/:app`, `/apps/:app/users`) are
hidden, because the URL has no value for it, and reported in development; give them
`shouldRender: false` on those pages.

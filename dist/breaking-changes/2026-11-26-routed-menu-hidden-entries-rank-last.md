# On the page of a hidden entry, RoutedMenu highlights the closest shown entry

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`)

## What changed

An entry that the menu does not show is the entry of the current URL only where no shown
entry matches the URL. An entry is hidden by its own `shouldRender: false`, by that of a
group above it, and while the current URL has no value for one of its params.

- Of the entries whose route matches the URL, the most specific shown one is highlighted
  and the groups above it are expanded, also when a hidden entry matches more
  specifically.
- On a page that only hidden entries match, nothing is highlighted, as before, but no group
  is held open any more: the group above the hidden entry starts collapsed and can be
  expanded and collapsed by hand. For `useRoutedMenuLogic`, the best hidden entry is still
  the entry of the current URL: its id is the active id of `controlledState`, it is
  `current`, and the groups above it have `containsCurrent`. Their `forceExpand` is now
  `false` (unless the definition sets it).
- The params that fill the routes of the entries are still read with the route that matches
  the URL best, a hidden entry's included.

| Menu                                                                               | URL                   | Before                                              | Now                                    |
| ---------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------- | -------------------------------------- |
| group Devices: `Projects (/projects)`, hidden `Capture (/projects/:id/capture)`    | `/projects/7/capture` | nothing highlighted, Devices expanded and held open | Projects highlighted, Devices expanded |
| group Admin: `Public (/admin/public)`, hidden `Secret (/admin/secret)`             | `/admin/secret`       | nothing highlighted, Admin expanded and held open   | nothing highlighted, Admin collapsed   |
| `Apps (/apps)`, `General (/apps/:application)`, hidden `Import (/apps/new/import)` | `/apps/new/import`    | nothing highlighted                                 | Apps highlighted                       |

## Why

A page kept out of the menu, such as a detail page below a list or a page the user lacks
the permission for, was the best match on its own URL. No shown entry was highlighted there,
even one whose route matched the URL, and the group above the hidden entry was held open
without a highlighted entry in it. The menu now highlights the closest page it shows, and
holds a group open only to keep the highlighted entry in view. A menu that the app renders
itself can still mark the section of a page that no shown entry matches, from the active id
or `containsCurrent`.

## Migration

Nothing to do. Expect the new highlight on the pages of hidden entries that a shown entry
matches as a prefix, and groups that are no longer held open on pages that only hidden
entries match. An app that marks a group from the active id (`active.startsWith(id + "@")`)
or from `containsCurrent` keeps marking it on both kinds of page.

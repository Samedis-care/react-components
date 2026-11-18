# RoutedMenu's highlight follows the URL only

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`)

## What changed

The highlighted entry is always the entry of the current URL, and nothing else:

- On a path that no entry's `route` matches, no entry is highlighted. Before, the entry of
  the previous path stayed highlighted.
- A click highlights nothing by itself; only the navigation it starts moves the highlight.
  An action entry without `route` ("Log out"), a Ctrl/Meta/Shift click (which opens a new
  tab and stays on the page) and a navigation that a blocker cancels leave the highlight
  where it is. Before, the clicked entry was highlighted, on a path that no entry matches
  until the next navigation.
- `useRoutedMenuLogic` derives the active id from the URL during render.
  `controlledState[0]` is `""` on a path that no entry matches, and already holds the
  entry of the new URL in the first render after a mount or a navigation (before, it was
  set in an effect one render later). The setter, `controlledState[1]`, does nothing.

## Why

The highlight marks the current page. A stale or clicked entry showed a page the user is not
on, for example after following a link to a page outside the menu or after "Log out" was
clicked.

## Migration

Nothing to do for IMF and SCF: they read the active id from `controlledState` (through
`MenuContext`) and never call its setter. On pages without a menu entry, no entry is
highlighted now.

An app that called `controlledState[1]` to highlight an entry has to stop: the call has no
effect. To highlight an entry on a page, give the entry a `route` that matches the page's
URL.

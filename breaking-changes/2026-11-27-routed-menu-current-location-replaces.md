# A click on the RoutedMenu entry of the current location replaces the history entry

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `non-standalone/Portal/Menu` (`RoutedMenu`, `useRoutedMenuLogic`)

## What changed

A plain click on a `RoutedMenu` entry whose target is the current location replaces the
current history entry instead of pushing a second one. The current location means the same
pathname, search and hash, compared as the URL parser reads them, the rule `Link` follows
since 2026-11-20: at `/users`, a click on the entry `/users` replaces; at `/users?page=2#x`
it still pushes `/users`, so Back returns to `/users?page=2#x`. An entry with a search or
hash in its route (`/tasks?tab=open`) replaces only where the URL has exactly that search
and hash.

The same applies to the `onClick` of the entries that `useRoutedMenuLogic` returns, on a
link and on a button alike. Ctrl, Meta, Shift and middle clicks are unchanged, and so is
`useNavigate()`, which pushes unless told to replace.

A replace starts no Sentry navigation span, so such a click no longer starts one. The page
still scrolls to the top, as after every navigation.

## Why

On `/users`, every click on "Users" added another `/users` entry, so Back had to be pressed
once per click to leave the page. The browser replaces the entry when a plain `<a>` leads to
the current URL, and so do `Link` and react-router's links.

## Migration

Nothing to do. A test that counts history entries after clicking the entry of the current
page expects one entry instead of one per click.

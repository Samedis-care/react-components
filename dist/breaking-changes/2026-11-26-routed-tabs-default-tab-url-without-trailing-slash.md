# The default tab of RoutedTabs opens the route's own url, without a trailing "/"

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `non-standalone/RoutedTabs`

## What changed

Opening the default tab (`value=""`) of a `RoutedTabs` pushes the enclosing Route's own
url: on `/users/1/security` a click on the default tab goes to `/users/1`. Before, it went
to `/users/1/`, with a trailing "/". A nested bar's default tab goes to the outer tab's url
the same way (`/users/1/security`, before `/users/1/security/`). Under a Route at `/*` the
default tab still goes to `/`. The other tabs, and the query and hash that every tab keeps,
are unchanged.

## Why

The default tab had two URLs: the one an app opens (`/users/1`) and the one a click on the
tab produced (`/users/1/`). History entries, bookmarks and copied links differed for the
same view, and code that compares the location with the route's url saw two different
paths.

## Migration

Nothing to do. A test or other code that expects the pathname with a trailing "/" after a
click on the default tab must expect the route's url without it.

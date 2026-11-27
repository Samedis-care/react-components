# An empty navigation target keeps the current path

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/Routes`

## What changed

The empty target `""` is a path of the app that keeps the current pathname and drops the
search and hash, as `history.push("")` does:

- `<Link to="">` routes a click instead of leaving it to the browser, and its `href` is
  the current pathname: at `/devices?page=1#notes` it renders `href="/devices"` and a click
  goes to `/devices` without loading the page again. At `/devices` the click replaces the
  history entry, like any link to the current location. With `markCurrent`, the link is
  marked as the current page.
- `useNavigate()("")` navigates to the current pathname instead of throwing
  "is not a path of this app".

Before, `<Link to="">` rendered `href=""`, so a click reloaded the whole page, and
`navigate("")` threw.

## Why

A target without a pathname (`"?page=2"`, `"#notes"`, `{ search: "?page=2" }`) already
kept the current one. The empty string, which leaves out all three parts, was treated as
"not a path of the app" only because it is falsy, so the same target reloaded the page
through a `Link` and threw through `navigate`.

## Migration

Nothing to do for a link or a `navigate` call that means "this page". A `<Link to="">`
used to reload the page must reload it itself, e.g. with `window.location.reload()` in
its `onClick`. A `navigate` call that relied on `""` throwing now navigates instead.

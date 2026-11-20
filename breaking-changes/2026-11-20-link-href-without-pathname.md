# A Link to a location without pathname points at the current page

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Routes`

## What changed

`Link` builds the `href` of a target without a `pathname` from the current location, the
same way a click builds the new location. At `/devices?page=1`,
`<Link to={{ search: "?page=2" }}>` and `<Link to="?page=2">` now have
`href="/devices?page=2"`, and `<Link to={{ hash: "#notes" }}>` and `<Link to="#notes">`
have `href="/devices#notes"`. Before, a location object pointed at the root
(`/?page=2`, `/#notes`) while a click stayed on the current path, and a string kept the
browser's own resolution of its href. The `href` also follows the current location when
it changes after mount.

## Why

The `href` is what Ctrl-click, middle-click, "copy link address", the status bar and a
new tab use. It pointed at a different page than a plain click opened. A target that
leaves out `pathname`, `search` or `hash` still gets it completed by the push, so the
rendered link and the routed click disagreed.

## Migration

Nothing to do. A target that names a `pathname` renders the same `href` as before. Only
a target without one — a location object or a string such as `"?page=2"` — changed, and
its `href` now agrees with what a click did all along.

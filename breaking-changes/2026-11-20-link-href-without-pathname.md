# A Link to a location without pathname points at the current page

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Routes`

## What changed

`Link` builds the `href` of a location object from the current location, the same way a
click builds the new location. At `/devices?page=1`, `<Link to={{ search: "?page=2" }}>`
now has `href="/devices?page=2"` and `<Link to={{ hash: "#notes" }}>` has
`href="/devices#notes"`. Before, both pointed at the root (`/?page=2`, `/#notes`) while a
click stayed on the current path. The `href` also follows the current location when it
changes after mount.

## Why

The `href` is what Ctrl-click, middle-click, "copy link address", the status bar and a
new tab use. It pointed at a different page than a plain click opened. A location object
that leaves out `pathname`, `search` or `hash` still gets it completed by the push, so
the rendered link and the routed click disagreed.

## Migration

Nothing to do. A target that names a `pathname`, and every string target, renders the
same `href` as before; only a location object without a pathname changed, and its
`href` now agrees with what a click did all along.

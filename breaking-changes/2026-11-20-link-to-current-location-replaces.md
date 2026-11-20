# A click on a Link to the current location replaces the history entry

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Routes`

## What changed

A plain click on a `Link` that leads to the current location replaces the current
history entry instead of pushing a second one. The current location means the same
pathname, search and hash once the target is completed the way a push completes it: at
`/devices?page=2`, `<Link to="/devices?page=2">` and `<Link to="?page=2">` replace, while
`<Link to="/devices">` and `<Link to="#notes">` still push. Both locations are compared as
the URL parser reads them, so `/über` is the current location at `/%C3%BCber`. The state
is not compared: the link's `state` is stored in the replaced entry.

The `replace` prop still decides when it is set: `replace={false}` always pushes,
`replace` always replaces. The default (no `replace`) is the new behavior. It also applies
to MUI components rendered as the Link (`<MuiLink component={Link} to="/x">` in a
breadcrumb). `useNavigate()` is unchanged: it pushes unless told to replace.

A replace starts no Sentry navigation span, so such a click no longer starts one. The page
still scrolls to the top, as with every navigation.

## Why

At `/x`, a click on the link to `/x` (the current breadcrumb or menu entry) added a second
`/x` entry, so Back had to be pressed twice to leave the page. The browser replaces the
entry when a plain `<a>` leads to the current URL, and so does react-router's Link.

## Migration

Nothing to do: neither SCF nor IMF passes `replace` to `Link`. A `Link` that has to add
an entry also for the current location sets `replace={false}`.

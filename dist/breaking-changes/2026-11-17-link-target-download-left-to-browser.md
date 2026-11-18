# Link leaves a click to the browser when it has target or download

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `standalone/Routes`

## What changed

`Link` leaves a click to the browser when the link has a `target` other than `_self`
(`_blank`, a window name) or a `download` attribute: the browser opens the `href` in that
tab or window, or downloads it. Before, a plain click ignored both and routed in the
current tab. `replace` and `state` don't apply to such a click. An empty `target` or
`_self` (in any case) routes as before, and so does `download={false}`. The `onClick`
prop is still called first on every click.

This also covers MUI components rendered as the Link
(`<Button component={Link} to="/x" target="_blank">`).

## Why

`target="_blank"` and `download` are how a link asks for a new tab or a download, and a
native `<a>` and MUI's `Link` honor them. Routing such a click replaced the current page
instead.

## Migration

Nothing to do: neither SCF nor IMF passes `target` or `download` to `Link`. A `Link` that
should route in the current tab must not set them.

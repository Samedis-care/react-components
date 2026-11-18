# Route params are percent-decoded, and literal route segments match the decoded location

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `standalone/Routes` (`useParams`, `matchPath`, `Routes`, `Route`), `utils/routeUtils` (`extractRouteParameters`, `doesRouteMatch`), `non-standalone/Portal/Menu` (RoutedMenu, `useRoutedMenuLogic`)

## What changed

- **Params are decoded:** `useParams()`, `matchPath(…).params` and
  `extractRouteParameters` give each `:name` param percent-decoded. At
  `/search/foo%20bar/%C3%A4`, the route `/search/:term/:x` gives
  `{ term: "foo bar", x: "ä" }`; it used to give `{ term: "foo%20bar", x: "%C3%A4" }`.
  An encoded slash stays inside its param (`a%2Fb` is `"a/b"`, one segment), and a
  segment with a malformed escape (`100%`) is given as it is.
- **Literal segments match decoded:** a route's literal segments are compared with the
  decoded location, in `Routes`, `Route`, `matchPath`, `doesRouteMatch` and RoutedMenu.
  The route `/über` now matches the browser's `/%C3%BCber`; it never matched before.
  Write literal segments as text (`/über`), not encoded.
- **RoutedMenu encodes the params it fills in:** an entry's `:name` params are filled
  from the current URL percent-encoded (`encodeURIComponent`), so a value with `/`, `?`,
  `#` or `%` stays one segment of the target.
- Unchanged: the `url` of a route (`useRouteInfo().url`, `matchPath(…).url`) keeps the
  encoding of the location, as `useLocation().pathname` does, so paths built from it
  work as before.

## Why

The browser keeps `location.pathname` percent-encoded, while a memory history keeps the
text as it was pushed. A param with a space or a non-ASCII character reached the page
encoded in the app but decoded in tests and stories, and a route with a non-ASCII
literal never matched in the browser. Params now come out as text in both, as in
react-router.

## Migration

Nothing to do for SCF and IMF: their params are ids, slugs and app names, which have
nothing to decode.

- **Required for code that decodes a param itself** (`decodeURIComponent(params.x)`):
  remove the decode. The value is decoded already; decoding it again changes a value
  with `%` in it, or throws.
- **Required for code that puts a param back into a path**, where the value can hold
  `/`, `?`, `#` or `%` (user text, not ids): encode it, e.g.
  ``navigate(`/search/${encodeURIComponent(term)}/details`)``. Unencoded, a `/` splits
  the segment and a `?` or `#` starts the query or hash.

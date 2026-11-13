# useNavigate and Link keep a navigation inside the app

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Routes`

## What changed

- `useNavigate()` and `Link` collapse the leading slashes of a target into one:
  `navigate("//7")` and `<Link to="//7">` go to `/7`, and so does a location object
  with `pathname: "//7"`. A backslash counts as a slash, as it does in the browser.
  `` `${useRouteInfo().url}/7` `` under a route that matches at the root (`/*`, `*`,
  `/`) is `//7`, so CRUD's edit, new and import pages now open there too.
- `navigate(to)` throws an `Error` when `to` has a scheme (`"https://…"`,
  `"mailto:…"`, `"javascript:…"`), with and without `replace`, and changes nothing:
  no navigation, no scroll reset. Before, a push loaded that URL and left the app,
  and a replace threw a `SecurityError` for another origin.
- `<Link to>` with a scheme renders a plain link to that URL: a click is left to the
  browser instead of being routed, and `replace` and `state` don't apply to it.

## Why

The browser reads a URL that starts with `//` as protocol-relative: `//7` is the host
`7`. A link built from a root route's `url` took the user to `https://7/`, or threw
with `replace`. And a target that comes from outside, such as a `redirect_path` query
parameter, must not take the user to another site.

## Migration

- **Required for IMF:** `src/pages/Auth/RecoverAccount.tsx` calls
  `navigate(resp.meta.redirect_url!)`. That URL is absolute (`<app host>/authenticated#…`),
  so `navigate` now throws, and the `catch` shows the recovery error dialog after a
  successful recovery. Leave the app the way `ConfirmRecoveryEmail.tsx` does:

  ```ts
  window.location.href = resp.meta.redirect_url!;
  ```

- Any other `navigate` call whose target can be an absolute URL must leave the app
  with `window.location` instead.
- SCF and IMF `AuthProvider`: `navigate(search.get("redirect_path") ?? "/", { replace: true })`
  still throws for a `redirect_path` with a scheme (now this `Error`, before a
  `SecurityError`). Nothing to do; to land on the start page instead, catch it:

  ```ts
  try {
    navigate(search.get("redirect_path") ?? "/", { replace: true });
  } catch {
    navigate("/", { replace: true });
  }
  ```

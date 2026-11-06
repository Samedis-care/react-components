# Link routes a click also when it has an onClick

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Routes`

## What changed

`Link` calls its `onClick` prop first and then routes the click, unless `onClick` called
`evt.preventDefault()`. Clicks with Ctrl, Meta, Shift or Alt are left to the browser, as
before. An `onClick` used to replace the routing: only the handler ran, and the browser
followed the `href`, which loaded the target as a new document (or, for `to="#"`, jumped
to the fragment).

This also covers MUI's ButtonBase components rendered as the Link
(`<Button component={Link} to="/x">`, `ListItemButton`, `MenuItem`, `Tab`, `IconButton`).
They pass an `onClick` of their own, so every click on them used to load a new document;
now it is routed. A disabled one stays inert, because ButtonBase prevents the default.

## Why

A full page load drops the app state and the query cache, and with unsaved changes it
shows the browser's leave-page prompt instead of the app's dialog. Closing a menu or
tracking a click on a link should not change where the link goes.

## Migration

Required for a `Link` (also as `<MuiLink component={Link}>`) whose `onClick` runs an
action instead of navigating and does not call `evt.preventDefault()`: a click now also
navigates to `to`. Make the control a button, or call `evt.preventDefault()` in the
handler.

In IMF this is the "recover account" link in `src/pages/Auth/components/AuthPassword.tsx`
(`to={"#"}` with `onClick={recoverAccount}`). Without the change a click pushes `#`, which
drops the login page's query string (the parameters the password login sends along) and
scrolls to the top. It sits inside the login `<form>`, so the button needs `type="button"`:

```tsx
<MuiLink component="button" type="button" onClick={recoverAccount}>
	{t("auth.password.enter.recover")}
</MuiLink>
```

A handler that opens a dialog in place of the navigation and already calls
`evt.preventDefault()` needs nothing (SCF's `DeviceRequestsFormPage`).

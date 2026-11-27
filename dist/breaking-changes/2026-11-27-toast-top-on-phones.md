# On phones a toast shows at the top of the screen

- **Date:** 2026-11-27
- **Kind:** behavior, type
- **Scope:** `standalone/Toast` (also every toast shown through the Framework's `useToastContext`)

## What changed

Below the theme's `sm` breakpoint (600px wide by default: phones, and desktop browser
windows zoomed in that far), where the toast spans the screen's width, it now shows at the
top edge instead of the bottom edge. From `sm` up nothing changes: bottom right by default.

The new prop `phoneVertical` (`"top"` or `"bottom"`, default `"top"`) sets where the toast
shows below `sm`. `anchorOrigin` now applies from `sm` up only; below `sm` its `vertical`
is replaced by `phoneVertical`. Both can be set app-wide in
`theme.components.CcToast.defaultProps` and per toast, as props of `Toast` or in the
`showToast` config (`ToastConfig` gained `phoneVertical`).

The Snackbar root gets the position actually used, so below `sm` its class is
`MuiSnackbar-anchorOriginTop…` and a theme variant of `CcToast` keyed on `anchorOrigin`
matches against it.

## Why

At the bottom, the full-width toast covered whatever the page has there: action bars with
Save and Cancel, form footers, a data grid's footer, the actions of a full-screen dialog,
a bottom navigation. A keyboard user who tabbed to such a button could not see it (WCAG
2.4.11 Focus Not Obscured), and a tap on it hit the toast instead, so the action did not
happen. Toasts mostly follow an action taken there. At the top the toast covers the top of
the page (an app bar) while it is shown; Escape closes it from anywhere (see
[2026-11-27-toast-escape-closes-from-anywhere.md](2026-11-27-toast-escape-closes-from-anywhere.md)).

## Migration

- Nothing to do to get the new placement. Expect toasts at the top in phone screenshots.
- An app that switches a toast to the top on phones itself (an `anchorOrigin` with
  `vertical: "top"` passed only on small screens) can drop that switch: below `sm` toasts
  are at the top anyway.
- To keep toasts at the bottom on phones, e.g. on a screen whose controls are at the top,
  set `phoneVertical: "bottom"`, app-wide or per toast:

  ```ts
  createTheme({
  	components: { CcToast: { defaultProps: { phoneVertical: "bottom" } } },
  });
  // or per toast
  showToast({ message: "Saved.", phoneVertical: "bottom" });
  ```

- A theme style for phones that relied on the toast being at the bottom (e.g. a
  `styleOverrides.root` with a `bottom` offset below `sm`) needs `phoneVertical: "bottom"`
  to keep applying.

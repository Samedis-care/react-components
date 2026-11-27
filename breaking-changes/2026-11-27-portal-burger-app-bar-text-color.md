# PortalLayout's burger has the AppBar's text color

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Portal/Layout` (PortalLayout's burger button, in mobile view)

## What changed

The burger button on PortalLayout's AppBar is an IconButton with `color="inherit"`, as in
MUI's AppBar examples: its icon has the AppBar's text color, `primary.contrastText` for
MUI's AppBar in `primary`, or the color a theme gives the AppBar.

Before, the icon had IconButton's own color: `action.active` (54% black in MUI's light
palette, white in the dark one), or the color a theme sets in
`MuiIconButton.defaultProps.color`. That theme default no longer reaches the burger.

## Why

The burger is the only control that opens the menu in mobile view, and WCAG 1.4.11 asks for
3:1 for a control's icon against its background. With MUI's light palette the 54% black icon
had 2.65:1 on `primary.main`; in white it has 4.6:1. With a theme whose IconButtons default
to `color: "primary"`, the icon had the AppBar's own background color (1:1). With MUI's dark
palette and an AppBar in `primary.main` (`enableColorOnDark`), it was white on light blue
(1.75:1).

## Migration

Nothing to do. Expect a white burger instead of a dark gray one in screenshots of MUI's
light palette.

- The burger follows the AppBar's text color: to change it, change the AppBar's `color`
  (e.g. in the theme's `MuiAppBar` `styleOverrides.root`), which also colors the header's
  text.
- A rule of an app's own that gave the burger the AppBar's text color, to make up for the
  old color, is no longer needed and can be removed.

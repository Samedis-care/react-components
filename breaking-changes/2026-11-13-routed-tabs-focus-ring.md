# RoutedTabs draws a focus ring and turns the focus ripple off

- **Date:** 2026-11-13
- **Kind:** behavior, theme
- **Scope:** `non-standalone/RoutedTabs`

## What changed

- A keyboard-focused tab (the `Mui-focusVisible` state) gets a 2px solid outline, 4px
  inside the tab's edge, where MUI draws its own ring on a Tab when the theme sets
  `focusVisible`. It is `palette.primary.main`. With `textColor="inherit"`, the setting for
  tabs on a colored bar such as an AppBar (identity-management-frontend sets it as the
  `MuiTabs` default), the ring takes the tab's text color instead, and the focused tab is
  fully opaque, as MUI does for its own ring.
- Each Tab gets `disableFocusRipple` unless it sets the prop itself, so MUI's pulsating
  focus ripple no longer covers the label. A click still shows the ripple.
- RoutedTabs is a styled component named `CcRoutedTabs` with a `root` slot (the Tabs root).

When the theme sets MUI's `focusVisible` option, MUI's ring is the one shown and CC adds
none. The focus ripple stays off there too.

A mouse click shows no ring.

## Why

The pulsating ripple, about 1.5:1 against the tab, was the only sign of keyboard focus,
and forced colors showed nothing at all (WCAG 2.4.7, 1.4.11). Painted over the label, it
also lowered the label's contrast below 4.5:1 on the selected tab (1.4.3). On an AppBar in
the primary color, a ring in the primary color would not show, so tabs that inherit the
bar's text color use that color for the ring.

## Migration

Nothing to do, but expect the ring in screenshots of keyboard-focused tabs in samedis-ui
and identity-management-frontend. To restyle it, override
`& .MuiTab-root.Mui-focusVisible` in `theme.components.CcRoutedTabs.styleOverrides.root`,
or set MUI's `focusVisible` theme option. To keep MUI's focus ripple on a tab, pass
`disableFocusRipple={false}` to that Tab.

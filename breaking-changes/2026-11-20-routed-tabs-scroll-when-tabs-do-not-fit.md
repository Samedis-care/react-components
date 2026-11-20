# RoutedTabs scrolls when its tabs do not fit, with scroll buttons on phones

- **Date:** 2026-11-20
- **Kind:** behavior, theme
- **Scope:** `non-standalone/RoutedTabs`

## What changed

- `variant` defaults to `"scrollable"` (MUI's `Tabs` default is `"standard"`). Where the
  tabs fit, the bar looks as before. Where they do not (a phone, 400% zoom, many or long
  labels), the bar scrolls instead of cutting off the tabs past its end.
- `allowScrollButtonsMobile` defaults to `true`: MUI's scroll buttons (an arrow at each
  end) also appear on phones while the tabs do not fit, and show that more tabs exist.
  With `scrollButtons="auto"` (MUI's default) they do not appear while the tabs fit;
  `scrollButtons={false}` turns them off at every width.
- `variant="fullWidth"` on a horizontal bar: the tabs still share the bar's width equally,
  but no tab gets narrower than its longest word. When they do not fit, the bar scrolls
  like the `"scrollable"` one, with scroll buttons, instead of squeezing every tab to 90px
  and cutting off labels and tabs. MUI renders it as a scrollable bar: the root has the
  class `CcRoutedTabs-fullWidth`, the scroller `MuiTabs-scrollableX`, and the tabs no
  longer have `MuiTab-fullWidth`. A vertical `fullWidth` bar is MUI's, as before.
- `centered` centers the tabs only while they fit, and works with every variant,
  including the default `"scrollable"`. When the tabs do not fit, they start at the bar's
  start edge. The root has the class `CcRoutedTabs-centered`; the tab list no longer has
  `MuiTabs-centered`.
- A tab that gets focus (by keyboard or a click) is scrolled fully into view. Before, the
  browser scrolled only until part of it showed, so the bar's edge or a scroll button
  could cut it off.
- New theme slot `theme.components.CcRoutedTabs.defaultProps`. RoutedTabs passes
  `variant`, `centered` and `allowScrollButtonsMobile` to MUI's `Tabs` itself, so values
  for those three under `MuiTabs.defaultProps` no longer reach a RoutedTabs. The other
  `MuiTabs` defaults (`textColor`, `indicatorColor`, `scrollButtons`, …) still do.

## Why

At 320 CSS px (a phone, or 400% zoom; WCAG 1.4.10 Reflow) MUI's `standard` and
`fullWidth` bars cut off the tabs that do not fit, and touch users could not scroll them
into view: the bar's scroller has `overflow-x: hidden`, and nothing showed that more tabs
existed. A centered bar overflowed on both sides, and the part past the start edge,
usually the default tab, could not be scrolled to at all. A scrollable bar with scroll
buttons is MUI's own pattern for a tab bar that can be wider than the screen.

## Migration

- **samedis-ui:** nothing to do. `TenantContractForm` (`variant="scrollable"`) now shows
  scroll buttons on phones while its tabs do not fit. `FacilityDataForm`
  (`variant="fullWidth"`) looks the same on wide screens; on a phone its bar scrolls, with
  scroll buttons, and every label is readable.
- **identity-management-frontend:** nothing to do. Its theme sets `MuiTabs.defaultProps`
  `variant: "scrollable"` and `scrollButtons: false`; RoutedTabs' default variant is the
  same, and `scrollButtons: false` still reaches it, so its bars do not change.
- **Required for an app that sets `variant` or `centered` under `MuiTabs.defaultProps` and
  wants them for its routed tabs:** set them under `CcRoutedTabs.defaultProps` as well,
  otherwise its RoutedTabs use the defaults above:

  ```ts
  createTheme({
  	components: {
  		MuiTabs: { defaultProps: { variant: "fullWidth" } },
  		CcRoutedTabs: { defaultProps: { variant: "fullWidth" } },
  	},
  });
  ```

- For MUI's fixed bar, which does not scroll and cuts off the tabs that do not fit, pass
  `variant="standard"`.
- A theme or `sx` that styles `.MuiTabs-centered` or `.MuiTab-fullWidth` inside a
  RoutedTabs: style `&.CcRoutedTabs-centered .MuiTabs-list` or
  `&.CcRoutedTabs-fullWidth .MuiTab-root` instead, e.g. in
  `theme.components.CcRoutedTabs.styleOverrides.root`.

# Portal menu entries and buttons show a keyboard focus ring

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Portal` (`MaterialMenuItem`, `JumboReactLightMenuItem`, `JumboReactDarkMenuItem`, PortalLayout's burger, CollapsibleMenu's collapse button)

## What changed

While a menu entry, the burger button or the collapse button has keyboard focus (MUI's
`Mui-focusVisible`), it shows a 2px outline just inside its edges:

- the entries of all three renderers and the collapse button: in `primary.main`;
- the active Jumbo entry, which has a `primary.main` background: in the contrast text
  color of `primary.main`;
- the burger on the AppBar: in `primary.contrastText`, the AppBar's text color.

Mouse and touch focus show no ring, as before.

## Why

Keyboard focus used to be shown only by MUI's faint focus tint (about 1.13:1 against an
unfocused entry) or ripple. The active Jumbo entry did not change at all, and in
forced-colors mode (Windows high contrast) nothing showed which entry had focus. Outlines
are kept in forced-colors mode.

## Migration

Nothing to do. Expect the outline in screenshots of focused menu entries (IMF's admin
menu). A theme can restyle it through the renderers' and CollapsibleMenu's
`styleOverrides` with a `"&.Mui-focusVisible"` rule.

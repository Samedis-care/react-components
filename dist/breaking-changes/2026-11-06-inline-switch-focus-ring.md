# InlineSwitch draws a focus ring

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`, and so the switch of the selectors (`displaySwitch`)

## What changed

- A keyboard-focused switch (MUI's `Mui-focusVisible`) gets a 2px
  `theme.palette.primary.main` outline around its track, 2px outside it. A theme that sets
  MUI's `focusVisible` gets its own ring there instead, which used to be cut off and now shows
  in full.
- MUI's pulsating focus ripple under the thumb is off. A click still shows the ripple.
- The switch root (the `switch` slot, `.MuiSwitch-root`) no longer clips its content. The
  switch's hidden input now covers exactly the track, so the area that toggles on click is the
  track, as before.

A mouse click shows no ring.

Neither samedis-ui nor identity-management-frontend shows a selector switch today
(`displaySwitch`, `switchFilterName`).

## Why

Keyboard focus was shown only by a faint ripple under the thumb (about 1.3:1 against the
unfocused switch), so the focused switch was hard to find (WCAG 2.4.7, 1.4.11). The ripple
pulsed for as long as the switch had focus, also with `prefers-reduced-motion`.

## Migration

Nothing to do. Expect the ring in screenshots of a keyboard-focused switch. A theme that
wants another look styles `.MuiSwitch-switchBase.Mui-focusVisible + .MuiSwitch-track` in
`theme.components.CcInlineSwitch.styleOverrides.switch`, or sets MUI's `focusVisible`. A
theme whose `styleOverrides.switch` draws parts beyond the track now shows them unclipped.

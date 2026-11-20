# An open InfoBox keeps its 48px header and has no margin; every InfoBox is rounded

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/InfoBox`

## What changed

- The header stays 48px high when the box is open. It used to grow to 60px.
- An open box has no margin of its own. It used to get 16px above and below whenever it
  had siblings of the same element type (a `div`), except above the first and below the
  last of them.
- Every InfoBox is rounded on all four corners (`theme.shape.borderRadius`), whatever its
  siblings. It used to be rounded at the top only as the first `div` among its siblings,
  and at the bottom only as the last, so a box between other elements had square corners
  on its colored header, and of several stacked boxes only the ends were rounded.

## Why

Opening a box moved its header and everything below it, and a box that started open sat
16px lower than a closed one next to it. InfoBox is built on MUI's Accordion, which styles
accordions as a group: it spaces open ones apart and rounds only the group's outer corners.
An InfoBox is a notice on its own, so its size and corners no longer depend on its state
or its siblings, and the space around it is the layout's.

## Migration

- Required where an open InfoBox sits directly next to other elements and relies on the
  16px margin for spacing: add the spacing in the layout, e.g.
  `<Stack spacing={2}>…<InfoBox …/>…</Stack>` or a `gap` on the flex container. Boxes
  stacked directly now touch, open or closed.
- A theme that rounds the box itself
  (`components.CcInfoBox.styleOverrides.root` with `"&.MuiAccordion-rounded": { borderRadius }`)
  can drop that override; it still applies when kept.
- Expect the change in screenshots: open boxes have a 12px shorter header, content below an
  open box between siblings moves up by 16px, and corners are rounded where they were
  square. In identity-management-frontend every InfoBox is open, so all of their headers
  get shorter.

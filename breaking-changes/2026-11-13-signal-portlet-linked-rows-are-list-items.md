# A linked SignalPortlet row is a list item, with its button inside

- **Date:** 2026-11-13
- **Kind:** behavior, theme
- **Scope:** `standalone/SignalPortlet`

## What changed

Every row of a SignalPortlet is an `<li>`. A row with `link` used to be its ListItemButton
alone, a `div` with role button directly inside the `<ul>`. It is now a ListItem without
padding (MUI's `disablePadding`) with the ListItemButton inside, MUI's pattern for a list of
buttons. With the default theme the card looks the same: the button fills the row and
keeps its padding, hover and focus background.

For a row with link, this moves class names and theme styles:

| What styles it                                                                            | Before      | After                  |
| ----------------------------------------------------------------------------------------- | ----------- | ---------------------- |
| The item's `className`, SignalPortlet's `classes.item`, theme slot `CcSignalPortlet.item` | the button  | the `<li>`             |
| The item's `classes.root`, theme slot `CcSignalPortletItem.root`                          | not applied | the `<li>`             |
| The item's `classes.rootBtn`, theme slot `CcSignalPortletItem.rootBtn`                    | the button  | the button (unchanged) |

Rows without link render as before.

## Why

A `div` directly inside a `<ul>` is invalid, and screen readers count only the real list
items: a card whose rows all have links was announced as a list of 0 items, and list
navigation skipped the linked rows.

## Migration

Nothing to do for SCF and IMF: their themes don't style these slots, and nothing changes
on screen.

Required for a theme or `classes` that styles linked rows through `item`, `className` or
`root`:

- Padding, hover or focus styles meant for a linked row's button belong in `rootBtn` now.
  Set through `item` or `className`, they style the `<li>` around the button.
- A `root` rule now also styles the `<li>` of linked rows. Padding set there adds to the
  button's own padding. To keep such a rule to rows without link, scope it to
  `&.MuiListItem-padding`, the class MUI gives a ListItem only while it has its own
  padding:

  ```ts
  CcSignalPortletItem: {
  	styleOverrides: {
  		root: { "&.MuiListItem-padding": { paddingLeft: 8 } },
  		rootBtn: { paddingLeft: 8 },
  	},
  },
  ```

- A test that takes the `<ul>`'s children as the rows gets the `<li>` for a linked row; its
  button is that `<li>`'s child.

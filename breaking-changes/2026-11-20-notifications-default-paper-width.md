# Notifications: the popover is 400px wide by default

- **Date:** 2026-11-20
- **Kind:** behavior, theme
- **Scope:** `standalone/Notifications`

## What changed

The popover's paper has a default width of `min(400px, 100% - 32px)`: 400px, and on a
window narrower than 432px the window's width less 16px on each side. It used to have no
width.

A width set through `PopoverProps` still replaces the default, e.g.
`PopoverProps={{ slotProps: { paper: { sx: { width: 600 } } } }}`, and so does one set for
the whole app in the theme's `CcNotifications.defaultProps.PopoverProps`.
`PopoverProps.slots` is merged into the component's own slots: a `slots.paper` of your own
replaces the paper together with its default width, other slots keep it.

Two theme settings for every MUI popover no longer reach this one: a paper `width` in
`MuiPopover.styleOverrides.paper` (the default width outranks it), and a paper component in
`MuiPopover.defaultProps.slots.paper` (this popover always uses its own paper unless
`PopoverProps.slots.paper` names one). The theme's other `MuiPopover` paper settings still
apply: the other properties of `styleOverrides.paper`, and `defaultProps.slotProps.paper`
(e.g. an elevation or a border).

## Why

Without a width, the paper took the space between its left edge and the window edge. MUI
repositions a popover after every render while it is open, and each time that edge moved
16px further left. The popover opened narrow when the rows arrived after opening (every row
a narrow, tall block), touched the window edge, and grew 16px with every poll or other
re-render while it stayed open.

## Migration

Nothing to do for apps that set a paper width through `PopoverProps` (SCF does, with
`slotProps.paper.sx`): their width applies as before. Apps without one: expect a 400px wide
popover, also in screenshots. To use another width, set it through `PopoverProps` as above
and keep it fixed: a content-sized paper (`width: "auto"`) grows with every re-render again.

**Required for apps that set the paper width of all popovers in the theme**
(`MuiPopover.styleOverrides.paper.width`) and want it for Notifications too: without a
change, the notification popover is 400px wide instead. Set the width through
`PopoverProps`, or in the theme's `CcNotifications.defaultProps.PopoverProps`, which
applies to every Notifications that passes no `PopoverProps` of its own:

```ts
createTheme({
	components: {
		// as before, for every other popover
		MuiPopover: { styleOverrides: { paper: { width: 320 } } },
		// added: the same width for the notification popover
		CcNotifications: {
			defaultProps: {
				PopoverProps: { slotProps: { paper: { sx: { width: 320 } } } },
			},
		},
	},
});
```

**Required for apps that set a paper component in `MuiPopover.defaultProps.slots.paper`**
and want it for Notifications too: pass it as `PopoverProps.slots.paper` (or in
`CcNotifications.defaultProps.PopoverProps.slots.paper`). It then replaces the default
paper and its width, so give it a fixed width.

# Notifications: the popover is 400px wide by default

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Notifications`

## What changed

The popover's paper has a default width of `min(400px, 100% - 32px)`: 400px, and on a
window narrower than 432px the window's width less 16px on each side. It used to have no
width.

A width set through `PopoverProps` still replaces the default, e.g.
`PopoverProps={{ slotProps: { paper: { sx: { width: 600 } } } }}`. `PopoverProps.slots` is
merged into the component's own slots: a `slots.paper` of your own replaces the paper
together with its default width, other slots keep it.

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

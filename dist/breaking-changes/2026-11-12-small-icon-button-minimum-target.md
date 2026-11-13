# SmallIconButton is at least 24x24

- **Date:** 2026-11-12
- **Kind:** behavior
- **Scope:** `standalone/Small`

## What changed

`SmallIconButton` has a minimum width and height of 24px. With an icon smaller than
16px (for example `<CloseIcon sx={{ fontSize: 14 }} />`), the button is 24x24 and the
icon sits centered in it. It used to be the icon plus 4px padding on each side: 22x22
with a 14px icon, 20x20 with a 12px one. With an icon of 16px or more nothing changes
(32x32 with a default icon, 28x28 with `fontSize="small"`).

In the library, the Selector's remove buttons (MultiSelect entries) use it with a
default-size icon and look the same.

## Why

A target smaller than 24x24px is hard to hit with a finger or an unsteady pointer
(WCAG 2.5.8 Target Size (Minimum)). Two such buttons side by side each had less than
24px of clickable space. MUI's own small `IconButton` is 24x24 with a 14px icon too.

## Migration

Nothing to do. Expect a row of `SmallIconButton`s with icons smaller than 16px to take
24px per button instead of the icon's size plus 8px, in screenshots and layouts.

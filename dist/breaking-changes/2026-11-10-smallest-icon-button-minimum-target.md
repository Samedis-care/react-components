# SmallestIconButton is at least 24x24

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `standalone/Small`

## What changed

`SmallestIconButton` has a minimum width and height of 24px. With an icon smaller than
24px (`fontSize="small"`, `size="small"` with `fontSize="inherit"`, or an icon sized
with `sx`), the button is 24x24 and the icon sits centered in it. It used to be the
icon's own box: 20x20 with `fontSize="small"`, 18x18 with `size="small"` and
`fontSize="inherit"`. With a default (24px) or larger icon nothing changes.

In the library, the DataGrid header and footer actions use it. Their own icons are
default-size and look the same; a custom footer action whose icon is smaller than 24px
gets a 24x24 button.

## Why

A target smaller than 24x24px is hard to hit with a finger or an unsteady pointer
(WCAG 2.5.8 Target Size (Minimum)). Two such buttons side by side each had less than
24px of clickable space.

## Migration

Nothing to do. Expect a row of `SmallestIconButton`s with small icons to take 24px per
button instead of the icon's size, in screenshots and layouts.

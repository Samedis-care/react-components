# A disabled ActionButton is filled with `action.disabled`

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`ActionButton`), and so the buttons built on it: the Save and
  Back buttons of `DefaultFormPage` and of the flow engine (`FormPageSaveButton`,
  `BackActionButton`), and the DataGrid's New buttons

## What changed

A disabled ActionButton is filled with the theme's `palette.action.disabled`, with or without
`color`. Its label and icon stay `background.paper`. Before, it was filled with MUI's
`palette.action.disabledBackground`.

| Palette | Fill before                               | Fill now                                  | Label     |
| ------- | ----------------------------------------- | ----------------------------------------- | --------- |
| light   | `rgba(0, 0, 0, 0.12)`, `#e0e0e0` on white | `rgba(0, 0, 0, 0.26)`, `#bdbdbd` on white | white     |
| dark    | `rgba(255, 255, 255, 0.12)`               | `rgba(255, 255, 255, 0.3)`                | `#121212` |

The label has 1.9:1 on the new fill in the light palette (1.3:1 before) and 2.7:1 in the dark
one (1.4:1 before). A theme that gives disabled ActionButtons a fill of its own keeps it.

## Why

ActionButton's rule for the disabled fill had an invalid selector, so browsers dropped it, and
a disabled button showed its white label on MUI's lighter fill, where it could hardly be read.

## Migration

Nothing to do. Disabled ActionButtons are a darker grey in screenshots.

- A theme that sets `&.Mui-disabled` with a `backgroundColor` in
  `components.CcActionButton.styleOverrides.button` keeps its fill: that rule still wins.
- To fill disabled ActionButtons with MUI's lighter grey again, set it there:
  `button: ({ theme }) => ({ "&.Mui-disabled": { backgroundColor: theme.palette.action.disabledBackground } })`.

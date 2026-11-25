# ActionButton darkens a fill until its text reaches 4.5:1

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit/ActionButton` (also the buttons built on it, such as a form page's
  Save button)

## What changed

An ActionButton whose text has less than 4.5:1 on its fill now gets that fill darkened
(behind dark text: lightened) by the smallest amount that reaches 4.5:1, in the same hue,
at rest and on hover. The text color stays the palette's `contrastText`. This applies to the
palette color of `color` (MUI's fill `main`, hover fill `dark`) and, without `color`, to
`palette.primary`. Fills that already reach 4.5:1 stay as they were. A hover fill that would
end up no darker than the resting fill is darkened from the resting fill instead, as MUI
derives `dark` from `main` (`palette.tonalOffset`), so hovering still shows.

| Palette            | Color     | Fill before                                  | Fill now                                   |
| ------------------ | --------- | -------------------------------------------- | ------------------------------------------ |
| MUI default, light | warning   | `#ed6c02` (3.12:1), hover `#e65100` (3.79:1) | `rgb(193, 88, 1)`, hover `rgb(135, 61, 0)` |
| MUI default, light | info      | `#0288d1` (3.86:1)                           | `rgb(1, 124, 192)`, hover unchanged        |
| MUI default, dark  | error     | `#f44336` (3.68:1)                           | `rgb(218, 59, 48)`, hover unchanged        |
| MUI default, dark  | secondary | hover `#ab47bc` (4.04:1)                     | hover `rgb(177, 86, 193)`                  |
| Custom, light      | error     | `rgb(230, 45, 75)` (4.34:1)                  | `rgb(225, 44, 73)`, hover unchanged        |
| Custom, light      | success   | hover `rgb(53, 122, 56)` (3.70:1)            | hover `rgb(75, 137, 78)`                   |
| Custom, dark       | error     | hover `rgb(178, 74, 90)` (3.72:1)            | hover `rgb(187, 95, 109)`                  |
| Custom, light      | warning   | hover `rgb(169, 125, 0)` (4.39:1)            | hover `rgb(170, 128, 5)`                   |

Every other color of these palettes is unchanged, and so is an ActionButton in MUI's default
`primary`. A palette color the button cannot measure (a CSS variable, a keyword) is used as
it is, and so is a fill set through `styleOverrides.button`, `styled()` or `sx`.

## Why

An ActionButton's label is 14px text, which needs a contrast of at least 4.5:1 (WCAG 1.4.3).
MUI picks `contrastText` against 3:1 on `main` and does not check it on `dark`, so buttons
in MUI's default `warning` and `info`, some custom reds and several hover fills were
below that.

## Migration

Nothing to do for buttons recolored with `color`. Expect the changed fills listed above in
screenshots.

**Required for an app that recolors an ActionButton by setting `backgroundColor`** (in
`components.CcActionButton.styleOverrides.button`, `styled(ActionButton)` or `sx`): that
changes only the fill, and the fill is used as it is. The text keeps `palette.primary`'s
`contrastText`, which may be unreadable on it, and the hover turns the button primary (as
before this change). Recolor it with `color` instead, so fill, text and hover all come from
one palette color and stay readable:

```tsx
// before: red at rest, primary on hover, primary's text color
const DangerActionButton = styled(ActionButton)(({ theme }) => ({
	backgroundColor: theme.palette.error.main,
}));

// after: one button
<ActionButton color="error">Delete</ActionButton>;

// after: every ActionButton of the app, in the theme
const theme = createTheme({
	components: { CcActionButton: { defaultProps: { color: "secondary" } } },
});
```

For a color outside the palette, add it to the palette (`palette.augmentColor` and MUI's
`ButtonPropsColorOverrides`), or set `color` and the `&:hover` fill together with
`backgroundColor`.

# VerticalDivider, PopupMenu and the Small components take theme default props

- **Date:** 2026-11-17
- **Kind:** behavior, type, theme
- **Scope:** `standalone/VerticalDivider`, `standalone/PopupMenu`, `standalone/Small`,
  `standalone/MobileScalingFix`

## What changed

- `components.CcVerticalDivider.defaultProps` apply. They were typed but ignored.
  `components.CcVerticalDivider.variants` match the divider's props after them, with
  `flexItem` counting as `false` when it is not set.
- `components.CcPopupMenu` takes `defaultProps` (typed as `PopupMenuProps`). They apply
  before `components.MuiMenu.defaultProps`, and their `elevation` replaces PopupMenu's
  flat default of 0. `components.CcPopupMenu.variants` are typed with `PopupMenuProps`
  (they were typed with `FormDialogProps`), so a variant matching a FormDialog prop no
  longer compiles, and one matching a Menu prop such as `anchorOrigin` does.
- The seven Small components have theme slots of their own, each with `defaultProps`,
  `styleOverrides.root` and `variants`: `CcSmallIconButton`, `CcSmallestIconButton`,
  `CcSmallListItem`, `CcSmallListItemButton`, `CcSelectorSmallListItem`,
  `CcSelectorSmallListItemButton` and `CcSmallListItemIcon`. Their `styleOverrides` win
  over the component's own padding and gutters. A theme's `MuiIconButton`,
  `MuiListItem`, `MuiListItemButton` and `MuiListItemIcon` overrides apply as before;
  the padding, gutters, minimum size and focus outline the Small components set still
  win over them.
- A function in `components.CcVerticalDivider.styleOverrides` or
  `components.CcPopupMenu.styleOverrides` is typed as receiving `{ theme }`. Reading
  `ownerState` in it is a type error (neither component passes one, so it threw).
- When the theme sets MUI's `focusVisible` ring, the keyboard-focused PopupMenu item,
  `SmallIconButton` and `SmallestIconButton` show that ring, as MUI's own menu items and
  icon buttons do. They used to draw their own 2px `palette.primary.main` outline over
  it. Without `focusVisible` in the theme nothing changes.
- `VerticalDividerProps` is the divider's props type: it takes the `div` attributes and
  `sx`, which used to be a type error. It and `VerticalDividerClassKey` are exported
  from the package root. Each Small component has a `<Name>Props` and a
  `<Name>ClassKey` type, also exported from the package root.
- Each component lives in its own file, and each folder has an `index.ts`. The deep
  paths `components-care/dist/standalone/Small/IconButton` and
  `components-care/dist/standalone/Small/List` are gone.
  `components-care/dist/standalone/MobileScalingFix` resolves now; the old path
  `…/MobileScalingFix/MobileScalingFix` still works.

## Why

MUI components resolve their props through the theme (`defaultProps`), style their root
with `styleOverrides` and `variants` matched against their own props, and use the
theme's focus ring. These components did not, so a theme could not set their defaults,
could not change the Small components' padding at all, and could not type a PopupMenu
variant on its own props.

## Migration

Required for a theme whose `components.CcVerticalDivider.styleOverrides` or
`components.CcPopupMenu.styleOverrides` has a function that reads `ownerState`: it no
longer compiles. Match the prop with a variant instead:

```ts
createTheme({
	components: {
		CcVerticalDivider: {
			// was: styleOverrides: { root: ({ ownerState }) => ownerState.flexItem ? { margin: 0 } : {} }
			variants: [{ props: { flexItem: true }, style: { margin: 0 } }],
		},
	},
});
```

Required for a theme whose `components.CcPopupMenu.variants` match props of
`FormDialogProps`: match `PopupMenuProps` (MUI's `MenuProps`) instead.

Required for code that imports `components-care/dist/standalone/Small/IconButton` or
`…/Small/List`: import the components from `components-care` instead.

A theme that sets `components.CcVerticalDivider.defaultProps`: they take effect now, so
check the dividers. A theme that sets MUI's `focusVisible`: PopupMenu items and the
Small icon buttons show its ring now. Nothing to do for a theme without these entries.

# The active Portal menu entry is marked by more than its color

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Portal` (`MaterialMenuItem`, `JumboReactLightMenuItem`, `JumboReactDarkMenuItem`)

## What changed

`MaterialMenuItem`: the active entry (MUI's `Mui-selected`) keeps MUI's selected tint and
now also has

- a 4px bar in `primary.main` on its left edge. The bar is the entry's `::before`, a border
  drawn over the entry, so the entry's icon and title stay where they are;
- a medium-weight title (`typography.fontWeightMedium`, 500 by default) instead of the
  regular weight.

`JumboReactLightMenuItem` and `JumboReactDarkMenuItem`: in forced-colors mode (e.g. Windows
high contrast), the active entry's dot is drawn in the text color (`CanvasText`). Outside
forced colors both look as before.

## Why

The active `MaterialMenuItem` differed from the other entries only by MUI's 8% primary tint,
about 1.1:1 against the menu, which low-vision users cannot make out. Forced-colors mode
replaces background colors: it removed that tint, and on a Jumbo entry the primary
background and the dot, which it painted in the background color. In all three renderers
the current page then looked like any other entry. A bar, a font weight and a system color
are kept in forced-colors mode, and the bar has the contrast of `primary.main` against the
menu (4.1:1 with MUI's default palette, over the tint).

## Migration

Required for any app whose theme draws its own mark on the active `MaterialMenuItem`, for
example a left border in `components.CcMenuItemMaterial.styleOverrides.root`: remove that
mark, otherwise the active entry shows two bars. A border on every entry that is
transparent except on the active one also shows on every entry in forced-colors mode,
which draws transparent borders in the text color.

To restyle the library's mark, override it in the theme, and keep a mark that is not a
color only:

```ts
components: {
	CcMenuItemMaterial: {
		styleOverrides: {
			root: ({ theme }) => ({
				// the bar
				"&.Mui-selected::before": {
					borderLeftColor: theme.palette.secondary.main,
				},
				// the title
				"&.Mui-selected .MuiListItemText-primary": { fontWeight: 700 },
			}),
		},
	},
},
```

With a custom palette, check that `primary.main` (or the bar's color) reaches 3:1 against
the menu's background. Otherwise nothing to do; expect the bar and the heavier title in
screenshots of the active entry.

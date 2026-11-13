# GroupBox's small legend is a state class, not an ownerState

- **Date:** 2026-11-13
- **Kind:** type, theme
- **Scope:** `standalone/GroupBox`, and what renders a GroupBox as its frame: FileUpload,
  ImageSelector, MultiImage, HowToBox, the files and image renderers

## What changed

- No GroupBox slot receives an `ownerState` any more. The legend used to get
  `ownerState.smallLabel`; the root never got one.
- While `smallLabel` is set, the legend has the class `CcGroupBox-smallLabel`.
- `GroupBoxClassKey` has the new key `smallLabel`: `classes.smallLabel` is added to the
  legend while `smallLabel` is set, and `components.CcGroupBox.styleOverrides.smallLabel`
  styles that legend, after `styleOverrides.legend`.
- A function in `components.CcGroupBox.styleOverrides` is typed as receiving `{ theme }`.
  Reading `ownerState` in it is a type error.
- `GroupBoxLegendOwnerState` is no longer exported.

The legends look the same as before: a small legend is 0.75em of the inherited font size,
and a font size from the theme (`styleOverrides.legend` or `styleOverrides.smallLabel`),
from `classes.smallLabel` or from app CSS replaces it.

## Why

MUI calls every function in a component's `styleOverrides` for every slot of the
component. A theme function that read `ownerState.smallLabel` for the legend therefore
threw while the root was styled, and every GroupBox (and every FileUpload, ImageSelector,
MultiImage and HowToBox) crashed. The theme reaches the small state through the class and
the `smallLabel` key instead, which needs no per-slot state.

## Migration

Required for a theme whose `components.CcGroupBox.styleOverrides` has a function that
reads `ownerState`: it no longer compiles, and it throws on the first GroupBox. Style the
small legend through the `smallLabel` key or the class instead:

```ts
createTheme({
	components: {
		CcGroupBox: {
			styleOverrides: {
				// was: legend: ({ ownerState }) => ({ color: ownerState.smallLabel ? "red" : "blue" })
				legend: { color: "blue" },
				smallLabel: { color: "red" },
				// or inside legend: "&.CcGroupBox-smallLabel": { color: "red" }
			},
		},
	},
});
```

Required for code that imports `GroupBoxLegendOwnerState`: remove the import, there is no
replacement.

A theme with plain style objects for `root` and `legend` needs nothing. A theme that sets
the legend's font size gives small legends that size too, as before; add
`styleOverrides.smallLabel` with its own `fontSize` to size them separately.

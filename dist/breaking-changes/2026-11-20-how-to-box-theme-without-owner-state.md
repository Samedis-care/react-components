# HowToBox's theme gets no ownerState, and its variants match titleLabel and labels

- **Date:** 2026-11-20
- **Kind:** type, behavior, theme
- **Scope:** `standalone/HowToBox`, `HowToBoxTranslate`, and the CRUD import's first step,
  which renders a HowToBox

## What changed

- A function in `components.CcHowToBox.styleOverrides` is typed as receiving `{ theme }`.
  Reading `ownerState` in it is a type error. No HowToBox slot receives an `ownerState`; none
  ever did.
- `components.CcHowToBox.variants` match HowToBox's `titleLabel` and `labels`, after the
  theme's `defaultProps`. A variant styles the `<fieldset>` frame, and reaches the list and
  its entries through a nested selector such as `"& li"`. From `HowToBoxTranslate`, the
  variants see the translated title and entries.
- A variant's `props` are typed with `titleLabel` and `labels` only, and a `props` function
  gets them directly: reading `ownerState` in it is a type error.

So, for a theme that sets `components.CcHowToBox`:

- A variant keyed on `titleLabel` or `labels` (`{ props: { titleLabel: "Import" } }`)
  applies now. It never did.
- A variant whose `props` function tests `titleLabel` or `labels`
  (`props: ({ titleLabel }) => titleLabel != null`) matches only the boxes it describes. It
  used to see neither, as if both were `undefined`.
- A function in `styleOverrides`, or a variant's `props` function, that reads `ownerState`
  no longer compiles. It threw on every HowToBox.
- A variant keyed on another prop (`className`, `classes`) no longer compiles.

Nothing changes for a theme without `components.CcHowToBox`, or one with plain style objects
and functions of `theme` only.

## Why

MUI calls every function in a component's `styleOverrides` for every slot of the
component, and matches the component's `variants` against the props its root slot
receives. No HowToBox slot received an `ownerState` or HowToBox's props, so a theme function
that read `ownerState` threw and every HowToBox crashed, and the variants the theme types
offered never applied. The root receives `titleLabel` and `labels` now (they do not reach
the DOM), and the theme types offer only what the slots receive.

## Migration

Required for a theme whose `components.CcHowToBox.styleOverrides` has a function that reads
`ownerState`, or whose `variants` have a `props` function that reads it: it no longer
compiles, and it throws on the first HowToBox. Match the props with a variant instead, and
reach the list or its entries through a nested selector, which wins over
`styleOverrides.ul` and `styleOverrides.li`:

```ts
createTheme({
	components: {
		CcHowToBox: {
			// was: styleOverrides: { li: ({ ownerState }) => ({ color: ownerState.titleLabel ? "red" : "blue" }) }
			styleOverrides: { li: { color: "blue" } },
			variants: [
				{
					props: ({ titleLabel }) => titleLabel != null,
					style: { "& li": { color: "red" } },
				},
			],
		},
	},
});
```

A theme that sets `components.CcHowToBox.variants` keyed on `titleLabel` or `labels`, or
with a `props` function that reads either: check the boxes, the variants take effect now.

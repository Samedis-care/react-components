# A theme styles InlineSwitch's states through classes, not ownerState or variants

- **Date:** 2026-11-17
- **Kind:** type, theme
- **Scope:** `standalone/InlineSwitch`, and so every selector (BaseSelector and the
  selectors built on it, MultiSelectWithoutGroup), which renders one around its field

## What changed

- The root of InlineSwitch has state classes: `CcInlineSwitch-checked` while `value` is
  true, `CcInlineSwitch-visible` while `visible` is true and `CcInlineSwitch-disabled` while
  `disabled` is true. The switch wrapper keeps its `CcInlineSwitch-disabled` class.
- A function in `components.CcInlineSwitch.styleOverrides` is typed as receiving
  `{ theme }`. Reading `ownerState` in it is a type error.
- `components.CcInlineSwitch.variants` is no longer part of the theme types.

Nothing looks different: the classes come with no styles of their own.

## Why

No InlineSwitch slot receives an `ownerState`, and MUI calls every function in a
component's `styleOverrides` for every slot of the component. A theme function that read
`ownerState.value` therefore threw on the first render, and since every selector renders an
InlineSwitch, it crashed every selector. Theme `variants` keyed on `value`, `visible` or
`disabled` never matched, because MUI matches them against the root's own props, which
hold none of InlineSwitch's props. The state classes give a theme the props without
per-slot state.

## Migration

Required for a theme whose `components.CcInlineSwitch.styleOverrides` has a function that
reads `ownerState`, or that sets `components.CcInlineSwitch.variants`: it no longer
compiles. The `ownerState` function threw on the first selector, and a variant keyed on a
prop never applied. Style the states through the root's classes instead:

```ts
createTheme({
	components: {
		CcInlineSwitch: {
			styleOverrides: {
				// was: root: ({ ownerState }) => ({ color: ownerState.value ? "red" : "blue" })
				// was: variants: [{ props: { visible: false }, style: { marginTop: 0 } }]
				root: {
					color: "blue",
					"&.CcInlineSwitch-checked": { color: "red" },
					"&:not(.CcInlineSwitch-visible)": { marginTop: 0 },
				},
			},
		},
	},
});
```

A variant with empty `props` applied to every InlineSwitch: move its style into
`styleOverrides.root`. A theme with plain style objects, or functions that read only
`theme`, needs nothing.

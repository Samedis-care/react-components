# UIKit theme types match what the slots get, and button variants apply

- **Date:** 2026-11-21
- **Kind:** behavior, type, theme
- **Scope:** `theme-def`: `components.CcActionButton`, `CcSubActionButton`, `CcFormButtons`,
  `CcCenteredTypography`, `CcCheckbox` and `CcComponentWithLabel`

## What changed

- `CcActionButton.variants` and `CcSubActionButton.variants` apply to the button. They
  never did.
- A variant's `props` object of these two matches each key against the button's props and
  against the flags in the slot's `ownerState`:
  - ActionButton: every prop but `icon`, `small` and `children` (`fullWidth` as applied,
    by default `true` unless `small`), and `small` as a boolean. `color` matches the color
    (`{ color: "error" }`), or `true` for any color.
  - SubActionButton: every prop but `icon`, `small`, `disableDivider` and `children`, and
    `small` and `disableDivider` as booleans (`disableDivider="true"` matches `true`).

  A `props` function gets the button's props with the flags in place of the props of the
  same name, so ActionButton's `color` is a boolean there. Match a color with a `props`
  object.
- A function in `styleOverrides` of these two gets an `ownerState` typed as what it is:
  `ActionButtonOwnerState` (`small`, `color`) and `SubActionButtonOwnerState` (`small`,
  `disableDivider`), all booleans. It was typed as the component's props, so
  `ownerState.disabled` compiled and was always `undefined`, and `ownerState.color` was
  typed as a color while it is whether a color is set.
- A function in `styleOverrides` of `CcFormButtons`, `CcCenteredTypography`, `CcCheckbox`
  and `CcComponentWithLabel` is typed as receiving `{ theme }`. Reading `ownerState` in it
  is a type error. None of their slots receives an `ownerState`; none ever did.
- `CcFormButtons.variants` and `CcCenteredTypography.variants` are no longer in the theme
  types: their root gets none of their props, so no variant could match.
- `CcCheckbox.variants` match Checkbox's props, and `CcComponentWithLabel.variants` match
  ComponentWithLabel's props but `labelText`, `labelVariant`, `labelDisplay` and
  `labelAlign`, as they did. A `props` function gets these props directly: reading
  `ownerState` in it is a type error. A `props` object keyed on one of the four caption
  props is a type error too.

So, for a theme:

- A variant in `CcActionButton` or `CcSubActionButton` applies now.
- A function in `styleOverrides` of `CcFormButtons`, `CcCenteredTypography`, `CcCheckbox` or
  `CcComponentWithLabel`, or in a `props` function of the latter two's variants, that reads
  `ownerState` no longer compiles. It threw on every instance.
- A function in `CcActionButton.styleOverrides` or `CcSubActionButton.styleOverrides` that
  reads another `ownerState` field than the flags above no longer compiles. It read
  `undefined`.
- `CcFormButtons.variants` and `CcCenteredTypography.variants` no longer compile. They never
  applied.

Nothing changes for a theme with plain style objects, functions that read only `theme`, or
functions that read `ownerState.small` and `ownerState.color` of `CcActionButton` (as the
apps' themes do).

## Why

MUI calls every function in a component's `styleOverrides` while styling each of its slots,
with that slot's props, and applies a component's `variants` to its `root` slot only. The
four components above pass no `ownerState` to their slots, so a theme function that read
one threw and every instance crashed. ActionButton's and SubActionButton's only slot is
called `button`, so their variants were dropped. The button now takes the variants, and
the theme types offer what each slot receives.

## Migration

Required for a theme whose `styleOverrides` of `CcFormButtons`, `CcCenteredTypography`,
`CcCheckbox` or `CcComponentWithLabel` has a function that reads `ownerState`: it no longer
compiles, and it threw on the first render. Read only `theme` in the function. Style a
Checkbox or ComponentWithLabel by its props with a variant:

```ts
createTheme({
	components: {
		CcCheckbox: {
			// was: styleOverrides: { root: ({ ownerState }) => ({ opacity: ownerState.disabled ? 0.5 : 1 }) }
			variants: [{ props: { disabled: true }, style: { opacity: 0.5 } }],
		},
	},
});
```

Required for a theme with `CcFormButtons.variants` or `CcCenteredTypography.variants`:
remove them, they never applied. Style the text of one Typography variant in
CenteredTypography through a nested selector:
`styleOverrides: { root: { "& .MuiTypography-h6": { … } } }`.

Required for a theme whose function in `CcActionButton.styleOverrides` or
`CcSubActionButton.styleOverrides` reads another `ownerState` field than `small`, `color`
and `disableDivider`: it no longer compiles. Use the button's state classes instead
(`"&.Mui-disabled"`, `"&.MuiButton-colorError"`).

A theme that sets `CcActionButton.variants` or `CcSubActionButton.variants`: check the
buttons, the variants take effect now.

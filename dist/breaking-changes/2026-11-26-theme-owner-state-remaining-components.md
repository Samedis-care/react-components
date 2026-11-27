# The remaining CC theme entries offer the ownerState and variants their slots receive

- **Date:** 2026-11-26
- **Kind:** type, theme
- **Scope:** `theme-def`: `components.<CcName>.styleOverrides` and `variants` of `CcSignalPortlet`,
  `CcSignalPortletItem`, `CcMultiLanguageInput`, `CcBaseSelector`, `CcMultiSelectEntry`,
  `CcMultiSelect`, `CcImageBox`, `CcLocalizedKeyboardDatePicker`, `CcPortalLayout`,
  `CcNotifications`, `CcToast` and `CcDayContents`

## What changed

A function in `styleOverrides` of these theme components is typed with the `ownerState` their
slots receive:

- `CcSignalPortlet`, `CcSignalPortletItem`, `CcNotifications`, `CcToast`: none. The function
  gets `{ theme }`, and reading `ownerState` is a type error.
- `CcPortalLayout`, `CcDayContents`: the flags of their only slot, `ownerState` is always set:
  - `CcPortalLayout`: `container` gets `mobile`, `variant` and `drawerWidth`
  - `CcDayContents`: `button` gets `altBorder` and `unClickable`
- `CcMultiLanguageInput`, `CcBaseSelector`, `CcMultiSelectEntry`, `CcMultiSelect`, `CcImageBox`:
  the flags of the slots that get one, and `ownerState` is optional:
  - `CcMultiLanguageInput`: `languageLabel` gets `active`
  - `CcBaseSelector`: `icon` gets `iconSize`
  - `CcMultiSelectEntry`: `selected` gets `unClickable` and `ignore`, `image` gets `iconSize`
  - `CcMultiSelect`: `selector` gets `selected`
  - `CcImageBox`: `root` gets `background`, `dragging` and `clickable`, `image` gets
    `swipeLeft`, `swipeRight` and `imageDots`

  Reading a flag without optional chaining (`ownerState.selected`) is a type error.

Reading one of the component's props from `ownerState` is a type error for all of them.

A variant's `props` is typed with what the root receives:

- `CcToast`: `open`, `anchorOrigin` and `autoHideDuration`, the last two holding their defaults
  (bottom right, the duration of the toast's severity) when the toast does not set them. A
  `props` function gets no `ownerState`.
- `CcImageBox`: the root's flags `background`, `dragging` and `clickable`, which a `props`
  function gets directly and as `ownerState`; none of ImageBox's props.

The following theme components have no `variants` any more:

- Their root receives none of their props: `CcSignalPortlet`, `CcSignalPortletItem`,
  `CcMultiSelectEntry`, `CcMultiSelect`
- They have no root slot: `CcMultiLanguageInput`, `CcBaseSelector`,
  `CcLocalizedKeyboardDatePicker`, `CcPortalLayout`, `CcNotifications`, `CcDayContents`

Nothing changes at runtime.

## Why

MUI calls every function in a component's `styleOverrides` while styling each of its slots,
with that slot's props, and applies the component's `variants` to its root slot only, matched
against the props and the `ownerState` that slot receives. The types offered MUI's defaults: an
`ownerState` that is always set and holds the component's props. These components pass no
`ownerState`, or flags of their own to some slots only. A function that read
`ownerState.<name>` compiled, threw while a slot without one was styled, and crashed every
instance; a prop read from it was `undefined`. A variant keyed on a prop the root does not
receive never matched, and the variants of a component without a root slot never applied. The
types now offer what the slots receive.

## Migration

Required for a theme with a function in `styleOverrides` of one of the components above that
reads `ownerState` where the slots get none, reads a flag without optional chaining where only
some slots get one, or reads one of the component's props from it: it no longer compiles. The
first two threw on the first render, the last read `undefined`. Read only `theme` where the
slots get no `ownerState`, and the flags with optional chaining where some do:

```ts
createTheme({
	components: {
		CcSignalPortlet: {
			styleOverrides: {
				// was: root: ({ ownerState, theme }) => …
				root: ({ theme }) => ({ padding: theme.spacing(1) }),
			},
		},
		CcMultiSelect: {
			styleOverrides: {
				// was: selector: ({ ownerState }) => (ownerState.selected ? … : {})
				selector: ({ ownerState }) =>
					ownerState?.selected ? { marginBottom: 0 } : {},
			},
		},
	},
});
```

Required for a theme with `variants` on one of the components that no longer have them, or with
a variant that names a prop its root does not receive: it no longer compiles. Such a variant
never matched. Style the slot it meant through `styleOverrides` instead, e.g. a selector's
switch, which renders only while `displaySwitch` is set:

```ts
createTheme({
	components: {
		CcBaseSelector: {
			// was: variants: [{ props: { displaySwitch: true }, style: { marginTop: 8 } }]
			styleOverrides: { inlineSwitch: { marginTop: 8 } },
		},
	},
});
```

An ImageBox variant matches the root's flags, e.g.
`{ props: { dragging: true }, style: { borderStyle: "dashed" } }`. A theme without
`styleOverrides` functions or `variants` on these components needs nothing.

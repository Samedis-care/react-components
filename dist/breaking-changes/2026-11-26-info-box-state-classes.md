# A theme styles InfoBox's status through classes, not ownerState or variants

- **Date:** 2026-11-26
- **Kind:** type, theme
- **Scope:** `standalone/InfoBox`

## What changed

- The box (the MUI `Accordion`, slot `root`) and its header (the `AccordionSummary`, slot
  `summary`) have state classes: `CcInfoBox-statusInfo` while `status` is `info` or not
  set, `CcInfoBox-statusWarning`, `CcInfoBox-statusSuccess` or `CcInfoBox-statusError`
  for the other statuses, and `CcInfoBox-alwaysExpanded` while `alwaysExpanded` is `true`.
- A function in `components.CcInfoBox.styleOverrides` is typed as receiving `{ theme }`.
  Reading `ownerState` in it is a type error.
- `components.CcInfoBox.variants` is no longer part of the theme types.
- The `InfoBoxSummaryOwnerState` type is removed from `standalone/InfoBox`.

Nothing looks different: the header takes its status colors from its status class now.

## Why

Only the header received an `ownerState`, and MUI calls every function in a component's
`styleOverrides` for every slot of the component. A theme function that read
`ownerState.status` therefore threw while styling the box itself, and every InfoBox failed
to render. Theme `variants` keyed on `status`, `alwaysExpanded` or `headingVariant` never
matched, because MUI matches them against the root's own props, which are the
Accordion's. The state classes give a theme the status without per-slot state.

## Migration

Required for a theme whose `components.CcInfoBox.styleOverrides` has a function that reads
`ownerState`, or that sets `components.CcInfoBox.variants`: it no longer compiles. The
`ownerState` function threw on the first InfoBox, and a variant keyed on an InfoBox prop
never applied. Style the states through the classes instead:

```ts
createTheme({
	components: {
		CcInfoBox: {
			styleOverrides: {
				// was: summary: ({ ownerState }) => ({ backgroundColor: ownerState.status === "error" ? "darkred" : undefined })
				summary: {
					"&.CcInfoBox-statusError": { backgroundColor: "darkred" },
				},
				// was: variants: [{ props: { status: "warning" }, style: { marginBottom: 16 } }]
				root: {
					"&.CcInfoBox-statusWarning": { marginBottom: 16 },
					"&.CcInfoBox-alwaysExpanded .MuiAccordionDetails-root": { padding: 16 },
				},
			},
		},
	},
});
```

A header background set for a status class also stays while the header has keyboard focus.
A variant with empty `props` applied to every InfoBox: move its style into
`styleOverrides.root`. A variant keyed on `{ expanded: true }` applied to the open box: use
`"&.Mui-expanded"` in `styleOverrides.root`. A theme with plain style objects, or functions
that read only `theme`, needs nothing.

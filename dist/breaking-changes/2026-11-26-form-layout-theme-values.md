# The busy overlay's shown state is a class, and the form layout takes its colors, timing and offsets from the theme

- **Date:** 2026-11-26
- **Kind:** type, behavior, theme
- **Scope:** `standalone/Form/FormLoaderOverlay` and `standalone/Form/FormPageLayout`, and so
  every form page (BasicFormPage, DefaultFormPage, EditOnlyFormPage, FlowEngineFormPage) and
  the language dialog

## What changed

FormLoaderOverlay:

- No slot receives an `ownerState`; the root used to get `ownerState.visible`. While the
  overlay is visible, the root has the class `CcFormLoaderOverlay-visible`. The root receives
  `visible` itself (it does not reach the DOM), so theme `variants` keyed on `visible`
  (`{ props: { visible: true }, style: { … } }`) apply as before.
- A function in `components.CcFormLoaderOverlay.styleOverrides` is typed as receiving
  `{ theme }`: reading `ownerState` in it is a type error. A variant's `props` are typed with
  `visible` only, and a `props` function gets it directly: reading `ownerState` in it is a
  type error, and so is a variant keyed on another prop.
- `FormLoaderOverlayRootOwnerState` is no longer exported.
- The root's own styles of the hidden and the visible state (visibility, opacity, the
  fade-in) give way to the theme's `styleOverrides.root`, to its variants and to app CSS, as
  before.
- The wash is the theme's `palette.background.paper` at 30% opacity, no longer white at 30%.
  Over a white paper it looks the same; in a dark theme it dims the content instead of
  turning it grey.
- The fade-in takes its timing from the theme, like MUI's Fade: it is
  `theme.transitions.create("opacity")` over `transitions.duration.enteringScreen` (225ms with
  MUI's defaults; it was 500ms) with `transitions.easing.easeInOut`, still 1s after every
  show. A theme whose `transitions.create` returns `"none"` shows the wash at once.
- The new prop `classes` adds class names to the slots: `root`, `loaderAnchor`, `loader`,
  `container`, `content` and `status`.

FormPageLayout:

- The footer's distances are the theme's spacing: it floats `theme.spacing(4.5)` above the
  bottom of the visible area, rests `theme.spacing(3.75)` below the body's content, and a
  focused field is scrolled to end `theme.spacing(3.75)` above it. At MUI's default spacing
  of 8px these are the 36px and 30px of before; a theme with another spacing scales them.

Both components are exported from `src/standalone/Form/index.ts` too
(`components-care/dist/standalone/Form`); the package root exports them as before.

## Why

MUI calls every function in a component's `styleOverrides` for every slot of the component,
and only the overlay's root received an `ownerState`, so a theme function that read
`ownerState.visible` threw on the first overlay. A state class needs no per-slot state. The
white wash lightened the content of a dark theme instead of dimming it, and the theme's
transitions and spacing did not reach the fade-in or the footer.

## Migration

Required for a theme whose `components.CcFormLoaderOverlay.styleOverrides` has a function
that reads `ownerState`, or whose `variants` have a `props` function that reads it: it no
longer compiles (the `styleOverrides` function also threw on every overlay). Match `visible`
with a variant, or style the state class in the root's override:

```ts
createTheme({
	components: {
		CcFormLoaderOverlay: {
			// was: styleOverrides: { root: ({ ownerState }) => (ownerState.visible ? { backgroundColor: "rgba(0, 0, 0, 0.2)" } : {}) }
			variants: [
				{
					props: { visible: true },
					style: { backgroundColor: "rgba(0, 0, 0, 0.2)" },
				},
			],
			// or: styleOverrides: { root: { "&.CcFormLoaderOverlay-visible": { backgroundColor: "rgba(0, 0, 0, 0.2)" } } },
		},
	},
});
```

Required for code that imports `FormLoaderOverlayRootOwnerState`: remove the import, there
is no replacement.

A theme with a `spacing` other than MUI's default 8px: the floating Save bar of a form page
built on FormPageLayout sits and rests at the scaled distances; check a long and a short form
page.

Nothing to do otherwise. Expect the busy overlay to fade in faster once its 1s have passed,
and a darker wash in a dark theme.

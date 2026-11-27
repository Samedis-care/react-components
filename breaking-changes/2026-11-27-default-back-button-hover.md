# The default Back button shows a hover

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`BackActionButton`, `DefaultFormPageButtons`, `FlowEngineBackButton`)

## What changed

An enabled `BackActionButton` without a `color` (the Back of `DefaultFormPage` and
`FlowEngineBackButton` included) turns a lighter grey under a pointer, MUI's hover grey for a
contained button without a palette color:

- light palette: `grey.A100` (#f5f5f5) instead of `grey[300]` (#e0e0e0)
- dark palette: `grey[700]` (#616161) instead of `grey[800]` (#424242)

The text keeps the palette's contrast text for the grey (15:1 light, 6.2:1 dark). As in MUI,
the hover applies only on devices with a hover-capable pointer (`@media (hover: hover)`). It
used to look the same under the pointer as at rest, while Save next to it changes on hover. A
`BackActionButton` with a `color` and a disabled one are unchanged.

The hover rule sits inside `&.${BackButtonDefaultColorClass}:not(.Mui-disabled)` with that
rule's specificity, so a theme that restyles the button with that selector in
`components.CcDefaultFormPageButtons.styleOverrides.backButton` replaces the hover grey too.

## Why

Pointer users got no feedback that Back is interactive: its grey outranked ActionButton's own
hover.

## Migration

Nothing to do. Expect the lighter grey in screenshots taken with the pointer on Back.

Any app whose theme restyles the default Back button (a `backgroundColor` for
`&.${BackButtonDefaultColorClass}:not(.Mui-disabled)` in
`components.CcDefaultFormPageButtons.styleOverrides.backButton`) keeps its fill under the
pointer, as before. To give it a hover, add `&:hover` with a hover fill inside that rule:

```ts
import { BackButtonDefaultColorClass } from "components-care";

createTheme({
	components: {
		CcDefaultFormPageButtons: {
			styleOverrides: {
				backButton: ({ theme }) => ({
					[`&.${BackButtonDefaultColorClass}:not(.Mui-disabled)`]: {
						backgroundColor: theme.palette.primary.main,
						color: theme.palette.primary.contrastText,
						"&:hover": { backgroundColor: theme.palette.primary.dark }, // new
					},
				}),
			},
		},
	},
});
```

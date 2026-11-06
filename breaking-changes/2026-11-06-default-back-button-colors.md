# The default Back button is grey with dark text

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`BackActionButton`, `DefaultFormPageButtons`, `FlowEngineBackButton`)

## What changed

A `BackActionButton` without a `color` (the Back of `DefaultFormPage` and
`FlowEngineBackButton` included) takes MUI's grey for a contained button without a palette
color, with the palette's contrast text for it:

- light palette: `grey[300]` (#e0e0e0) with dark text (`rgba(0, 0, 0, 0.87)`)
- dark palette: `grey[800]` (#424242) with white text

It used to be a fixed `#bcbdbf` with ActionButton's `primary.contrastText`, so white text in
the light palette. The rule still sits on `BackButtonDefaultColorClass` and now sets `color`
as well as `background-color`. A `BackActionButton` with a `color` is unchanged.

## Why

White on `#bcbdbf` is 1.88:1, below the 4.5:1 WCAG AA asks for text. The new pairs are
12.75:1 (light) and 10.05:1 (dark).

## Migration

Required for a theme that changes the background of the default Back button (a
`backgroundColor` for `&.${BackButtonDefaultColorClass}` in
`components.CcDefaultFormPageButtons.styleOverrides.backButton`; samedis.care's theme does):
set `color` in the same rule. Without it the text is the dark text of the new grey on your
background, e.g. 3.4:1 on a mid blue.

```ts
import { BackButtonDefaultColorClass } from "components-care";

createTheme({
	components: {
		CcDefaultFormPageButtons: {
			styleOverrides: {
				backButton: ({ theme }) => ({
					[`&.${BackButtonDefaultColorClass}:not(.Mui-disabled)`]: {
						backgroundColor: theme.palette.primary.main,
						color: theme.palette.primary.contrastText, // new: the text for that background
					},
				}),
			},
		},
	},
});
```

Every other app: nothing to do, but expect the lighter grey with dark text in screenshots.

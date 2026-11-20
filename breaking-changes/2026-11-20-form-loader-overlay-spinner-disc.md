# The busy overlay's spinner sits on a disc of its own

- **Date:** 2026-11-20
- **Kind:** behavior, theme
- **Scope:** `standalone/Form/FormLoaderOverlay`, and so the busy overlay of every form page
  (BasicFormPage, DefaultFormPage, EditOnlyFormPage, FlowEngineFormPage), of the language
  dialog and of every other place an app shows the overlay

## What changed

The spinner of `FormLoaderOverlay` is drawn on a disc: the theme's
`palette.background.paper` with a 1px `palette.divider` edge, `theme.spacing(1)` wider than
the spinner all around (56px across with the Loader's default size of 40px and MUI's default
spacing). The disc hides the content under it. The spinner's place and the Loader's size are
unchanged.

## Why

Before, the spinner (primary color) was drawn straight onto the washed content. Where a
primary-colored element lay under it, such as a contained button, a selected tab or a banner,
it had a contrast of about 1.6:1 in a light theme and 1.2:1 in a dark one, and could hardly be
seen. On its disc it keeps the contrast of the primary color against paper, whatever lies
under it (WCAG 1.4.11 Non-text Contrast).

## Migration

- Nothing to do. Expect the disc in screenshots of busy forms.
- A theme restyles or removes the disc through the overlay's `loader` slot, with the same
  selector the library uses:

  ```ts
  components: {
  	CcFormLoaderOverlay: {
  		styleOverrides: {
  			loader: {
  				"& .MuiCircularProgress-root": {
  					backgroundColor: "transparent",
  					boxShadow: "none",
  				},
  			},
  		},
  	},
  },
  ```

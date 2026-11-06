# DialogTitle's heading holds only the title; the close button sits beside it

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog/DialogTitle` (also FullFormDialog and LocaleSelectorDialog, which render it)

## What changed

- DialogTitle's root (slot `root`, `className`, `classes.root`) is a `div`: the title row
  that holds the heading and the close button. It used to be MUI's `DialogTitle`, the `h2`.
- The heading is the `text` slot: MUI's `DialogTitle`, an `h2` that holds only the title.
  It used to be a Typography `h6` inside the `h2`. The `id` prop goes on this `h2`, and
  MUI's `Dialog` is labelled by it, as before.
- The close button is a sibling of the heading's wrapper (`textWrapper`) in the row, not
  inside the heading. The MUI `Grid` inside the title is gone.
- `theme.components.MuiDialogTitle` (`styleOverrides.root`, `defaultProps`, `variants`) and
  CSS for `.MuiDialogTitle-root` now apply to the heading, not to the whole title row.
  `components.CcDialogTitle.styleOverrides.text` still applies to the heading and wins over
  them. The heading's padding stays 0 (the row keeps the 16px 24px of MUI's `DialogTitle`).
- The close button is centered on the title row. With a title line taller than the button
  (a larger title font in the theme) it used to sit a few pixels low, and a title row with
  a close button was up to 1px taller than one without.

## Why

The close button and a second heading were inside the `h2` that names the dialog, so
browsers named the dialog and its heading "Title Close", screen readers listed the title
twice in heading navigation (as `h2` and `h6`), and axe reported `heading-order`. Now the
dialog and its only heading are named by the title text.

## Migration

Required for a theme or stylesheet that styles the CC title row through
`components.MuiDialogTitle` or `.MuiDialogTitle-root` (padding, background, layout, or
the close button inside it): move those styles to `components.CcDialogTitle.styleOverrides.root`
(the row) or `closeButton`. Without it they style only the heading.

```ts
createTheme({
	components: {
		CcDialogTitle: {
			styleOverrides: {
				// was MuiDialogTitle.styleOverrides.root: { backgroundColor: "#eee" }
				root: { backgroundColor: "#eee" },
			},
		},
	},
});
```

Required for styles that select the title text as an `h6` or `.MuiTypography-h6` inside
DialogTitle: select the `text` slot (`components.CcDialogTitle.styleOverrides.text` or
`classes.text`) instead.

A theme that sets typography on `MuiDialogTitle` but not on `CcDialogTitle.text`: CC's
dialog titles take that typography now, like MUI's own dialog titles; they used MUI's `h6`
before. Check that they look as intended. A theme that sets the same typography on both
(as samedis.care's does) looks the same as before. Nothing else to do.

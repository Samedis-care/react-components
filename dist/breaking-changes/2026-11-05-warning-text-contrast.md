# Warning labels and helper texts are darkened to a readable contrast

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`withMuiFieldState`: `TextFieldCC`, `FormLabelCC`,
  `FormHelperTextCC`, `FormControlCC`, the date pickers, `DateInput`, `DateTimeInput` and
  every other control wrapped in it)

## What changed

With `warning`, the label and the helper text of a field are drawn in
`palette.warning.main` darkened (on a dark background: lightened) by the smallest amount
that gives 4.5:1 against both `palette.background.paper` and `palette.background.default`.
They used to be `palette.warning.main` itself. A theme whose `warning.main` already reaches
4.5:1 sees no change. The outline and the underline keep `palette.warning.main`.

- MUI's default theme: `#ed6c02` (3.11:1 on white) becomes `rgb(193, 88, 1)`.
- samedis-ui's palette: `#FFCF00` (1.48:1 on white) becomes `rgb(143, 116, 0)`, a dark
  olive yellow.

A `warning.main` the library cannot parse (a CSS variable) is used as it is.

## Why

Text needs a contrast of at least 4.5:1 (WCAG 1.4.3). The warning orange and yellow did
not reach it, so warning labels and messages were hard to read, and axe's `color-contrast`
rule failed on every field with a warning.

## Migration

Nothing to do. Expect the darker warning text in screenshots. To use another text color
for the whole application, override it in the `CcFieldState` theme slot.

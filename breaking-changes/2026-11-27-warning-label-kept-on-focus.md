# A warning's label keeps its colour while the field is focused or disabled

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`withMuiFieldState`: `TextFieldWithHelp`, `TextFieldCC`,
  `FormLabelCC`, `FormHelperTextCC`, `FormControlCC`, `FormControlFieldsetCC`, the date
  pickers and every other control wrapped in it; the model renderers and selectors that
  pass `warning`)

## What changed

With `warning`, the label and the helper text keep the warning colour in every state of
the field, as they keep the error colour with `error`:

- While the field is focused, the label stays in the warning colour instead of turning to
  the primary colour.
- While the field is disabled, the label and the helper text stay in the warning colour
  instead of turning grey.

Which colour won used to depend on the order in which the page had inserted MUI's and the
library's styles: where a field with a warning was the first of its kind on the page,
MUI's focus and disabled colours won; elsewhere the warning did. The library's rules now
outrank them, as MUI's error colour does.

With both `warning` and `error`, the label and the helper text take MUI's own error
colour, exactly as on a field with `error` alone, instead of the library's copy of
`palette.error.main`. That is the same colour, unless a theme restyles MUI's error label
or helper text, or switches colour schemes through CSS variables.

The outline and the underline are unchanged.

## Why

A warning is about the value, so like an error it has to stay visible while the user
edits the field. Whether it did depended on what the page had rendered before.

## Migration

Nothing to do. Expect the label of a focused field with a warning, and the label and
helper text of a disabled one, in the warning colour in screenshots.

A theme's focused or disabled label colour no longer applies to a field with a warning.
A `CcFieldState` theme override of the warning's text colour has to use the library's own
selectors to outrank it: `& > .MuiFormLabel-root:not(.Mui-error)` and
`& > .MuiFormHelperText-root:not(.Mui-error)` (with `&.` instead of `& > ` where the
wrapped component is the label or the helper text itself).

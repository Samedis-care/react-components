# A date picker with a warning or a dirty value shows both, like a text field

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`withMuiFieldState`): the date and time pickers of
  `standalone/LocalizedDateTimePickers`, and so every date field the model renderers draw
  in a Form, and an outlined text field's warning outline

## What changed

A picker field now draws its warning and its dirty marker as a text field does:

- With `warning`, the outlined variant draws the outline in `palette.warning.main` (and
  in `palette.error.main` while the field is also in error). The standard and filled
  variants draw the underline in the warning colour, 1px at rest and 2px while focused.
  The label and the helper text already took the warning colour.
- With `dirty`, the notch in the outline is widened for the dot after the label, so the
  dot sits in the gap instead of on the border.
- An outlined text field with `warning` keeps the warning colour on its outline while
  hovered and while focused, whatever order MUI's and the library's styles reach the
  page in. These rules now outrank the input's own hover and focus rules, as MUI's error
  rule does; before, where the warning field was the first outlined input on the page,
  the outline turned grey on hover and primary blue on focus.

## Why

The field-state styles only matched MUI's own `MuiOutlinedInput`, `MuiInput` and
`MuiFilledInput`. The pickers draw their own inputs (`MuiPickersOutlinedInput`,
`MuiPickersInput`, `MuiPickersFilledInput`), so a picker with a warning turned its label
orange and left the outline grey, and its dirty dot overlapped the outline.

## Migration

Nothing to do, but expect the orange outline or underline and the wider notch in
screenshots of a picker field with `warning` or `dirty` (in a Form with `showDirtyState`,
every modified date field), and an outlined text field with `warning` keeping its orange
outline on hover and focus where it used to turn grey and blue. To keep a picker's outline
or underline out of it, override the `CcFieldState` theme slot as for a text field.

# DateTimeInput passes on all of slotProps.textField.slotProps

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls/DateTimeInput`, `standalone/UIKit/PickersTextFieldWithHelp`

## What changed

DateTimeInput passes every entry of `slotProps.textField.slotProps` on to its text field,
as DateInput does. It used to keep only `inputLabel` and drop the rest, so these now take
effect:

- `input`: a start adornment, an `aria-label` that names the field group when there is no
  visible label, and `slotProps.sectionContent` for the date and time sections
- `htmlInput`: props of the hidden `<input>`
- `formHelperText`: props of the helper text
- `root`: props of the field's root element

On DateInput and DateTimeInput, a `slotProps.textField.slotProps.inputLabel` given as a
function (the form MUI's `TextField` takes) is called with the text field's props and its
result is used. It used to be dropped. The label stays shrunk unless that result sets
`shrink`.

The always-shrunk label now comes from DateTimeInput's text field alone, as on DateInput.
A DateTimeInput given its own `slots.textField` gets that field's label behavior.

## Why

MUI X v9 takes these props only through `slotProps.textField.slotProps`, so DateTimeInput
left no way to set them: a field switched from DateInput to DateTimeInput lost its start
adornment, and a DateTimeInput without a visible label could not be named.

## Migration

Nothing to do. Neither app passes these to a DateTimeInput or a function-form `inputLabel`
today. A DateTimeInput that passes them now shows them.

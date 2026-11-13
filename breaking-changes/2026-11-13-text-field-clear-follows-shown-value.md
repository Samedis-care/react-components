# The touch Clear button follows what the field shows, and selectors only have their own

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`TextFieldWithHelp` and the inputs built on it),
  `standalone/Selector` (`BaseSelector` and the selectors built on it)

## What changed

On a touch device, `TextFieldWithHelp` shows its Clear button while the field shows a
value: the `value` of a controlled field (also one set through
`slotProps.htmlInput.value`), otherwise what the uncontrolled input holds (its
`defaultValue`, then what was typed). `0` counts as a value, `""` does not.

The button used to follow the last keystroke and changes of `value` instead:

- a field with a `defaultValue` had no button until the user typed;
- a field showing `0` never had one;
- a controlled field whose owner kept its value lost the button once the user deleted
  the text, although the field still showed the value;
- a field its owner kept empty (a letter typed into `IntegerInputField`) got a button
  next to the empty input.

`BaseSelector` passes `disableClearable` to its `TextFieldWithHelp`: the Autocomplete
has a Clear button of its own. On a touch device, a selector used to show a second Clear
button next to the Autocomplete's once the user typed into it.

## Why

The button empties what the user sees, so it has to appear exactly when there is
something to empty, and a field has one Clear button.

## Migration

Nothing to do. On touch devices, expect the Clear button in fields that show a
`defaultValue` or `0`, and no `TextFieldWithHelp` Clear button in selectors.

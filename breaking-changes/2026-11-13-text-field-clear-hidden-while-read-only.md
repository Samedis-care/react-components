# The touch Clear button is hidden while the input is read-only or disabled

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`TextFieldWithHelp`, `PickersTextFieldWithHelp` and the
  inputs built on them: the number inputs, `DateInput`, `DateTimeInput`)

## What changed

On a touch device, `TextFieldWithHelp` no longer shows its Clear button while
`slotProps.input` or `slotProps.htmlInput` sets `readOnly` or `disabled`.
`PickersTextFieldWithHelp` no longer shows it while the picker is `readOnly`: MUI X passes
that to the field as `slotProps.input.readOnly`. Until now only the `disabled` prop of the
field hid the button.

## Why

Tapping Clear in a read-only field emptied it: `onChange` received `""`, and `DateInput`
reported `null`. In an input disabled through `slotProps.htmlInput`, Clear was the field's
only stop in the tab order, cleared nothing, and once it was activated it unmounted and
focus fell to the page. The pickers of MUI X likewise show their own clear button only
while the field is neither read-only nor disabled.

## Migration

Nothing to do. On touch devices, read-only fields and inputs disabled through `slotProps`
no longer show the Clear button. A field that only displays a value can now be read-only
instead of disabled, on touch devices too.

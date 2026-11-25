# The touch Clear button leaves focus in the field

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`TextFieldWithHelp` with `customHandleClear`,
  `PickersTextFieldWithHelp` and the inputs built on it: `DateInput`, and with it the
  UIKit renderers `RendererDate` and `RendererDateNullable`)

## What changed

On a touch device, pressing a date field's Clear button moves focus to the date's first
section once `customHandleClear` has run (`DateInput` passes `() => onChange(null)`).
In a `TextFieldWithHelp` with `customHandleClear`, a `select` included, focus moves to
the input, or to the select, once the handler has run. Without `customHandleClear`,
`TextFieldWithHelp` already moved focus to its input.

## Why

The Clear button goes away with the value it clears. It had focus, so focus fell to the
page: a screen reader lost its place, and where the next Tab went depended on the
browser. MUI X's own clear button moves focus to the date's first section in the same
way.

## Migration

Nothing to do. After a Clear, the field is focused, and on a phone or tablet without a
hardware keyboard the on-screen keyboard opens, as it already did for text fields.
The field's `onBlur` now runs when the user leaves the field after a Clear; before, no
blur followed a Clear, so an owner that keeps the value on blur did not get the cleared
value until the field was entered and left again.

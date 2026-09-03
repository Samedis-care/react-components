# DateTimeInput's required, error, fullWidth and onBlur reach the field

- **Date:** 2026-09-03
- **Kind:** behavior
- **Scope:** `standalone/UIKit`, `standalone/LocalizedDateTimePickers`

## What changed

`DateTimeInput` now passes `required`, `error`, `fullWidth` and `onBlur` to
`LocalizedDateTimePicker` as props. All four were accepted and then dropped, so a
date/time field rendered as if none of them had been set:

- `fullWidth` had no effect — the field stayed at its intrinsic `inline-flex` width
  (261px) inside whatever container it was given.
- `error` never coloured the field, and `required` never rendered the asterisk.
- `onBlur` was never called.

Every editable `ModelDataTypeDateTimeNullableRendererCC` is affected: the renderer passes
all four, so date/time fields in a form now fill their column, turn red on a validation
error, mark the required asterisk, and report blur to the form engine (which marks the
field touched, the same as every other field type).

Alongside that, `LocalizedDateTimePicker` and `LocalizedKeyboardDatePicker` no longer
overwrite a caller's `slotProps.textField` with their own unset `required`, `error` and
`fullWidth`, and they chain the `onBlur` found there instead of replacing it.

## Why

The pickers build the text field's slot props themselves, and applied their own
`required`/`error`/`fullWidth`/`onBlur` after the caller's — so `DateTimeInput`, which
handed its values down inside `slotProps.textField`, always lost. `DateInput` already
passed the same four as props to its picker; `DateTimeInput` now matches it.

## Migration

Nothing to do in the usual case — a date/time field in a form now looks and behaves like
the date, string and number fields next to it.

Two things to check:

- A layout that relied on the field being 261px wide regardless of `fullWidth` needs an
  explicit `fullWidth={false}`, or a narrower container.
- A form whose date/time field is validated on touch now sees that field become touched on
  blur, so its error message can appear earlier than before.

# The date pickers call `onAccept` with the dates they report to `onChange`

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers`, `standalone/UIKit` (`DateInput`,
  `DateTimeInput`)

## What changed

`LocalizedKeyboardDatePicker`, `LocalizedDatePicker`, `LocalizedDateTimePicker`, `DateInput`
and `DateTimeInput` call `onAccept` with every date they report to `onChange`, right after
`onChange` and with the same arguments: once the user is done with the date (focus leaves
the field, Enter in it, the calendar accepts a date), with a date the picker accepts or
`null` for an empty field, and only if that differs from the date reported last or handed
in as `value` since. `context.validationError` is always `null` there.

Before, `onAccept` was MUI's: called for every change of the field, while the user typed.
Typing 2030 into the year of a picker that held 2026-08-01 called it four times, with
0002-08-01, 0020-08-01 and 0203-08-01 (each with `context.validationError` `"minDate"`) and
2030-08-01; retyping a day called it with the days on the way; a date past `maxDate` reached
it with `context.validationError` `"maxDate"`.

With `publishIntermediateValues`, `onAccept` is still MUI's, as `onChange` is. The touch
Clear button of `DateInput` reports `null` to `onChange` only, as before.

## Why

`onAccept` is the callback for "the user is done with the value". An app that saves or
fetches in it got the half-typed and rejected dates that `onChange` holds back.

## Migration

Nothing to do for an app that does not pass `onAccept` to these pickers. An app that does
gets a date there once the user is done with it, the same one `onChange` gets: a check of
`context.validationError` in `onAccept` can go. An app that needs every change of the field
in `onAccept` sets `publishIntermediateValues` on the picker.

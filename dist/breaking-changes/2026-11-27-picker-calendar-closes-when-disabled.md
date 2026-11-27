# The date pickers close their calendar when they get disabled or read-only

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers`, `standalone/UIKit`

## What changed

`LocalizedKeyboardDatePicker`, `LocalizedDatePicker` and `LocalizedDateTimePicker`, and
the components built on them (`DateInput`, `DateTimeInput`, the date fields of a model
form, the date filters of the data grid), close their open calendar when `disabled` or
`readOnly` turns on. Before, the calendar stayed open with every day disabled, and picked
nothing until Escape or a click outside closed it.

- This holds for the desktop popup and the mobile dialog alike.
- The calendar closes as a click outside it closes it: a date picked in it and not yet
  reported (a day in a date and time picker's popup before OK, a day in the mobile
  dialog before OK) is kept and reported to `onChange` and `onAccept`, and `onClose` is
  called once.
- The calendar stays closed when the picker is enabled again.
- A controlled `open` shows the calendar only while the picker is neither disabled nor
  read-only. While `open` stays `true`, the calendar shows again once both are off.

## Why

MUI's picker does not open its calendar while it is disabled or read-only, but leaves one
open that was open when that happened. A form that turns read-only while the user has a
calendar open (a model form's read-only reasons make its date fields disabled) left a
layer on the page that did nothing. `ColorInput` closes its picker in the same case.

## Migration

Nothing to do in the usual case. An app that controls `open` sets it to `false` in
`onClose`, which is now also called when the picker closes the calendar itself, so the
calendar does not come back when the picker is enabled again. An app that disables a
picker while its calendar may be open gets the date picked in it reported right then.

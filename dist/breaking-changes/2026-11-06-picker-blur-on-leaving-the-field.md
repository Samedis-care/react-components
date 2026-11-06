# The date pickers report a blur once focus leaves the field

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers`, `standalone/UIKit`

## What changed

`LocalizedKeyboardDatePicker`, `LocalizedDatePicker` and `LocalizedDateTimePicker`, and
the components built on them (`DateInput`, `DateTimeInput`, the model date renderers, the
DataGrid date filters), now treat the open-picker button and the other adornments of the
field as part of the field:

- Moving from a section to the open-picker button, or to another adornment such as the
  info button of `DateTimeInput`, no longer calls `onBlur` (the prop and
  `slotProps.textField.onBlur`). Before, it was called then, while the user was still in
  the field.
- Leaving the field from one of those buttons (Tab, a click elsewhere) now calls `onBlur`
  and drops a half-typed or rejected entry, as leaving from a section does. Before, nothing
  was called, and the field kept showing the entry in red while the consumer held the
  previous date.
- Opening the calendar and closing it again is not leaving the field: focus moves into the
  popup and back without a call. Focus that leaves from inside the open popup straight to
  another control (a click on it while the calendar is open) is not reported.
- `onBlur` receives the blur event of the field's input root (`role="group"`, which holds
  the sections and the adornments): `currentTarget` is that element, `target` the section
  or button that lost focus. Before, it was the blur event of the element that holds the
  sections only.

## Why

MUI's field reports a blur only when focus leaves the element that holds the sections. To
the user the buttons beside the sections are part of the field, so the blur on the way to
them came too early, and focus leaving from them was never reported. Which way focus left
decided whether a half-typed date was dropped.

## Migration

Nothing to do in the usual case: a form marks a date field touched when the user leaves it,
not when they reach for its calendar button. A blur handler that reads
`event.currentTarget` now gets the field group instead of the sections container.

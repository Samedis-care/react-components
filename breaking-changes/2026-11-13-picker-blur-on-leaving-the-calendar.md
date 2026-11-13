# The date pickers report a blur when focus leaves the open calendar

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers`, `standalone/UIKit`

## What changed

`LocalizedKeyboardDatePicker`, `LocalizedDatePicker` and `LocalizedDateTimePicker`, and
the components built on them (`DateInput`, `DateTimeInput`, the model date renderers, the
DataGrid date filters), now call `onBlur` (the prop and `slotProps.textField.onBlur`) when
focus goes from the open calendar of the desktop popup to another element, such as a click
on another field while the calendar is open. Before, nothing was called on that path.

- It is called once, when that element gets focus. Moving inside the calendar, and back to
  the field (the calendar hands focus back when it closes, also after a click on the page
  background), is still not leaving.
- Focus that goes to no element meanwhile (the window losing focus) is not leaving either;
  the next element to get focus decides.
- The event is shaped like the field's other blur events: `currentTarget` is the field's
  input root (`role="group"`), `target` the element of the calendar that had focus, and
  `relatedTarget` the element that got it. `nativeEvent` is the native `focusin` of that
  element.
- The mobile dialog is unchanged: it is modal, and focus leaves it only by closing it.

## Why

The calendar counts as part of the field: opening it is not leaving the field. The field
was never told when the user then left from the calendar: `onBlur` (with which a form
marks the field touched) was not called, and the two date pickers went on treating the
user as in the field, so a rejection that came up afterwards (a date set from outside, a
changed `minDate`) had its message held back instead of shown at once.

## Migration

Nothing to do in the usual case: an `onBlur` that marks a field touched now also runs when
the user leaves through the calendar.

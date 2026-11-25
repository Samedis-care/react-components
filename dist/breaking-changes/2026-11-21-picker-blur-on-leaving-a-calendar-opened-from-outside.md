# The date pickers report a blur when focus leaves a calendar opened from outside the field

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers`, `standalone/UIKit`

## What changed

`LocalizedKeyboardDatePicker`, `LocalizedDatePicker` and `LocalizedDateTimePicker`, and
the components built on them, now call `onBlur` (the prop and
`slotProps.textField.onBlur`) when focus leaves the open desktop popup for an element
outside the field and the popup, however the popup was opened. Before, this worked only
for a popup that took focus from the field; a popup a controlled `open` opened while focus
was elsewhere (a button outside the field) reported nothing when the user left it.

- It is called once, when that element gets focus, with the same event as for a popup
  opened from the field: `currentTarget` is the field's input root (`role="group"`),
  `target` the element of the calendar that had focus, `relatedTarget` the element that
  got it.
- When such a popup closes, it hands focus back to the element that had it before it
  opened, outside the field: that is leaving too, and calls `onBlur` once.
- Focus that goes from the popup into the field is not leaving; leaving the field from
  there calls `onBlur` as usual.
- The mobile dialog is unchanged.

## Why

The calendar counts as part of the field, however it was opened. A form that opens a
picker's calendar from a button of its own never learnt that the user had left the field:
`onBlur`, with which a form marks the field touched, was not called.

## Migration

Nothing to do in the usual case: an `onBlur` that marks a field touched now also runs when
the user leaves a calendar that the app opened through `open`.

# Leaving a date field marks it touched in a Form

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `backend-components/Form`, `standalone/LocalizedDateTimePickers`, `standalone/UIKit`

## What changed

- The field group (`role="group"`) of `LocalizedKeyboardDatePicker`, `LocalizedDatePicker`
  and `LocalizedDateTimePicker` carries the picker's `name` as `data-name`
  (`slotProps.textField.name` where that is set, the name the hidden input gets). The
  group is the `currentTarget` of the pickers' blur event, so the event now names the
  field. This covers `DateInput`, `DateTimeInput` and the model date renderers too.
- Form's `handleBlur` takes the field from the first non-empty `name`, `data-name` or `id`
  of the event's `currentTarget`, then of its `target`. An empty `name` or `id` (which is
  what an element without the attribute has) no longer ends the search.

Together: leaving a date or date/time field of a model form (by Tab, a click elsewhere, or
from its open calendar) now marks it touched, as leaving a text field does, and no longer
logs "[Components-Care] [Form] Handling on blur event for element without name". A
control whose wrapper has `onBlur={handleBlur}` and no name of its own is marked touched by
the name of the element inside it that lost focus, and an input named only by
`data-name` or `id` is marked by that.

## Why

The pickers' blur event comes from the field group, which had no name, and `handleBlur`
stopped at its empty `id`: date fields were never marked touched on leaving, so their
validation message (the "required" of an empty required date) stayed hidden until the
form was submitted, and every such blur logged an error.

## Migration

Nothing to do in the usual case: the message of a date field now shows once the user
leaves it, as for the other fields. Code that marked a date field touched itself to work
around this can drop that. A selector or test that looks for `[data-name="<field>"]` now
also finds the field group of a date picker with that name.

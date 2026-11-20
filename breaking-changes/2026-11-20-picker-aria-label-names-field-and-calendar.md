# A date picker's `aria-label` names its field and calendar, and the calendar is always named

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers` (`LocalizedKeyboardDatePicker`,
  `LocalizedDatePicker`, `LocalizedDateTimePicker`), and through them `DateInput`,
  `DateTimeInput` and the DataGrid's date and date-time filters.

## What changed

- `aria-label` is now a documented prop of the three pickers, for a picker without a
  visible `label`. It names the field group (`role="group"`, which holds the sections)
  and the open calendar dialog: the desktop popup and the mobile dialog, also while the
  mobile dialog shows its title ("Select date"). Before, MUI put it on the field's outer
  `<div>`, where it named nothing; it is no longer there. A visible `label` takes its
  place, as in MUI: the label names the field and the desktop popup, and the mobile
  dialog's title names the mobile dialog. An `aria-label` set in
  `slotProps.textField.slotProps.input`, `slotProps.popper` or `slotProps.mobilePaper` is
  kept for that element. `DateInput` and `DateTimeInput` hand `aria-label` on to their
  picker.
- A picker with neither `label` nor `aria-label` opens a calendar named after MUI's title
  of the mobile dialog, in the components-care language: "Select date" for the date
  pickers, "Select date & time" for `LocalizedDateTimePicker` (the picker's
  `localeText.toolbarTitle` where one is given). Its field stays unnamed.
- The DataGrid's date and date-time filters name their pickers: "Date" or "Date and
  time", and "From" and "To" for "Between". These are the new translation keys
  `standalone.data-grid.content.filter-value.*` (`date`, `date-time`, `from`, `to`), in
  every locale.

## Why

MUI names a picker's field and its desktop calendar only after the visible `label`, and
its mobile dialog after the dialog's title. A picker without a label, such as the
DataGrid's date filters, had an unnamed field, so a screen reader said "Month, spin
button" with nothing telling what the date is for; the two pickers of a "Between"
filter, and their calendars, could not be told apart; and the open desktop calendar was
an unnamed dialog.

## Migration

Nothing to do. A test or a style that finds a picker's outer `<div>` by its `aria-label`
finds the field group (`getByRole("group", { name })`) instead. Expect the names above in
the DataGrid's date filters and on the calendar of a picker without a label.

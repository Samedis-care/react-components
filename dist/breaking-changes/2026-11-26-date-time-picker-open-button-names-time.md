# The date-time picker's open button names the time too

- **Date:** 2026-11-26
- **Kind:** behavior, i18n
- **Scope:** `standalone/LocalizedDateTimePickers` (`LocalizedDateTimePicker`, and with it
  `DateTimeInput`, the date-time renderers and the DataGrid's date-time filters)

## What changed

- The button that opens a `LocalizedDateTimePicker`'s calendar is named after the date and
  the time the field shows, in the components-care language: "Choose date and time,
  selected date and time is Aug 1, 2026 10:30 AM", and "Choose date and time" while the
  field is empty or holds an invalid date. MUI named it after the date alone: "Choose date,
  selected date is Aug 1, 2026".
- The date is written in the adapter's `fullDate` format, as MUI writes it on a date
  picker's button; the time in its `fullTime` format for the locale's 12- or 24-hour clock,
  as the field writes it; both in the timezone the field shows.
- The texts come from the new keys `standalone.date-picker.open-date-time` and
  `standalone.date-picker.open-date-time-selected` (with `{{DATE}}` and `{{TIME}}`), in
  every locale: "Datum und Uhrzeit auswählen", "Elige fecha y hora", "Choisir la date et
  l'heure", "Scegli la data e l'ora", "Kies datum en tijd", "Выберите дату и время", "Sana
  va vaqtni tanlang".
- The name goes into `slotProps.openPickerButton`, so it also names a button passed in
  `slots.openPickerButton`. An `aria-label` set in `slotProps.openPickerButton`, as an
  object or a function, replaces it.
- `LocalizedDatePicker` and `LocalizedKeyboardDatePicker` keep MUI's name.

Nothing changes on screen.

## Why

The calendar the button opens sets the date and the time, but a screen reader announced
only the date, so its user could not hear the time without going back into the field.

## Migration

Nothing to do for the picker itself.

Required for tests that find a date-time picker's open button by MUI's whole name, for
example `getByRole("button", { name: "Choose date, selected date is Aug 1, 2026" })`: the
name is now "Choose date and time, selected date and time is Aug 1, 2026 10:30 AM" (in the
locale's formats). A pattern such as `{ name: /choose date/i }` still matches.

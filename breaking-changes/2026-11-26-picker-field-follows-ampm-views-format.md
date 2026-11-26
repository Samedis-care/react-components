# A date picker's field follows ampm, views and format, as MUI's does

- **Date:** 2026-11-26
- **Kind:** behavior, type
- **Scope:** `standalone/LocalizedDateTimePickers` (`LocalizedKeyboardDatePicker`,
  `LocalizedDatePicker`, `LocalizedDateTimePicker`), and with them
  `standalone/UIKit/InputControls` (`DateInput`, `DateTimeInput`), the model's date
  renderers and the DataGrid's date filters

## What changed

The pickers no longer fix the field to moment's `L` (date) and `L LT` (date and time). The
field writes the value as MUI's own pickers do: in the date adapter's format for the
picker's `views` and, on the date-time picker, `ampm`, or in `format` when one is set.

- With the default views nothing changes on screen in the library's languages: the date
  pickers show `L`, the date-time picker `L hh:mm A` on a 12-hour clock and `L HH:mm` on a
  24-hour one, which the field shows as it showed `L LT` (`08/01/2026 03:30 PM`,
  `01.08.2026 15:30`). In a moment locale whose `LT` is written otherwise (another separator
  between hours and minutes, AM/PM before the hours), the time now follows MUI's
  `hh:mm A` / `HH:mm`.
- `ampm={false}` shows the hours from 0 to 23 without an AM/PM section, `ampm` adds one; the
  default is still the clock of the adapter's locale.
- `views` shape the sections, as in MUI: the date views `["year"]`, `["month"]`, `["day"]`,
  `["month", "year"]` and `["day", "month"]` show only those parts (`["month", "year"]`:
  `August 2026`), other date views keep `L`; a `seconds` view adds a seconds section.
- The same holds for `views`, `ampm` and `format` set in the theme's `defaultProps` of
  `MuiDatePicker` and `MuiDateTimePicker`; `["year", "month", "day"]` there keeps `L`.
- With a date adapter other than moment, the field uses that adapter's formats; moment's
  `L` meant something else there.
- `format` is now part of `LocalizedKeyboardDatePickerProps`, `LocalizedDatePickerProps` and
  `LocalizedDateTimePickerProps`, and so of the `CcLocalizedKeyboardDatePicker` theme
  defaults.
- The validation message under the field writes its limits as the field does: a time on
  the clock `ampm` sets ("Enter a time at or after 15:00"), and with `format` a date picker's
  date limit and a date-time picker's limit with a date and a time in that format.

## Why

The field ignored the props that shape it in MUI, so it disagreed with the calendar:
`ampm={false}` gave a 24-hour clock in the calendar and AM/PM in the field,
`views={["month", "year"]}` a month calendar and a field that asked for the day, a
`seconds` view no seconds to type. The pickers' props types left out `format`, and a
`format` in the theme's defaults never reached the field.

## Migration

Nothing to do for an app that sets neither `ampm` nor one of the date views above or a
`seconds` view, on a picker, `DateInput` or `DateTimeInput` or in the theme's
`MuiDatePicker` / `MuiDateTimePicker` `defaultProps`, and sets no `format` in those theme
defaults.

Required for any app that does and wants the field to keep the old fixed format: pass it
as `format`.

```tsx
<LocalizedKeyboardDatePicker views={["month", "year"]} format="L" {...props} />
<LocalizedDateTimePicker ampm={false} format="L LT" {...props} />
```

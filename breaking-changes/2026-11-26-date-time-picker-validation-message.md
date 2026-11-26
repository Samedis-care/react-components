# A date-time picker says in text why it rejects a date and time

- **Date:** 2026-11-26
- **Kind:** behavior, i18n
- **Scope:** `standalone/LocalizedDateTimePickers` (`LocalizedDateTimePicker`),
  `standalone/UIKit/InputControls/DateTimeInput`, the DataGrid's date-time filter. The date
  pickers have done this since [2026-11-13](2026-11-13-date-picker-validation-message.md).

## What changed

While the picker's own validation rejects the date and time the field shows, the field now
says why in a message under it, in the components-care language, as the date pickers do:

| MUI's error                                                    | Message (en)                                           |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `minTime`                                                      | Enter a time at or after 09:00 AM                      |
| `maxTime`                                                      | Enter a time at or before 05:00 PM                     |
| `minDate`, `minTime` from `minDateTime`                        | Enter a date and time on or after 08/01/2026 10:00 AM  |
| `maxDate`, `maxTime` from `maxDateTime`                        | Enter a date and time on or before 08/01/2026 06:00 PM |
| `minDate` (without `minDateTime`)                              | Enter a date on or after 01/01/2020                    |
| `maxDate` (without `maxDateTime`)                              | Enter a date on or before 12/31/2030                   |
| `disablePast`                                                  | Enter the current date and time or a later one         |
| `disableFuture`                                                | Enter the current date and time or an earlier one      |
| `minutesStep`                                                  | Enter minutes in steps of 15                           |
| `shouldDisableTime-hours`, `-minutes`, `-seconds`              | Enter a time that can be selected                      |
| `shouldDisableDate`, `shouldDisableMonth`, `shouldDisableYear` | Enter a date that can be selected                      |
| `invalidDate` (an impossible date such as 02/31/2026)          | Enter a valid date                                     |

- A limit is written as the field writes it (leading zeros included, the locale's 12- or
  24-hour clock), an unset `minDate` or `maxDate` as MUI's default (01/01/1900, 12/31/2099).
- MUI compares `minTime` and `maxTime` with their date while `minDateTime`, `maxDateTime`,
  `disablePast` or `disableFuture` is set; the message then asks for a date and time on or
  after (before) it, too.
- A limit with a date is written in the timezone the field shows (the `timezone` prop, else
  the value's own); a time of day alone in its own, as MUI compares it.
- The rest works as on the date pickers: the message takes the place of the helper text
  (`slotProps.textField.helperText`, DateTimeInput's `helperText`) and is the field's
  description; a rejection that comes up while the user is in the field shows once focus
  leaves it, one that comes up while the user is elsewhere at once; it goes as soon as the
  value is valid; a picker whose `error` is set, also to `false`, shows no message. The
  model's date-time renderers set it, so form fields keep showing the form's message.

The texts are the new translation keys `standalone.date-picker.error.*` `min-date-time`,
`max-date-time` (`{{DATE}}`), `min-time`, `max-time` (`{{TIME}}`), `past-date-time`,
`future-date-time`, `unavailable-time` and `minutes-step` (`{{STEP}}`), in every locale.

## Why

The field only turned red: no text said what was wrong, a screen reader only heard
"invalid", and in forced-colors mode, where the red is gone, the field looked like any
other.

## Migration

Required for apps that show their own text for a date-time picker's validation error in
`helperText` without setting `error`: the library's message now replaces that text. Set
`error` from `onError` as well, and the picker leaves the text to you:

```tsx
const [pickerError, setPickerError] = useState<DateTimeValidationError>(null);

<LocalizedDateTimePicker
	value={value}
	onChange={setValue}
	minTime={opening}
	onError={setPickerError}
	error={pickerError != null}
	slotProps={{ textField: { helperText: pickerError ? myMessage : myHint } }}
/>;
```

Nothing to do otherwise. Expect the message under a date-time picker whose value is outside
its limits, in place of its helper text, and under the DataGrid's date-time filter for a
date before 1900 or after 2099.

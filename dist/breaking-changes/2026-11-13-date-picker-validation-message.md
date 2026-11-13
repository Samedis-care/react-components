# A date picker says in text why it rejects a date

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers` (`LocalizedKeyboardDatePicker`,
  `LocalizedDatePicker`), `standalone/UIKit/InputControls/DateInput`, the DataGrid's date
  filter. Not `LocalizedDateTimePicker` and `DateTimeInput`, which still show no text.

## What changed

While the picker's own validation rejects the date the field shows, the field now says
why in a message under it, in the components-care language:

| MUI's error                                                    | Message (en)                         |
| -------------------------------------------------------------- | ------------------------------------ |
| `invalidDate` (an impossible date such as 02/31/2026)          | Enter a valid date                   |
| `minDate`                                                      | Enter a date on or after 01/01/2020  |
| `maxDate`                                                      | Enter a date on or before 12/31/2030 |
| `disablePast`                                                  | Enter today's date or a later one    |
| `disableFuture`                                                | Enter today's date or an earlier one |
| `shouldDisableDate`, `shouldDisableMonth`, `shouldDisableYear` | Enter a date that can be selected    |

The limit is written as the field writes dates, and an unset `minDate` or `maxDate` is
MUI's default (01/01/1900, 12/31/2099).

- The message takes the place of the helper text (`slotProps.textField.helperText`,
  DateInput's `helperText`) while it shows, and is the field's description
  (`aria-describedby`).
- A rejection that comes up while the user is in the field shows once focus leaves the
  field; while the user types, the field only turns red, as before. A rejection that comes
  up while the user is elsewhere (a stored date outside the limits, a changed `minDate`)
  shows at once. The message goes as soon as the date is valid.
- Only while the picker's validation decides the error state: a picker whose `error` is
  set (the prop, or `slotProps.textField.error`), also to `false`, shows no message. The
  model's date renderers set it, so form fields keep showing the form's message.

The texts are the new translation keys `standalone.date-picker.error.*` (`invalid`,
`min-date`, `max-date`, `past`, `future`, `unavailable`; `{{DATE}}` is the limit), in
every locale.

## Why

The field only turned red: no text said what was wrong, a screen reader only heard
"invalid", and in forced-colors mode, where the red is gone, the field looked like any
other.

## Migration

Required for apps that show their own text for a picker's validation error in
`helperText` without setting `error`: the library's message now replaces that text.
Set `error` from `onError` as well, and the picker leaves the text to you:

```tsx
const [pickerError, setPickerError] = useState<DateValidationError>(null);

<LocalizedKeyboardDatePicker
	value={value}
	onChange={setValue}
	minDate={minDate}
	onError={setPickerError}
	error={pickerError != null}
	slotProps={{ textField: { helperText: pickerError ? myMessage : myHint } }}
/>;
```

Nothing to do otherwise. Expect the message under a date picker whose date is outside its
limits, in place of its helper text.

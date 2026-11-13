# A date picker keeps a rejected entry when focus leaves it

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers`, `standalone/UIKit`, the model date renderers, the DataGrid date filters

## What changed

`LocalizedKeyboardDatePicker`, `LocalizedDatePicker` and `LocalizedDateTimePicker`, and the
components built on them (`DateInput`, `DateTimeInput`, the model date renderers, the
DataGrid date filters), no longer drop an entry the picker rejects when focus leaves the
field. Such an entry is an impossible date (02/31/2026), a date outside `minDate`, `maxDate`
or another validation prop (the default range is 1900 to 2099), or a year not typed to the
end (0020).

- The entry stays in the field, marked invalid, as in MUI's own field.
- `onError` keeps the error it reported. Before, leaving the field replaced the entry with
  the last value `onChange` reported and called `onError(null)`.
- `onChange` is unchanged: it only receives values that pass validation. While a rejected
  entry is shown, the consumer holds the last value it accepted.
- The entry goes when the user changes it, when the consumer hands in a different date, or
  when the calendar opens (the calendar opens on the accepted date). A consumer that hands
  in the date it already holds, such as a form reset of a field whose stored date never
  changed, leaves the entry in place.

## Why

The entry vanished without a message, and its error went with it. A dialog or form that
checks `onError` before it saves found no error and saved the previous date, or a day the
user only passed through while typing: typing 02/31/2026 over March 2 reports Feb 2 and
Feb 3 on the way, and leaving the field showed and kept Feb 3.

## Migration

- Consumers that check `onError` before they act (the model date renderers, a dialog that
  refuses to submit while the picker reports an error): nothing to do. They now see the
  error when the user leaves the field for their submit button.
- **Required for every consumer that saves or acts on a picker's value without checking
  `onError`**, for example a dialog that submits the date it keeps in its own state: the
  field can now show a rejected entry in red while that state still holds the previous
  date, and a submit would use the previous date. Track `onError` and refuse to submit
  while it reports an error:

  ```tsx
  const [date, setDate] = useState<Date | null>(null);
  const [dateInvalid, setDateInvalid] = useState(false);

  <DateInput
  	value={date}
  	onChange={setDate}
  	onError={(error) => setDateInvalid(error != null)}
  />;

  // in the submit handler
  if (dateInvalid) {
  	// tell the user the date is not valid, and do not submit
  	return;
  }
  ```

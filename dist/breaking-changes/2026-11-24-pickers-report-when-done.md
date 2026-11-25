# The date pickers report a date once the user is done with it

- **Date:** 2026-11-24
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers`, `standalone/UIKit` (`DateInput`,
  `DateTimeInput`), the model date and date/time renderers, `standalone/DataGrid` (date
  filters)

## What changed

`LocalizedKeyboardDatePicker`, `LocalizedDatePicker` and `LocalizedDateTimePicker`, and
everything built on them (`DateInput`, `DateTimeInput`, the date and date/time fields of a
`Form`, the DataGrid's date and date/time column filters), call `onChange` once the user is
done with the date:

- when focus leaves the field, right before `onBlur` and in the same event;
- on Enter in the field;
- when the calendar accepts a date: a day picked in the desktop calendar, OK in the desktop
  date/time popup or in the mobile dialog, or the calendar closed with Escape or a click
  outside it, which keeps the date picked in it.

It gets the date the field shows, if the picker accepts it, or `null` for an empty field,
and only if that differs from the date reported last or handed in as `value` since. The
touch Clear button of `DateInput` still reports `null` at once.

Before, `onChange` fired for every date the field passed through while the user typed:

- retyping the day of Aug 5 as `12` reported Aug 1, then Aug 12;
- retyping the minutes of 22:30 as `45` reported 22:04, then 22:45;
- typing 02/31 over a stored date reported Feb 2 and Feb 3 on the way;
- deleting a section to retype it reported `null` at once: a DataGrid date filter cleared
  itself and removed its chained filter, which retyping the section did not bring back;
- a day picked in the mobile dialog was reported before OK, and Cancel reported the old date
  again.

None of these are reported now. An entry the picker rejects is still not reported (see
`onError`). `publishIntermediateValues` still reports every change at once.

In a `Form`, a typed date reaches the form's values, its dirty state (the save button, the
"Leave form page?" guard, the dirty marker), its validation and the `onChange` of the field's
model definition once the user leaves the field or presses Enter. A click on a button
outside the field moves focus out of it first, so a save button saves the typed date.
Closing the browser tab or going back with the browser while focus is still in the field is
not leaving it: the typed date is not in the form yet, as with `DecimalInputField` and
`CurrencyInput`, which also take a typed number on leaving and on Enter.

The field is one control: a button inside it (the open-picker button, an adornment an app
adds) is part of it, so moving to it is not leaving, and such a button that reads the form's
value gets the date from before the edit.

## Why

A date the field passes through while the user types is not a date the user meant.
Consumers that act on every report acted on it: the DataGrid's date filters refetched with
it and lost their chained filter, and forms computed other fields from it.

## Migration

Nothing to do for a form field or a DataGrid filter: expect a typed date to take effect
when the user leaves the field or presses Enter, and a picked date at once.

Required for any app whose `onBlur` handler of a picker acts on the date it stored from
`onChange` (state read from the handler's closure, or a draft of its own that it resets on
blur): `onChange` now fires in the same event, right before `onBlur`, so the handler still
sees the date from before the edit and commits that, or shows it again. Act on the date in
`onChange`, which now means the user is done with it, and drop a draft of your own: the
picker holds it.

```tsx
// before: onChange stored the date, onBlur committed it
<DateInput value={date} onChange={setDate} onBlur={() => commit(date)} />

// now: onChange is the commit
<DateInput
	value={date}
	onChange={(next) => {
		setDate(next);
		commit(next);
	}}
/>
```

Required for any app that enables a button only once a picker has reported a date (a Save
that is disabled while the date is empty): the button is enabled once the user leaves the
field or presses Enter, so a click on it while it is still disabled only leaves the field,
and the user has to click again. Keep such a button enabled and check the date in its click
handler: the click moves focus out of the field first, so `onChange` has run by then.

```tsx
<DateInput value={day} onChange={setDay} />
<Button
	// not disabled={!day}: a typed day is reported when the click leaves the field
	onClick={() => {
		if (!day) return showDayMissing();
		save(day);
	}}
>
	Save
</Button>
```

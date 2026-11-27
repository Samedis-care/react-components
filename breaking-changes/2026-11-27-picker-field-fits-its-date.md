# A date picker at its own width grows to fit its date

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers` (`LocalizedKeyboardDatePicker`,
  `LocalizedDatePicker`, `LocalizedDateTimePicker`), and through them `DateInput`,
  `DateTimeInput` and the DataGrid's date and date-time filters.

## What changed

A picker without `fullWidth` still gives its date MUI's 182px, and now more where the
date needs more: the field grows to fit the whole date instead of cutting off its end
behind the calendar button. That happens

- with the user's text spacing (WCAG 1.4.12: letter spacing 0.12em, word spacing 0.16em),
  where a date and time needs about 200px and its AM/PM was hidden;
- with a `format` longer than the default, such as `"dddd, MMMM D, YYYY"`;
- with seconds in a date and time (183px in English).

A date that fits keeps the 182px, so most fields look as before. A `fullWidth` field
keeps the width of its container, as in MUI.

The rule goes into the `sx` of the field's input root
(`slotProps.textField.slotProps.input.sx`); an `sx` the caller passes there comes after
it.

The DataGrid's date and date-time "in range" filters give their second picker ("To")
`fullWidth`, as their first one ("From") has: both take the width of the filter popup,
as they did before.

## Why

The end of the date was cut off, so the user could not read the time of day or the year
(WCAG 1.4.12 Text Spacing).

## Migration

Nothing to do for a picker in a form, a dialog or any other container with room for it.

Required for any app that gives a picker without `fullWidth` a width (through `sx` or
`slotProps.textField.sx`), or puts one into a container, narrower than its date plus about
64px for the padding and the calendar button: there the field no longer cuts off the end
of its date, and the calendar button runs past the field's edge instead. A small date
picker showing `08/28/2026` or `28.08.2026` needs 152px. Give the field that width:

```tsx
<LocalizedKeyboardDatePicker
	value={value}
	onChange={setValue}
	slotProps={{ textField: { size: "small", sx: { width: 152 } } }}
/>
```

Where the field cannot be that wide, pass `fullWidth` as well: the field then keeps the
width it is given (its `sx` width, or its container's) and cuts off the end of the date,
as before.

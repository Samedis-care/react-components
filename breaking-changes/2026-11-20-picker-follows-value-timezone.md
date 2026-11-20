# A date picker follows a value handed in another timezone

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/LocalizedDateTimePickers`, `standalone/UIKit`

## What changed

`LocalizedKeyboardDatePicker`, `LocalizedDatePicker`, `LocalizedDateTimePicker` and
`DateTimeInput` now take a `value` that changes only its timezone: the same instant handed
in as UTC where it was local time (`moment.utc(...)` where it was `moment(...)`), or in
another zone (`moment.tz(...)`). A picker without a `timezone` prop shows its date in the
timezone of `value` and builds the dates the user enters in it, so the field now shows the
date in the new timezone, and `onChange` reports the dates the user enters in it.

Before, the picker kept showing the date in the timezone it first held that instant in, and
reported the dates the user entered in that timezone, until `value` moved to another
instant.

- A fresh value of the same instant in the same timezone, such as `moment(...)` called in
  render, is still not a change: the field keeps what it shows and what the user is typing.
- An entry the picker rejects (see
  [A date picker keeps a rejected entry when focus leaves it](2026-11-13-picker-keeps-rejected-entry.md))
  goes when `value` changes its timezone, as it goes when `value` changes its date.

`DateInput` is unchanged: it takes date-only `Date` values and always shows them as the
local calendar day.

## Why

A "show in UTC" switch in front of a picker changed the value it hands in, but the field
went on showing local time.

## Migration

Nothing to do for a consumer that hands in its value in the same timezone on every render.
The components-care controls (`DateInput`, the model date renderers, the DataGrid date
filters) all hand in local time.

**Required for a consumer that hands back what `onChange` reported in another timezone**,
for example one that stores the reported Moment and renders `moment.utc(stored)`: an empty
picker without a `timezone` prop builds the entered date in local time and reports it so,
and the field now shows that date in UTC right after the user enters it, where before it
did so only once the picker mounted again. East of UTC, a date entered in a date-only
picker then shows as the day before. Pass the timezone the dates are meant in, so the
picker builds, shows and reports them in it:

```tsx
<LocalizedDateTimePicker
	value={value}
	onChange={setValue}
	// the picker shows and reports its dates in this timezone, also when empty
	timezone="UTC"
/>
```

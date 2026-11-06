# DecimalInputField commits only an edit, and calls onBlur

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (`DecimalInputField`), and the renderer built on
  it (`ModelDataTypeDecimalRendererCC`)

## What changed

- `onChange` is called on the blur after the user edited the text. A blur without an edit (a
  Tab through the field, a click in and out, a read-only field) no longer calls it. Before,
  every blur called `onChange` with the parsed text the field showed.
- `onBlur` is called on every blur, before `onChange`. Before, an `onBlur` passed to the field
  was never called.

## Why

The field shows its value rounded to the fraction digits of `format` (at most 3 by default),
so every blur stored the rounded number: 0.12345 became 0.123, and with
`format={{ maximumFractionDigits: 0 }}` 7.5 became 8. In a CC Form a plain Tab through the
field made the form dirty, brought up the unsaved-changes prompt, and saving wrote the rounded
number.

`ModelDataTypeDecimalRendererCC` passes the Form's `onBlur`, which now marks the field touched
on every blur, as for the other fields.

## Migration

Nothing to do for a CC Form, or for code that only keeps the value `onChange` reports.

Required for code that used `onChange` to learn that the user left the field (to mark it
touched, validate it or save): it is no longer called for a blur without an edit. Pass
`onBlur` for that:

```tsx
<DecimalInputField
	value={value}
	onChange={(_evt, next) => setValue(next)}
	onBlur={() => setTouched(true)}
/>
```

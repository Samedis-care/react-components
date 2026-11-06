# The number inputs keep a minus sign

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (`CurrencyInput`, `DecimalInputField`,
  `IntegerInputField`), `utils` (`parseLocalizedNumber`, `delocalizeNumber`)

## What changed

A minus sign before the first digit now makes the number negative. Before, every minus was
dropped, so negative numbers came out positive:

| Input                     | Text     | Before | Now  |
| ------------------------- | -------- | ------ | ---- |
| `IntegerInputField`       | `-56`    | 56     | -56  |
| `DecimalInputField`       | `-3.5`   | 3.5    | -3.5 |
| `CurrencyInput` (EUR, en) | `-€5.50` | 5.5    | -5.5 |

- Both the keyboard's `-` and the minus sign `−` (U+2212) count, also after a currency
  symbol, where some locales put it (`€ -5,00` in nl, `EUR-5.00` in de-CH). So every locale
  reads back the negative numbers it formats, and a stored negative keeps its sign when
  the user edits it.
- A minus after the first digit (`5-`) does not count. A minus without a digit (`-`) is
  no number, as before.
- `-0` is 0, also when an amount rounds to zero (`-0.001` in a `CurrencyInput` is saved
  as 0 and shown as `€0.00`).
- `IntegerInputField` shows a typed `-` until its digits follow, as it already keeps a
  typed decimal separator; on blur a lone `-` is dropped.
- `delocalizeNumber` returns the minus as a leading `-` (`"-1234.5"`), and
  `parseLocalizedNumber` returns the negative number.

## Why

The inputs are not documented as non-negative, and negative values reach them (credits
in an invoice), but every edit flipped their sign.

## Migration

Nothing to do for fields that may be negative. A field that must not be negative now
receives the negative number the user typed instead of its positive value. Required for
such fields: reject it in the app, for example with the model field's validator or in
the `onChange` handler:

```tsx
<IntegerInputField
	value={value}
	onChange={(_evt, next) => setValue(next != null ? Math.max(next, 0) : null)}
/>
```

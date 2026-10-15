# Localized numbers take either . or , as decimal separator

- **Date:** 2026-10-15
- **Kind:** behavior
- **Scope:** `utils` (`parseLocalizedNumber`, `delocalizeNumber`), and the inputs that parse with
  them (`DecimalInputField`, `CurrencyInput`, and the renderers built on them)

## What changed

When a value doesn't contain the locale's decimal separator but does contain exactly one `.` or
`,`, that character is now read as the decimal separator. Before, it was dropped.

The exception is a value the locale could have formatted with that character as its group
separator: 1–3 digits that don't start with 0, the group separator, then exactly 3 digits (for
de, `1.234` or `12.345`). Values the inputs format themselves therefore still read back
unchanged.

| Locale | Input   | Before  | Now     |
| ------ | ------- | ------- | ------- |
| de     | `7.5`   | 75      | 7.5     |
| de     | `19.99` | 1999    | 19.99   |
| de     | `0.500` | 500     | 0.5     |
| de     | `1.234` | 1234    | 1234    |
| en     | `7,5`   | 75      | 7.5     |
| en     | `1,234` | 1234    | 1234    |
| fr     | `1.500` | 1500    | 1.5     |

Values with the locale's decimal separator, or with several `.` or `,`, are parsed as before.

## Why

Touch keypads (`inputmode="decimal"`) offer the decimal separator of the device's region, not
the one of the app's locale. An iPhone set to the German region with the app in English only
offers `,`, and "7,5" became 75. Group separators are a display concern and are rarely typed, so
a single separator in typed input is far more likely to be the decimal separator.

## Migration

Nothing to do. A typed value like `1.500` (de) or `1,500` (en) is still read as 1500.

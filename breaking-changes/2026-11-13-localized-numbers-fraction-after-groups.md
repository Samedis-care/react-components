# Localized numbers read a fraction typed with the other region's separator after group separators

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `utils` (`parseLocalizedNumber`, `delocalizeNumber`), and the inputs that parse with
  them (`DecimalInputField`, `CurrencyInput`, and the renderers built on them)

## What changed

When a value doesn't contain the locale's decimal separator but has several `.` or `,`, the last
one with a digit after it is now read as the decimal separator, and the ones before it as group
separators. Before, all of them were dropped. If exactly 3 digits follow it, all of them are
still group separators. A `.` or `,` without a digit after it separates nothing.

| Locale | Input        | Before  | Now     |
| ------ | ------------ | ------- | ------- |
| de     | `1.234.5`    | 12345   | 1234.5  |
| de     | `1.234.56 €` | 123456  | 1234.56 |
| de     | `7.5.`       | 75      | 7.5     |
| de     | `1.234.567`  | 1234567 | 1234567 |
| en     | `1,234,5`    | 12345   | 1234.5  |
| fr     | `1.234.5`    | 12345   | 1234.5  |

Values with the locale's decimal separator, and values with a single `.` or `,` (see
[Localized numbers take either . or , as decimal separator](2026-10-15-localized-numbers-take-either-decimal-separator.md)),
are parsed as before.

## Why

`DecimalInputField` shows whole numbers from 1000 up with group separators ("1.234" in de). A
user whose keypad only offers "." (an iPhone set to an English region) who appended ".5" saved
12345 instead of 1234.5. `CurrencyInput` did the same with an amount typed with its grouping.
A group separator is always followed by 3 digits, so a last separator followed by another
number of digits can only be the decimal separator.

## Migration

Nothing to do in code. Values typed this way were saved without their decimal separator, e.g.
"1.234.5" in de as 12345.

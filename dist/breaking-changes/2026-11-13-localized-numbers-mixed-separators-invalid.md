# A number whose . and , don't fit the locale's format is invalid

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `utils` (`parseLocalizedNumber`, `delocalizeNumber`), and the inputs that parse with
  them (`DecimalInputField`, `CurrencyInput`, and the renderers built on them)

## What changed

A value with several `.` or `,` that don't fit the locale's format no longer parses:
`parseLocalizedNumber` returns `NaN`, and `delocalizeNumber` returns `"NaN"`. Before, the ones
that weren't the locale's decimal separator were dropped, which read the value as a different
number.

Several fit when the ones before the last are the locale's group separator, the last one is
the group or the decimal separator, and the digits between them form the locale's groups:
`1.234.567,5` in de, `1,234,567.5` in en, `12,34,567.5` in en-IN. A `.` or `,` without a digit
next to it, as in a currency symbol, doesn't count. A single `.` or `,` is read as before (see
[Localized numbers take either . or , as decimal separator](2026-10-15-localized-numbers-take-either-decimal-separator.md)).

`DecimalInputField` and `CurrencyInput` flag such text as they flag a lone separator: they don't
call `onChange`, keep the text and the previous value, and show "Enter a number, such as
1,234.56" (in the field's format and the components-care language) in place of `helperText`,
until a valid edit or a new value. A form built with the model renderers keeps the previous
value, and saves that value if the user saves while the message shows.

| Locale | Input       | Before  | Now     |
| ------ | ----------- | ------- | ------- |
| de     | `1.234.5`   | 12345   | invalid |
| de     | `7.5.`      | 75      | invalid |
| de     | `1.234.`    | 1234    | invalid |
| de     | `1,234.5`   | 1.2345  | invalid |
| de     | `1,234,567` | 1.234   | invalid |
| en     | `1,234,5`   | 12345   | invalid |
| en     | `7.5.`      | 7.5     | invalid |
| en     | `1.234,5`   | 1.2345  | invalid |
| en     | `1.234.567` | 1.234   | invalid |
| fr     | `1.234.567` | 1234567 | invalid |
| fr     | `1.234,5`   | 1234.5  | invalid |
| de     | `1.234,5`   | 1234.5  | 1234.5  |
| de     | `1.234.567` | 1234567 | 1234567 |
| de     | `1.234`     | 1234    | 1234    |
| en     | `1,234.5`   | 1234.5  | 1234.5  |

## Why

A typo, or the separator of another region's keypad, turned into a different number without
notice. A `DecimalInputField` in de shows 1234 as "1.234"; a user whose keypad only offers "."
(an iPhone set to an English region) who appended ".5" saved 12345. `CurrencyInput` did the same
with an amount typed with its grouping. Now the field says the text is not a number and keeps
the previous value.

## Migration

Nothing to do in code. Users type such values without group separators ("1234.5") or in the
locale's format. Values typed this way before may have been saved as a different number, e.g.
"1.234.5" in de as 12345.

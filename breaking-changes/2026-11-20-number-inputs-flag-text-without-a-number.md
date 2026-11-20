# Text without a number is invalid in the number inputs

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `utils` (`parseLocalizedNumber`, `delocalizeNumber`), and the inputs that parse with
  them (`DecimalInputField`, `CurrencyInput`, and the renderers built on them)

## What changed

Text without a digit that is not empty no longer parses as an empty value: `parseLocalizedNumber`
returns `NaN`, and `delocalizeNumber` returns `"NaN"`. Before, everything but the digits was
dropped, so `"abc"`, a lone `-` or `".."` (de) read as an empty value (`null`, `""`). A lone `.`
or `,` was invalid already.

Text without a digit still counts as empty when nothing but blanks and the format's own symbols
are left: the currency symbol of a currency format (`€`, `CHF`, `Cg.`), the `%` of a percentage,
the unit of a unit format. That is what remains when the user deletes the digits of a formatted
amount.

| Locale | Text  | Options              | Before  | Now     |
| ------ | ----- | -------------------- | ------- | ------- |
| en     | `abc` |                      | null    | invalid |
| en     | `-`   |                      | null    | invalid |
| de     | `..`  |                      | null    | invalid |
| en     | `EUR` | EUR currency (`€`)   | null    | invalid |
| en     | `€`   | EUR currency         | null    | null    |
| en     | `Cg.` | XCG currency (`Cg.`) | invalid | null    |
| en     | `" "` |                      | null    | null    |

`DecimalInputField` and `CurrencyInput` flag such text as they flag a lone separator: they don't
call `onChange`, keep the text and the previous value, and show "Enter a number, such as
1,234.56" (in the field's format and the components-care language) in place of `helperText`,
until a valid edit or a new value. Before, both reported `null` and emptied the field without a
word, discarding the previous value. Deleting the digits of an amount and leaving its currency
symbol still empties a `CurrencyInput`.

## Why

A user who typed a word, or only a minus sign, over a number lost the number without being told:
the field emptied and the form saved nothing for it. Now the field says the text is not a number
and keeps the previous value.

## Migration

Nothing to do in code. Code that calls `parseLocalizedNumber` or `delocalizeNumber` itself and
treats only `null` (`""`) as "no number" now also gets `NaN` (`"NaN"`) for text without a digit;
check for it with `Number.isNaN`.

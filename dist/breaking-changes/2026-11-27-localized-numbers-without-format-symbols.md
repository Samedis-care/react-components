# Localized numbers are read without the format's symbols

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `utils` (`delocalizeNumber`, `parseLocalizedNumber`), and `CurrencyInput`, which
  parses with them

## What changed

`delocalizeNumber` and `parseLocalizedNumber` remove the symbols the format writes around a
number (the currency symbol, percent sign or unit of the options they get, in the current
locale, and the blanks between them and the number) before they read the number. A `.` or `,`
in such a symbol is no longer read as a separator.

| Locale | Options | Input           | Before  | Now     |
| ------ | ------- | --------------- | ------- | ------- |
| en     | XCG     | `Cg. 5.00`      | 0.5     | 5       |
| en     | XCG     | `Cg. 1,234.50`  | 0.1234  | 1234.5  |
| en     | XCG     | `-Cg. 1,234.50` | -0.1234 | -1234.5 |
| en     | XCG     | `Cg.5`          | 0.5     | 5       |
| nl     | XCG     | `Cg.1.234,5`    | invalid | 1234.5  |

## Why

The Caribbean guilder (XCG) is written "Cg." in most languages. With components-care in
English, a `CurrencyInput` in XCG read its own "Cg. 5.00" as 0.5: typing 5 saved 0.5, and every
later edit of the amount changed it again.

## Migration

Nothing to do in code. XCG amounts saved from a `CurrencyInput` with components-care in English
are too small: the field saved 0.5 for 5 and 0.1234 for 1,234.50.

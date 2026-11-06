# IntegerInputField ends the number at the decimal separator

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (`IntegerInputField`), and the renderer built on
  it (`ModelDataTypeIntegerRendererCC`)

## What changed

`IntegerInputField` reads the digits up to the current locale's decimal separator (`.` in en,
`,` in de) as the number, and ignores the digits after it. Before, it dropped every character
but 0–9 and joined the digits on both sides.

While the text has a decimal separator, the field shows it as typed, so digits typed after
the separator stay there. When the field loses focus, it shows the whole number.

| Locale | Text       | Before | Now  |
| ------ | ---------- | ------ | ---- |
| en     | `1.5`      | 15     | 1    |
| en     | `1,234.56` | 123456 | 1234 |
| de     | `7,5`      | 75     | 7    |
| en     | `.5`       | 5      | 0    |

A fractional value (7.5, shown as "7.5") is truncated on the first keystroke: a 1 typed after
it reports 7, not 751.

Group separators are still dropped wherever they are, so digits typed into a grouped number
keep working ("1.2345" is 12345 in de).

## Why

"1.5" typed or pasted into the field was saved as 15, and "1,234.56" as 123456. Typed key by
key, the decimal separator vanished as soon as it was typed, so the next digit joined the
number without the user noticing.

## Migration

Nothing to do. `onChange` is still called on every keystroke, and `onBlur` still reaches the
field.

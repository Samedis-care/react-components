# getNumberSeparator finds the group separator in every locale

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `utils` (`getNumberSeparator`, and through it `delocalizeNumber` and
  `parseLocalizedNumber`), the inputs that parse with them (`DecimalInputField`,
  `CurrencyInput`), and the renderers built on them

## What changed

`getNumberSeparator("group")` returns the locale's group separator also for locales that
show 4-digit numbers without one, and with options that turn grouping off
(`useGrouping: false`). Before, it returned `","` for them. In the languages CC offers,
that is es, it and regional variants such as it-CH (`'`) and ru-UA (a no-break space).

So es and it read a single `.` as a group separator where de does (1–3 digits that don't
start with 0, the `.`, then exactly 3 digits; see
[Localized numbers take either . or , as decimal separator](2026-10-15-localized-numbers-take-either-decimal-separator.md)):

| Locale | Input    | Before | Now   |
| ------ | -------- | ------ | ----- |
| es, it | `12.345` | 12.345 | 12345 |
| es, it | `1.234`  | 1.234  | 1234  |
| it-CH  | `1,234`  | 1234   | 1.234 |

## Why

es and it show 12345 as "12.345", and read that back as 12.345. A `DecimalInputField`
holding 12345 committed 12.345 on blur, and a `CurrencyInput` in JPY edited from
"12.345 JPY" to "12.346 JPY" saved 12. Every whole value from 10 000 to 999 999 was
affected.

## Migration

Nothing to do in code. Whole values from 10 000 to 999 999 that were entered, or tabbed
through, in a `DecimalInputField` or `CurrencyInput` with CC in es or it since 2026-10-15
may have been saved 1000 times too small.

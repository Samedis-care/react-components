# getNumberSeparator finds the decimal separator with any format options

- **Date:** 2026-10-15
- **Kind:** behavior
- **Scope:** `utils` (`getNumberSeparator`, and through it `delocalizeNumber`,
  `parseLocalizedNumber` and `CurrencyInput`)

## What changed

`getNumberSeparator` ignores the fraction and significant digit settings of the options it gets.
Before, options that show no fraction digits made it return `","` as the decimal separator,
whatever the locale: `{ maximumFractionDigits: 0 }`, a significant digit limit, or a currency
without minor units such as JPY.

## Why

For en, `parseLocalizedNumber("¥1,234", { style: "currency", currency: "JPY" })` returned 1.234
instead of 1234. A `CurrencyInput` with JPY in English then rounded that to no decimals, so
editing "¥1,234" saved 1.

## Migration

Nothing to do.

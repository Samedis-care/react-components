# Decimal and currency inputs open a keypad with a decimal separator

- **Date:** 2026-10-15
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (`DecimalInputField`, `CurrencyInput`), and the
  renderers built on them (`ModelDataTypeDecimalRendererCC`, `ModelDataTypeDecimalCurrencyRendererCC`)

## What changed

`DecimalInputField` and `CurrencyInput` set `inputmode="decimal"` on their input instead of
`inputmode="numeric"`. On touch devices the keypad now has a decimal separator key.
`IntegerInputField` keeps `inputmode="numeric"`.

## Why

`numeric` asks for digits only. iOS then shows a keypad without a comma or period, so a value
with a fractional part, such as 7.5 hours or 19.99 €, couldn't be typed on an iPhone.

The keypad offers the decimal separator of the device's region, which can differ from the app's
locale. The inputs read either one, see
[Localized numbers take either . or , as decimal separator](2026-10-15-localized-numbers-take-either-decimal-separator.md).

## Migration

Nothing to do.

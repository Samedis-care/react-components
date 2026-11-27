# DecimalInputField reads the typed text with its `format`

- **Date:** 2026-11-27
- **Kind:** behavior, type
- **Scope:** `standalone/UIKit/InputControls` (`DecimalInputField`), the renderer built on it
  (`ModelDataTypeDecimalRendererCC`), and `parseLocalizedNumber`

## What changed

`DecimalInputField` reads the text the user typed with the same `format` it shows the value
with, so the number it reports is the one the text shows:

- With `format={{ style: "percent" }}` the value 0.75 shows as "75%", and a typed "80%" or "80"
  is reported as 0.8. Before, the text was read as a plain number: 80, shown as "8,000%".
- A field left with nothing but the symbols of its format (the "%" of a percentage, the "€" of
  a currency format) is empty and reports `null`. Before, it was flagged as text without a
  number.
- The separators are those of the format in the components-care language.

`format` no longer takes `notation`, `compactDisplay` and `currencySign`: their text ("1.2K",
"1.2E3", "($5.00)") does not read back as the number.

`parseLocalizedNumber(text, options)` reads a text formatted with `style: "percent"` as the
fraction it shows: "75%" (or "75") is 0.75, as `(0.75).toLocaleString(locale, options)` is
"75%". Before, it returned 75.

## Why

An edit of a percentage multiplied the value by 100: the field showed the number as a
percentage but read the text back as a plain number.

## Migration

- Nothing to do for a `DecimalInputField` or `ModelDataTypeDecimalRendererCC` without `format`,
  or with options for digits and grouping only.
- Required for any app that passes `format` with `notation`, `compactDisplay` or
  `currencySign`: remove them, or the app no longer compiles.

  ```tsx
  // before
  <DecimalInputField value={value} onChange={onChange} format={{ notation: "compact" }} />
  // after
  <DecimalInputField value={value} onChange={onChange} />
  ```

- Required for any app that calls `parseLocalizedNumber` with `style: "percent"` and divides
  the result by 100 itself: drop the division, the result is the fraction now.

  ```ts
  // before
  const rate = parseLocalizedNumber(text, { style: "percent" })! / 100;
  // after
  const rate = parseLocalizedNumber(text, { style: "percent" });
  ```

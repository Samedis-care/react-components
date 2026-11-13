# DecimalInputField flags a separator without a digit instead of reporting NaN

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls/DecimalInputField`, and the renderer built on it
  (`ModelDataTypeDecimalRendererCC`)

## What changed

When the user leaves a `DecimalInputField` whose edited text does not parse (a separator
without a digit, such as `"."` or `","`), `onChange` is no longer called. The field keeps the
typed text and the previous value, is marked invalid, and shows a message under it, "Enter a
number, such as 1,234.56", with the example in the field's `format` and the components-care
language. This is the message `CurrencyInput` shows for the same text: the translation key
`standalone.uikit.number-input.invalid`. It takes the place of `helperText` while it shows and
is the input's accessible description (`aria-describedby`).

The message and the invalid state go away on the blur after a valid edit (also an emptied
field, which reports `null`) and when a new `value` replaces the text. A blur without an edit
keeps them.

## Why

`onChange` was called with `NaN`, and the field then showed "NaN". `NaN` passes `!= null`
checks such as a required-field validation, and `JSON.stringify` sends it as `null`, so the
form saved an empty value while it looked filled.

## Migration

Nothing to do. `onChange` of a `DecimalInputField` no longer receives `NaN`. Expect the message
under a field whose text is a lone separator, in place of its `helperText`. A model field shows
it above the form's own message.

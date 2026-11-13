# IntegerInputField flags numbers it can't hold, and never shows exponent form

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (`IntegerInputField`), and the renderer built on
  it (`ModelDataTypeIntegerRendererCC`)

## What changed

A whole number typed beyond ±9,007,199,254,740,991 (`Number.MIN_SAFE_INTEGER` to
`Number.MAX_SAFE_INTEGER`) is no longer reported: `onChange` is not called for it, so the
parent keeps the value it has. The field keeps the text as typed, is marked invalid and shows
"Enter a number from -9,007,199,254,740,991 to 9,007,199,254,740,991" in place of
`helperText`, as the input's accessible description. The range is formatted like the field,
without grouping with `noFormat`. The message stays when the field loses focus, until an edit
brings the number back into range or a new `value` arrives.

The message is the new translation key `standalone.uikit.number-input.out-of-range`
(`{{MIN}}` and `{{MAX}}` are the formatted limits), in every locale.

With `noFormat`, the value is formatted like without it, only without grouping: 1e21 shows as
"1000000000000000000000" instead of "1e+21". A fractional value shows with the language's
decimal separator ("7,5" in de) and at most three fraction digits.

## Why

Beyond that range a JavaScript number can't hold every digit. "12345678901234567" was saved
as 12345678901234568, and the field showed the changed digits as if they had been typed. With
`noFormat`, a value of 1e21 showed as "1e+21", and a digit typed after it was read together
with the exponent's digits: "1e+215" was saved as 1215.

## Migration

Nothing to do. Expect the message under an `IntegerInputField` whose number is out of range,
in place of its `helperText`. A model field (`ModelDataTypeIntegerRendererCC`) shows it above
the form's own message.

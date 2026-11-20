# A text field's helper text stays in its description when slotProps.htmlInput adds to it

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit/TextFieldWithHelp` and what is built on it: `IntegerInputField`,
  `DecimalInputField`, `CurrencyInput`, `ColorInput`, the selectors' input, and the UIKit model
  renderers (`ModelDataTypeIntegerRendererCC`, `ModelDataTypeDecimalRendererCC`,
  `ModelDataTypeDecimalCurrencyRendererCC`, the UIKit string and color renderers)

## What changed

An `aria-describedby` in `TextFieldWithHelp`'s `slotProps.htmlInput` (an object or a function)
is added after the id of the field's helper text. Until now it replaced that id, as it does in
MUI's `TextField`, so the helper text was no longer the input's description. The input, or a
select's combobox, is described by the helper text first, as it is shown, then by the given
ids. A list that already names the helper text (`<id>-helper-text`) is kept as it is, and an
empty or `undefined` `aria-describedby` there leaves the helper text as the description.

`TextFieldWithHelp` passes MUI an `id` in every case: the given one, else one from React's
`useId`, as MUI generated before.

In a `Form`, the message a number field shows about its own text is now part of its
description, before the form's message: "Enter a number, such as 1,234.56" after a lone
separator in a decimal or currency field, and the allowed range after an integer out of range.
A `helperText` given in a UIKit text field renderer's options is described the same way. The
renderers pass the form's description through `slotProps.htmlInput`, which until now
replaced it.

## Why

A screen reader user who typed "." into a decimal or currency field of a form and left it heard
that the field was invalid and the form's message, but not why the typed text was rejected.

## Migration

Nothing to do. An app that added the helper text's id to its `aria-describedby` by hand can
keep it (it is not repeated) or drop it. Tests that compare a field's whole description or its
`aria-describedby` find the helper text first.

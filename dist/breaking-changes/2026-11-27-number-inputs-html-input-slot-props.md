# The number inputs pass on a function-form `slotProps.htmlInput` and its ref

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (CurrencyInput, DecimalInputField,
  IntegerInputField), and with them the integer, decimal and currency model renderers
  (`RendererInteger`, `RendererDecimal`, `RendererDecimalCurrency`)

## What changed

- CurrencyInput, DecimalInputField and IntegerInputField take `slotProps.htmlInput` as a
  function too, as MUI's `TextField` does: it is called with the text field's state and
  its result reaches the `<input>`, next to the field's own `inputMode`. Before, a function
  was dropped and the input got none of its props. The model renderers of these inputs
  turn a field's `htmlInput` into a function when the field passes one, so there the
  `aria-describedby` that ties the form's message to the input now reaches it too.
- A `ref` in IntegerInputField's `slotProps.htmlInput` is set to the `<input>`, as on the
  other number inputs and TextFieldWithHelp. Before, the field's own ref for keeping the
  caret in place replaced it, and it stayed `null`. `inputRef` reaches the `<input>` as
  before.

## Why

Both are routes MUI's `TextField` and TextFieldWithHelp offer to the `<input>`; the number
inputs dropped them without a warning.

## Migration

Nothing to do. An app that passes a function as `slotProps.htmlInput`, or a `ref` in it, to
one of these inputs now gets its props and its ref on the `<input>`.

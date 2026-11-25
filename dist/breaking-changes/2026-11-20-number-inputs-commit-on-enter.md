# DecimalInputField and CurrencyInput commit an edit on Enter

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (`DecimalInputField`, `CurrencyInput`), and the
  renderers built on them (`ModelDataTypeDecimalRendererCC`,
  `ModelDataTypeDecimalCurrencyRendererCC`)

## What changed

Enter in a `DecimalInputField` or `CurrencyInput` commits the edit the way leaving the field
does: `onChange` is called with the typed number, and the field shows the value the parent
keeps, formatted, while it keeps the focus. Before, only the blur committed. The blur after
such an Enter calls `onChange` only after a further edit.

- Enter without an edit, and Enter that ends an IME composition, commit nothing.
- Text that does not parse is flagged on Enter as on a blur, and the previous value stays.
- `onBlur` is not called on Enter. An `onKeyDown` passed to the field is still called, after
  the commit.
- `DecimalInputField` passes the keydown event of Enter as `evt`, typed as a change event like
  the blur event it passes on a blur; `evt.target` is the input, so `evt.target.name` works.
  `CurrencyInput` passes the last change event of the edit, as before.

## Why

A browser submits a form on Enter in its text input without a blur. A form with a submit
button, or with a single text field, so got the value from before the edit while the field
showed the typed number. `IntegerInputField`, which reports on every keystroke, already
submitted what it showed.

## Migration

Nothing to do for a CC Form, or for code that only keeps the value `onChange` reports. A CC
Form whose only text field is a decimal or currency field, and a form with a submit button
around these inputs (uniforms' `SubmitField`), now save the typed number on Enter.

Required for code that used `onChange` of these two inputs to learn that the user left the
field (to mark it touched, validate it or save): it is now also called on Enter, while the
field keeps the focus. Pass `onBlur` for that.

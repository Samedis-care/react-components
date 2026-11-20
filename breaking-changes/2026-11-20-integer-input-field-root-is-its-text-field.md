# IntegerInputField's root is its text field, without a wrapper div

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (IntegerInputField), and with it the integer
  model renderer (`RendererInteger`)

## What changed

IntegerInputField no longer wraps its text field in a plain `<div>`. Its root is the text
field's root, MUI's `FormControl` (`display: inline-flex`), as in DecimalInputField and
CurrencyInput:

- `fullWidth` stretches the field in a flex row too (a `Stack direction="row"`, a flex
  toolbar). Before, the wrapper div was sized to its content there, so the field stayed as
  narrow as its input.
- `className`, `sx` and, on React 19, `ref` reach the outermost element. Before, they reached
  the `FormControl` inside the div, so the outermost element could neither be styled nor
  measured.
- Without `fullWidth`, the field flows like MUI's `TextField`: two IntegerInputFields in a
  block container sit side by side when they fit, where each used to take a line of its own.

## Why

The wrapper made IntegerInputField lay out differently from MUI's `TextField` and the other
number inputs: in a flex row `fullWidth` had no effect, and in block flow the field always
took a line of its own.

## Migration

- Nothing to do where IntegerInputField has `fullWidth` outside a flex row (every
  IntegerInputField in SCF, and the integer model renderer): it looks the same. In a flex row
  it now fills the row.
- Required for an IntegerInputField without `fullWidth` that has to sit on a line of its own:
  put it in a block container of its own, or pass `fullWidth`. Otherwise it now sits next to
  the inline content and fields around it.

  ```tsx
  <Box>
  	<IntegerInputField label="Count" value={count} onChange={handleCount} />
  </Box>
  ```

- Required for CSS that reaches the field through the wrapper (`& > div > .MuiFormControl-root`):
  select the `FormControl` directly (`& > .MuiFormControl-root`), or pass `className` or `sx`
  to IntegerInputField. Otherwise the rule no longer matches.

# TextFieldWithHelp passes on all of its slotProps and every onChange argument

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/UIKit/TextFieldWithHelp` and what passes its caller's `slotProps` on to
  it: `IntegerInputField`, `DecimalInputField`, `CurrencyInput`, `ColorInput`, and the UIKit
  string, string list, localized string, integer, decimal, currency and color renderers

## What changed

TextFieldWithHelp passes every entry of `slotProps` on to MUI's `TextField`, as an object or
a function. It used to keep only `input`, `htmlInput` and `inputLabel` and drop the rest, so
these now take effect:

- `formHelperText`: props of the helper text, e.g. `role="status"` or `aria-live`
- `select`: props of MUI's `Select` in `select` mode, e.g. `native: true`, `MenuProps`,
  `multiple`
- `root`: props of the field's root `FormControl`

`input`, `htmlInput` and `inputLabel` are extended as before (end adornment, the helper text
in the description, the shrunk label).

In a `select`, `onChange` gets the element of the chosen option as its second argument, as
from MUI's `Select`. It used to get the event only. `TextFieldProps` declares the event only:
a handler that wants the option declares it as an optional parameter,
`(event, child?: React.ReactNode) => …`.

## Why

TypeScript accepted these props, as on MUI's `TextField`, but the field ignored them: a
helper text could not be made a live region, and a select could not be made native or given
menu props.

## Migration

Nothing to do for an app that passes none of these. A field that passes `formHelperText`,
`select` or `root` in its `slotProps` now applies them, and a select's `onChange` that reads
its second argument now gets the chosen option.

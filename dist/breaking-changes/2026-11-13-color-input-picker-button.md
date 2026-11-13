# ColorInput has a "Choose color" button, and its open picker is a dialog

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (ColorInput), and through it the model's color fields
  (`ModelDataTypeColorRendererCC`)

## What changed

ColorInput renders a palette icon button at the end of its field, named "Choose color"
in the library's language, with `aria-haspopup="dialog"` and `aria-expanded`. A click on
it, or Enter or Space while it has keyboard focus, opens the color picker below the
field; it is disabled while the field is. Keyboard focus on it draws a 2px outline in
`palette.primary.main`. A click into the field still opens the picker, as before.

The button sits in the field's end adornment, after the content of a caller's own
`slotProps.input.endAdornment` and before the info button (`openInfo`).

The open picker is a modal dialog (`role="dialog"`, `aria-modal="true"`) named after the
field's label, or "Choose color" when the field has no label. Escape closes it and
focus returns to the button when the button opened it.

## Why

Only a click opened the picker, so keyboard users could not open it, and nothing told
screen-reader users that the field had one. The open picker was announced as an unnamed
region rather than a dialog (WCAG 2.1.1 Keyboard, 4.1.2 Name, Role, Value).

## Migration

Nothing to do. Expect the palette button at the end of every color field in screenshots
(IMF's app admin form has eight), and one more Tab stop per color field.

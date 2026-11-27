# The field-state controls and TextFieldWithHelp apply their `classes`

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`withMuiFieldState`: `TextFieldCC`, `FormControlCC`,
  `FormControlFieldsetCC`, `FormLabelCC`, `FormHelperTextCC`, `TextFieldWithHelp` and the
  inputs built on it, and every other control wrapped in it), `standalone/Selector`
  (`textFieldClasses` of the selectors built on `BaseSelector`)

## What changed

A `classes` prop passed to a control wrapped in `withMuiFieldState` reaches the MUI
component it wraps, which puts the class names on its elements as it does without the
wrapper: `<TextFieldCC classes={{ root: "my-field" }} />` puts `my-field` on the text
field's root element, `<FormLabelCC required classes={{ asterisk: "my-asterisk" }}>` puts
`my-asterisk` on the asterisk. `TextFieldWithHelp` passes its `classes` on the same way,
and so does a selector with `textFieldClasses`, to its text field.

Before, the wrapper dropped `classes` although TypeScript accepted them; `className` and
`sx` already reached the control.

## Why

These controls take the props of the MUI components they wrap, `classes` included, so a
class name passed to them has to reach that component, as it does on MUI's own.

## Migration

Nothing required. Code that passes `classes` to one of these controls, or
`textFieldClasses` to a selector, gets those class names, and the styles that target
them, now: check that these fields look as intended.

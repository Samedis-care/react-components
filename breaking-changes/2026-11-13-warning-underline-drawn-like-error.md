# A warning's underline is 1px at rest and 2px only while the field is focused

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit` (`withMuiFieldState`: `TextFieldWithHelp`, `TextFieldCC`,
  `FormControlCC` and every other control wrapped in it, in the standard and filled
  variants; the UIKit string renderers and the selectors that pass `warning`)

## What changed

With `warning`, a standard or filled field draws its underline as MUI draws an error's, in
`palette.warning.main`:

- At rest, and while hovered, the 1px underline takes the warning colour.
- The 2px underline appears only while the field is focused.

It used to show the 2px underline all the time. A field with both `warning` and `error`
now looks exactly like one with `error` alone; it also used to keep the 2px underline,
in the error colour. Outlined fields, the label and the helper text are unchanged.

## Why

The 2px underline is how MUI shows that a standard or filled field has focus. Drawn all
the time, focusing a field with a warning changed nothing visible: a text field showed
only its caret, a select no focus at all (WCAG 2.4.7).

## Migration

Nothing to do. Expect the thinner underline on fields with a warning in screenshots.

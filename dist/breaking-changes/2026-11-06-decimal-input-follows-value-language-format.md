# DecimalInputField shows its value in the current language and format

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls` (`DecimalInputField`), and the renderer built on
  it (`ModelDataTypeDecimalRendererCC`)

## What changed

While the user is not editing it, the field's text is `value` formatted with `format` in the
components-care language, at every render:

- A language switch re-formats the field at once: 1234.5 shows "1,234.5" in en and "1.234,5"
  after a switch to de. Before, the field kept the old text until `value` changed.
- A new `format` shows at once.
- After a commit the field shows the value the parent keeps. A parent that clamps or rounds the
  reported number (in `onChange`, or a model field's `onChange`) now sees its own number in the
  field. Before, the typed text stayed whenever the value did not change: a typed "15" stayed
  over a value clamped to 10, and "1.20" stayed instead of "1.2".
- The first render shows the value. Before, the field rendered empty and was filled in by an
  effect.

A new `value` still replaces text the user is typing. The blur after that no longer calls
`onChange` unless the user types again; before, it reported the new value back, rounded to the
shown digits.

While the user edits, the typed text stays, also over a language switch or a new `format`.

## Why

The text was set only when `value` changed. After a language switch the field showed the old
language's separators, and the next edit read them in the new language: "1,234.5" with an
appended digit became 1.23456 in de. After a commit the parent did not keep, the field showed a
number the form did not hold.

## Migration

Nothing to do. A field whose parent clamps or rounds the number now shows the kept number
after the blur, instead of the typed text.

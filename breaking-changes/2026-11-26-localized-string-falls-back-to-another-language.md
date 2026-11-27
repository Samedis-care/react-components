# A localized value without text in the UI language shows another language's text

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `ModelDataTypeLocalizedStringRenderer` (grid cells, read-only fields and
  `stringify`) and `ModelDataTypeStringLocalizedSingleRenderer` (`stringify`)

## What changed

When a localized value has no text in the components-care UI language, a grid cell, a
read-only field and `stringify` show the text of the field's `defaultLanguage` (while it
is in `enabledLanguages` and has text), otherwise the text of the first language in
`enabledLanguages` that has text. A record `{ de: "Infusionspumpe" }` in an English UI
shows "Infusionspumpe"; before, the cell and the field were empty unless the field had a
`getFallbackLabel`. With `defaultLanguage: "de"`, a record
`{ fr: "Pompe à perfusion", de: "Infusionspumpe" }` shows the German text, although `fr`
comes first in `enabledLanguages`. Grid cells and read-only fields mark that text with its language
(`<span lang="de">`), so screen readers read it in that language.

`getFallbackLabel` still comes first: while the UI language has no text, its text shows,
and the default language's or first enabled language's text only shows while it returns
an empty string (or `null`/`undefined`). It is not called while the UI language has text, as before.

Text of only whitespace counts as no text: it no longer hides the fallback, and
`stringify` returns `""` when no language has text other than whitespace.

`ModelDataTypeStringLocalizedSingleRenderer` has no enabled languages: its `stringify`
falls back to the first language the value holds that has text, in the value's order.
What its fields show doesn't change; they show the language their context names.

`stringify` is also what the CRUD import compares the update key with: a localized update
key now matches records by the fallback text when the UI language has none.

## Why

A record entered in another language looked empty in grids and read-only views, although
it has a text, so it could not be told apart from a record without one.

## Migration

Nothing to do. A `getFallbackLabel` that only picks another language's text from the
value can be removed; to show the record's own language first, pass it as
`defaultLanguage`.

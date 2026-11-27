# MultiLanguageInput shows a disabled field while `enabledLanguages` is empty, and a repeated language once

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls/MultiLanguageInput` (and so `ModelDataTypeLocalizedStringRenderer`)

## What changed

- While `enabledLanguages` is empty, e.g. while an app loads its languages, the field
  shows disabled with its label (and the asterisk of `required`), without a language
  code and without the translate button; a multiline field shows no language buttons.
  The input has no `name`. Once a language arrives, the field is the default language's
  editable field, as before. It used to be an editable field named `<name>-undefined`
  (a multiline field: with one empty language button) where every keystroke threw
  "Language not supported" and nothing reached `onChange`.
- A language listed twice in `enabledLanguages` is shown once, at its first position:
  one field (single-line) or one language button (multiline). It used to be shown twice,
  with both fields editing the same text.

## Why

An empty list has no language to save a text in, so the field cannot be edited; it
keeps its place and label so the form does not move when the languages arrive. Two
fields for one language edited the same value and made React warn about duplicate keys.

## Migration

Nothing to do. Expect the disabled field in screenshots of a form whose languages are
still loading. A field mounted while `enabledLanguages` is empty does not take
`autoFocus` (a disabled input cannot), also not when the languages arrive later.

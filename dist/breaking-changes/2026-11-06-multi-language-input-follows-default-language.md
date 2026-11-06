# MultiLanguageInput follows its default language after mount

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls/MultiLanguageInput` (and so `ModelDataTypeLocalizedStringRenderer`)

## What changed

The default language is the UI language when it is in `enabledLanguages` (and
`ignoreI18nLocale` is not set), otherwise `enabledLanguages[0]`. When it changes while the
field is mounted (the UI language changes, or `enabledLanguages` is reordered or arrives
after the first render), the field now follows it:

- `required` (the asterisk and the native attribute) moves to the new default language's
  field. It used to stay with the default language of the first render, so no field had
  it.
- A multiline field shows the new default language, until the user clicks a language code.
  A clicked language stays shown while it is enabled. When it is removed from
  `enabledLanguages`, the field shows the default language again.
- A multiline field that mounts with an empty `enabledLanguages` shows the default
  language once the languages arrive. It used to edit no language, so every keystroke
  threw "Language not supported" and nothing was saved.

## Why

The default language was computed on every render, but the multiline field's language and
the `required` mark were fixed at the first render.

## Migration

Nothing to do. A multiline field whose `enabledLanguages` is reordered after mount, as
for a record's own language, now opens on that language instead of the UI language.

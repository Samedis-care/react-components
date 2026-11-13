# MultiLanguageInput names every field with its language, inside a group named by the label

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls/MultiLanguageInput` (and so `ModelDataTypeLocalizedStringRenderer`)

## What changed

- Every language field is named with the label and its language, in the UI language:
  "Title (English)", "Title (German)", "Title (French)".
  - The field that shows the label (the default language's field, or the multiline
    textarea) reads the language with its label, as text that only assistive technology
    reads. The visible label is unchanged.
  - The other languages' fields of a single-line input, which show only their code, are
    named in an `aria-label` on the input.
  - Without a `label`, each field is named with its language alone ("German"), also the
    default one and the multiline textarea. The placeholder no longer names them.
- The container around the fields (and, in multiline mode, the language buttons) is a
  `role="group"` named by the label.

Nothing changes visually.

## Why

The other languages' fields had no name at all (or only the shared placeholder), and the
default field was named "Title" without its language, although it is not always the UI
language. A screen reader user could not tell the fields apart.

## Migration

- Tests or scripts that find the default field by its exact name ("Title") find it by
  "Title (English)" (in the UI language), a pattern such as `/^Title/`, or its `name`
  attribute (`title-en`).
- samedis-ui and identity-management-frontend need no change.

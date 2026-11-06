# MultiLanguageInput shows only `values`: a language without a value is an empty field

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/UIKit/InputControls/MultiLanguageInput` (and so `ModelDataTypeLocalizedStringRenderer`)

## What changed

Every language field is now a controlled input for its whole life. A language with no key
in `values` (or a `null` entry) shows an empty field. It used to make the field
uncontrolled, so the field kept the text it showed before:

- In a multiline field, switching to a language without a value showed the previous
  language's text, and typing saved that text plus the typed characters under the new
  language.
- In a single-line field, when the default language changed while mounted (a UI language
  switch, or a reordered `enabledLanguages`), the first field showed the old language's
  text under the new code.
- When the parent removed a language from `values` (a form reset, a refetch), the field
  kept the removed text.

The field also no longer shows typed text that the parent does not apply: what it shows
is always `values[language]`, as with MUI's `TextField`.

## Why

The text on screen did not match `values`, and typing saved another language's text
under the language shown.

## Migration

Required only for a direct `MultiLanguageInput` that does not write `onChange`'s object
back into `values` (a field that only listens). Such a field now reverts every
keystroke. Keep the values in state:

```tsx
const [values, setValues] = useState<MultiLanguageInputProps["values"]>({});
<MultiLanguageInput values={values} onChange={setValues} … />;
```

Fields rendered by a model (`ModelDataTypeLocalizedStringRenderer` in a `Form`) already
do this, and so does the one direct use in samedis-ui (the service interval dialog).
Nothing to do there.

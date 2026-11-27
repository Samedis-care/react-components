# A required file or image field shows an asterisk and is described as required

- **Date:** 2026-11-27
- **Kind:** behavior, i18n
- **Scope:** `GroupBox` (new props `required` and `dirty`, new class key `asterisk`),
  `FileUploadGeneric` and `ImageSelector` (new prop `required`, `dirty` drawn by the frame),
  `ModelDataTypeFilesRenderer` and `ModelDataTypeImageRenderer` in forms

## What changed

- `GroupBox` takes `required`. A required frame shows an asterisk after its title, as MUI's
  FormLabel does (a thin space and `*`, hidden from assistive technology, class
  `CcGroupBox-asterisk`, `classes.asterisk`, theme `styleOverrides.asterisk`). Its fieldset
  is described by a hidden "Required" in the user's language
  (`standalone.group-box.required`), before the ids given in `aria-describedby`. A frame
  without a title gets the description but no asterisk.
- `GroupBox` takes `dirty`, which draws the library's dirty marker (the dot and
  "(modified)" in the group's name) after the title and after the asterisk, the order of a
  MUI field with `required` and `dirty`.
- `FileUploadGeneric` and `ImageSelector` (normal and modern) take `required` and pass it
  and `dirty` to their frame. Their label is no longer wrapped in `labelWithDirtyMarker`:
  the frame draws the marker. The `profile_picture` variant shows no label and ignores
  both.
- In a form, the files and image renderers pass `visibility.required`: a field with
  `ModelVisibilityEditRequired` shows the asterisk, and its group is described as
  "Required", followed by the field's message.
- Theme `variants` of `CcGroupBox` match `required` and `dirty`, `false` when not set.

## Why

A required file or image field looked and sounded like an optional one, while the text
fields next to it showed MUI's asterisk: users learned that it is required only from the
error after saving (WCAG 3.3.2 Labels or Instructions). ARIA allows `aria-required` on
neither the field's group nor its upload button, so the group says it in its description,
as a signature field's button does.

## Migration

Required for any app that makes a files or image field required through `validate` alone,
with an editable visibility that is not required: the field shows no asterisk. Give it a
required visibility next to the validator, so it shows the asterisk and the validator
still refuses an empty value:

```ts
file: {
	type: new ModelDataTypeFilesRenderer({ maxFiles: 1 }),
	visibility: {
		overview: ModelVisibilityDisabled,
		create: ModelVisibilityEditRequired, // was ModelVisibilityEdit
		edit: ModelVisibilityEditRequired,
	},
	validate: (value: FileData[]) => (value.length > 0 ? null : t("file_required")),
},
```

Required for any app whose tests read the description of a required files or image field,
or of a `GroupBox`, `FileUploadGeneric` or `ImageSelector` given `required`: it now starts
with "Required", e.g. "Required At least one file is required".

Required for any app that passes `labelWithDirtyMarker(label, dirty)` as the `label` of a
`GroupBox` that it also gives `dirty`: pass the plain label, or the frame draws two dots.
A `GroupBox` that keeps getting its label from `labelWithDirtyMarker` without `dirty` looks
as before.

# A required string list shows an asterisk and is described as required

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `ModelDataTypeStringArrayRendererCC` in forms

## What changed

A string list field whose visibility is required (`ModelVisibilityEditRequired`, or any
visibility with `required: true`) marks its frame with `GroupBox`'s `required`, as the files
and image fields do: an asterisk after the frame's title, and its group is described as
"Required" in the user's language (`standalone.group-box.required`), followed by the
field's message. The frame is marked with and without entries.

Its inputs are unchanged: only the input for a new entry of an empty list is required.

## Why

Once a required string list had an entry, none of its inputs was required and its frame
showed nothing, so the field looked and sounded like an optional one, unlike the files,
image and outlined fields next to it (WCAG 3.3.2 Labels or Instructions).

## Migration

Required for any app that makes a string list field required through `validate` alone,
with an editable visibility that is not required: the field shows no asterisk. Give it a
required visibility next to the validator, so it shows the asterisk and the validator still
refuses an empty list:

```ts
tags: {
	type: new ModelDataTypeStringArrayRendererCC(),
	visibility: {
		overview: ModelVisibilityDisabled,
		create: ModelVisibilityEditRequired, // was ModelVisibilityEdit
		edit: ModelVisibilityEditRequired,
	},
	validate: (value: string[]) => (value.length > 0 ? null : t("tags_required")),
},
```

Required for any app whose tests read the description of a required string list field's
group: it now starts with "Required", e.g. "Required At least one tag is required".

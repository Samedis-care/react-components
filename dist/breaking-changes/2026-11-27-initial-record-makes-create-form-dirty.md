# A create form is dirty by the fields its initialRecord sets

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `Form` (`initialRecord`, and what follows the dirty state: `dirty`,
  `dirtyFields`, `initialValues`, the "dirty" event, the leave guard of the form pages,
  `FormAutoSave`, the Save of `DefaultFormPage` / `EditOnlyFormPage` and
  `FlowEngineSaveButton`, `submit`, nested forms)

## What changed

The dirty baseline of a create form (`id={null}`) is the model's default record. The fields
`initialRecord` sets are applied to the values as before, but count as changes to the new
record, no longer as part of its baseline. A create form whose `initialRecord` sets a field
to another value than the model's default for it opens dirty:

- the Save of `DefaultFormPage`, `EditOnlyFormPage` and `FlowEngineSaveButton` is enabled
  as the form opens, and `submit` / `safeSubmit` save the record also without an edit
  (before, they did nothing on an untouched form);
- leaving the untouched form through a form page (Back, a navigation, closing the tab,
  closing a `FullFormDialog`) asks "Leave form page?";
- `FormAutoSave` saves it after its pause;
- `showDirtyState` marks those fields;
- a nested create form (`nestedFormName`) with such an `initialRecord` makes its parent
  dirty, and the parent's save creates it, also when the user never touched it;
- `initialValues` (the form context, a visibility callback's second argument, a renderer's
  `initialValue`) holds the model's defaults for those fields, not the `initialRecord`'s
  values.

A field `initialRecord` sets to its default, or one the user changes back to the default,
does not count. A create form with only the model's defaults opens clean, as before. An
existing record (with an id) ignores `initialRecord`, as before.

## Why

`initialRecord` pre-fills a new record: from a template, as a copy of another record, or
with the record it is created for. Those values are what the form is about to save, so the
form has something to save as it opens, and leaving it discards them. The model's defaults
are what every new record starts with, so they are no change.

## Migration

Nothing to do for a create form whose `initialRecord` holds values the user is meant to
save (a template, a copy): it now opens with Save enabled and asks before it is left.
Expect that in screenshots.

Required for any app that passes `initialRecord` values which should not count as a change,
e.g. the id of the record a new one belongs to, or a flag one screen sets for its records:
move them into the model's defaults, else the untouched form asks before it is left and a
nested create form is saved with its parent. A model built from parameters returns them from
the field's `getDefaultValue`:

```ts
const makeFloorModel = (params: { buildingId: string | null }) =>
	new Model(
		"floors",
		{
			// ...
			building_id: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Building",
				visibility: hiddenVisibility,
				getDefaultValue: () => params.buildingId, // was: initialRecord={{ building_id }}
				customData: null,
			},
		},
		connector,
		[params.buildingId], // cache keys
	);
```

Required for any app that passes an `initialRecord` key set to `undefined`: `undefined`
replaces the model's default and counts as a change when the default is something else.
Leave the key out instead (`...(clientId && { tenant_id: clientId })`).

Required for any app with a nested create form (`nestedFormName`, `id={null}`) that passes
`initialRecord` and must not be created untouched (a row the user adds and may leave empty):
the parent's save now creates it. Pass `disableNestedSubmit` until the user has entered
something, or render the nested form only once there is something to save.

Required for any app with its own button on a create form that relies on an untouched,
pre-filled form not being saved: a `disabled={!dirty}` button is enabled as the form opens,
and a `submit` / `safeSubmit` call validates and saves it.

Required for any app that reads `initialValues` (the form context, a visibility callback's
second argument, a renderer's `initialValue`) on a create form to learn what `initialRecord`
set: read the values, or the `initialRecord` the app passed.

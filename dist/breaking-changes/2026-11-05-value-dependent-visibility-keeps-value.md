# A field disabled by a visibility callback keeps its value

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `backend-integration/Model`, `backend-components/Form`

## What changed

This is about a field whose `create` or `edit` visibility is a callback that returns a disabled
visibility for some values and an enabled one for others. For example:
`(values) => values.reason === "other" ? ModelVisibilityEditRequired : ModelVisibilityDisabled`.

- **New records:** the model's default record gives such a field its default value
  (`getDefaultValue`, else its type's default), also when the callback disables it for empty
  values. `getDefaultValue` is called for these fields now. A field whose visibility is a
  disabled `Visibility` object (not a callback), like the usual `id`, still gets no default
  value.
- **Loaded records:** a loaded record keeps such a field's value when the callback disables it
  for that record (the `edit` and `create` views of `applySerialization` / `deserialize`). The
  model used to drop the value. Fields disabled by a `Visibility` object are still dropped, and
  the `overview` view is unchanged.
- **Saves:** a save still leaves the field out while the callback disables it for the values
  being saved.

So when an edit enables such a field, a form renders it with its value and validates it like
any other field. A required field left empty now blocks the save with its validator's message.
It used to be `undefined`, which skipped validation, so the record was saved without it. A
field that is enabled when the record is saved is sent with its value, also when the user did
not change it. It used to be left out of the request.

In samedis-ui this changes TrainingTask's `instructor` and `instructor_id` on tasks loaded with
briefing type "employee". Their form values now hold the loaded instructor. If the briefing
type is changed, the instructor fields show that value, and their validators run. No
value-dependent field in samedis-ui or identity-management-frontend is disabled for empty
values, so new records stay as they were.

## Why

A field that another field's value enables had no value. It was never validated, so a
required field was saved empty.

## Migration

Nothing to do. A field can now be disabled by the values of other fields through its
visibility callback: it is validated once it is enabled, and it is not saved while it is
disabled.

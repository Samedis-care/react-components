# CrudSelect lists a create that went through when deserialize fails on its response

- **Date:** 2026-11-06
- **Kind:** behavior, type
- **Scope:** `backend-components/Selector` (`useCrudSelect`, `CrudMultiSelect`,
  `CrudMultiSelectWithGroups`, `FormCrudMultiSelect`), `backend-components/Form`
  (`PartialApplyFailure`)

## What changed

- When `deserialize` throws or rejects for the record a create returned, the row is
  listed anyway: as the entry that was created (after `prepareNewEntry`), with the row's
  `id` as its `value`. The field shows that entry, and removing it deletes the row.
  Previously the entry was not listed, and the write was reported as a failed create.
- The failure is reported in `error` as a `PartialApplyError` failure with the new action
  `"read"`, whose `entry` is the listed entry. `PartialApplyFailure["action"]` is
  `"create" | "update" | "delete" | "read"`. The message has the same form as before,
  `<label>: <error message>`.
- `addToSelection` (the control's ref) does the same: the entry is listed, and the promise
  rejects with a `PartialApplyError` whose failure has the action `"read"`. It used to
  reject with `deserialize`'s error and list nothing.

## Why

The row exists whatever `deserialize` does: on the server, or, through
FormCrudMultiSelect, as a queued create that the form sends on save. While it was not
listed, the user was told that adding it failed, could not remove it, and picking it again
created a second row.

## Migration

Required for a `serialize` that does not take a kept entry's row id from `value`: an entry
listed this way has the fields of the entry that was created, and the row id only in
`value`. A `serialize` that reads the id from another field (`id: data.id`), or spreads the
entry (whose `id`, copied from a search record, is the looked-up record's id), sends no id
or the wrong one when the user removes the entry, and the removal fails. Take the id from
`value` for every entry that is not new:

```ts
serialize={(data) => ({
	id: data.value.startsWith("to-create-") ? undefined : data.value,
	// the join record's other fields
})}
```

Required for code that handles every `action` of a `PartialApplyFailure` (an exhaustive
`switch`, a `Record<PartialApplyFailure["action"], …>`): add `"read"`, or it does not
compile. A `read` failure means the entry is listed, but `deserialize` failed for it.

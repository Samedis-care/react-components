# A CRUD without a record page applies gridProps.onAddNew and shows newPermissionHint only to users who may not create

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-components/CRUD`

## What changed

For a CRUD without a record page (`children={undefined}`), for users with `newPermission`:

- `gridProps.onAddNew` applies: a function gives the grid a New that calls it, a string a
  disabled New with that tooltip, an array its buttons. Before, it was dropped and the grid
  had no New.
- `newPermissionHint` is no longer shown to them. Before, they got a disabled New with the
  hint as its tooltip. Without `gridProps.onAddNew` they get no New, as there is no create
  form to open.

Unchanged: users without `newPermission` get `newPermissionHint` as a disabled New, or no
New without it; `gridProps.forceAddNew` is passed on as it is; a CRUD with a record page
behaves as before.

## Why

Only the grid's default New needs a record page: it opens the create form. A list that
creates its records another way (a dialog, a wizard) passes `gridProps.onAddNew`, and that
New was missing for the users who may create, while `newPermissionHint` told them they had
no permission.

## Migration

Required for an app that passes `gridProps.onAddNew` to a CRUD without a record page and
expects no New there: that grid now shows a New to users with `newPermission`. Remove
`onAddNew` from such a list, or set `newPermission={false}`.

A list that checks the permission itself to pass `gridProps.forceAddNew` can now use
`newPermission` and `gridProps.onAddNew` instead. The function gets `showNew`, which opens
the create form; a CRUD without a record page has none, so don't call it there.

```tsx
<CRUD
	newPermission={"briefings.writer"}
	gridProps={{ onAddNew: showAddBriefingDialog }}
	// was: newPermission={false} and
	// gridProps={{ forceAddNew: canCreate ? showAddBriefingDialog : undefined }}
	{...otherProps}
>
	{undefined}
</CRUD>
```

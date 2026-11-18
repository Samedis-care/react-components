# A lazy control reads its connector params once, for the list and the save alike

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`useLazyCrudConnector`, and with it `FormCrudMultiSelect`, `FormCrudFileUpload`, `FormCrudMultiImage`)

## What changed

A control built on `useLazyCrudConnector` reads `field` when it mounts, and `getEndpoint`,
`onParentIdChange`, `extraParams`, `getConnector` and `configureConnector` when its connector is
built, the first time a control with that `field` renders in its Form. The connector then lives
as long as the Form, and both its reads and every save use what it was built with. A later value
of any of these params is ignored.

The list already behaved that way. The save and the Form's bookkeeping did not always:

- **`getEndpoint` and `onParentIdChange`:** the save used the ones of the mount that last
  registered it. A control that mounted again under the same `field` with another `getEndpoint`
  (a tab shown again, a `key` that changed) kept listing the first collection but sent its queue
  to the new endpoint. A change of the Form's `onlySubmitMounted` did the same. The save now uses
  the ones the connector was built with.
- **`field`:** a new name moved the custom dirty flag and, in flow forms, the staging of the
  queue, while the connector and the save stayed under the first name. The Form could stay dirty
  after a save that sent everything. Now nothing moves: the connector, the save, the dirty flag
  and the staging stay under the first name, and so do the messages of `FormCrudMultiSelect`'s
  `validate` (`errors["<field>_<key>"]`).

A Form given another record (`id` or `model`) starts over, as before: its controls build new
connectors from the params they have then.

## Why

What a control lists and what its save writes must be the same collection. Sending the queue to
another endpoint than the one the list came from wrote picks and uploads into a collection the
user never saw, and removed records by ids that belong to another one.

## Migration

**Required for every lazy control whose `getEndpoint`, `extraParams`, `getConnector`,
`configureConnector`, `onParentIdChange` or `field` can change while the same record is open**,
e.g. because it depends on a form value the user edits or on a prop that changes. Without the
step below such a control keeps listing and saving the first collection. Give the control a
`field` that changes with the collection, and a `key` that changes with it, so that it mounts
again and gets the connector of that `field`:

```tsx
// clientId can change while the record is open
const field = `roles_${clientId}`;
return (
	<FormCrudMultiSelect
		key={field}
		field={field}
		getEndpoint={(id) => `v1/clients/${clientId}/orgs/${id}/roles`}
		initialId={recordId}
		{...selectorProps}
	/>
);
```

A `key` alone is not enough: a control that mounts again under the same `field` gets that field's
connector back, queue included. A queue left under the previous `field` stays in the Form like
the queue of a hidden control: without `onlySubmitMounted` it keeps the Form dirty and the next
save sends it to the collection it was made for.

Nothing to do for params that change only with the record: a Form given another record starts
over.

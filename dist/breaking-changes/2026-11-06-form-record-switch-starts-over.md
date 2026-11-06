# A Form given another record starts over

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Form`

## What changed

When a mounted `Form` gets another `id`, or another `model`, it now starts over as if it had
just been mounted:

- the page shows the loader for a render and is mounted again, so its local state resets;
- the values, touched state, dirty baseline and refetch baseline come from the new record;
- errors, warnings, the last save error, the custom state (`useFormState`, `setCustomState`,
  the state of nested forms) and the custom dirty fields are cleared.

This holds whether or not the new record is already in the query cache. Switching to `id={null}`
starts from the model's default values plus `initialRecord`, without the previous record's id.

Two changes are not another record:

- From `null` to the id of the record the form has just created: the form keeps its values and
  its page.
- A model object created again with the same model id and cache keys.

Before, a form that switched to a cached record treated the switch as a refetch of the previous
record. It showed the new id with the previous record's edits merged in, was dirty, and saved
them into the new record. A switch to `id={null}` kept the previous record's id, so Save
updated that record instead of creating one. A switch to a record that was not cached reset
the values but kept the previous record's errors and warnings.

A `Form` keyed by its id (`key={id}`, as CRUD and most samedis-ui screens do) is not affected.
It was already mounted again for each record.

## Why

A form must show and save the record it was given. Keeping the previous record's edits, id or
errors saved wrong data or blocked the save with messages that did not apply.

## Migration

Nothing to do. A `Form` can now switch records through its `id` prop without a `key`.

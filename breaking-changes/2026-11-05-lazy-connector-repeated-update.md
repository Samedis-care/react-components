# LazyConnector writes a record updated twice before the save

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `backend-integration/Connector`

## What changed

`LazyConnector.update` of a record that already has an update or a create queued:

- A second update of a record before `workQueue` used to send nothing at all, so neither
  update reached the backend. The queue now sends one update with both.
- The queued request carries the new data over the data it was queued with, which is what
  the two requests would have written one after the other. An update that carries only some
  fields keeps the fields of the update before it. For a create, the record is created with
  the fields of both, under the fake id the create handed out.
- `index` and `read` serve the record with the new data at once. After an update of a
  queued create they used to serve the create's data until the queue was worked.
- `update` returns the record as the queue will write it (a copy). It used to return the
  data it was given.

## Why

Changing a queued entry twice before the form was saved lost both changes, and the save
still succeeded and left the form clean. With `FormCrudMultiImage` (and app wrappers built on
`useLazyCrudConnector` and `CrudMultiImage`), replacing the same image twice before the
save kept the original image on the server.

## Migration

Nothing to do.

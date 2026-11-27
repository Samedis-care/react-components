# A lazy control of a new record no longer reports the parent id "null"

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`useLazyCrudConnector`, and with it `FormCrudMultiSelect`, `FormCrudFileUpload`, `FormCrudMultiImage`)

## What changed

`onParentIdChange` is called only with an id the parent record has:

- For an existing record, once the control that built the connector has mounted, with
  `initialId`, as before.
- For a new record (`initialId` null), no longer at mount with the string `"null"`. Its first
  call is the save's, with the created record's id.
- On every save, with the saved record's id, before the queue is sent, as before.

`getEndpoint` still gets the string `"null"` for a new record, to build the connector; its list
is never requested from that endpoint.

A new param, `onQueueSent(id, connector)`, runs on every save once the queue was sent (also when
nothing was queued), and the save waits for it. `connector.mapId` then gives the server's id of
a record created through the queue.

## Why

`"null"` is no id, so every callback had to filter it out by hand, and it was the callback's only
call for a new record before the save.

## Migration

Nothing required for a callback that ignores `"null"`; that check can go.

Required for any app that reacts to `onParentIdChange("null")` at mount, e.g. to reset state for
a new record: do that from `initialId === null` when the control mounts instead.

Any app that replaces `LazyConnector.workQueue` to act once the save sent the queue (e.g. to
store a primary image under the server's id of a new image) can pass `onQueueSent` instead:

```tsx
const { connector } = useLazyCrudConnector({
	...params,
	onQueueSent: (id, connector) =>
		savePrimary(id, primaryId && connector.mapId(primaryId)),
});
```

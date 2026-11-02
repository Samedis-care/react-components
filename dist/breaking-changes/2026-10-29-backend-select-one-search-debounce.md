# Backend selectors keep one search debounce while mounted

- **Date:** 2026-10-29
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`BackendSingleSelect`, `BackendMultiSelect`,
  `BackendMultipleSelect`, `BackendMultiSelectWithTags`)

## What changed

The selectors debounced their search with a new debouncer whenever `model`, `sort`,
`modelToSelectorData` (or another input of the search) changed. A `sort` or
`modelToSelectorData` written inline changes on every render, so a search typed across a
parent render was sent once per debouncer, and the selector got a new `onLoad` on every
render. A search still waiting for the debounce was sent even after the selector unmounted.

Now each selector keeps one debouncer for as long as it is mounted:

- A search waits for the debounce as long as the user keeps typing, whatever the parent
  renders in between, and is sent once.
- When it is sent it uses the props passed last, also if `model`, `sort` or
  `modelToSelectorData` changed while it waited.
- A search still waiting when the selector unmounts is not sent.
- A new `searchDebounceTime` (`groupSearchDebounceTime`, `dataSearchDebounceTime`) applies
  from the next keystroke.

`debouncePromise` (`utils`) has a new `cancel()`, which drops the calls waiting for the
timeout without settling their promises, and accepts a getter as its timeout.

## Why

Typing across a parent render sent outdated searches, and a selector that was gone still
sent its pending search and set state on its unmounted view.

## Migration

Nothing to do. A selector that unmounts within its debounce no longer sends that search.

# The form engine announces dirty state changes as events

- **Date:** 2026-09-01
- **Kind:** behavior, type
- **Scope:** `backend-components/Form`, `utils`

## What changed

`FormContextData` and `FormContextDataLite` gained `addEventListener` /
`removeEventListener`. The form engine dispatches a `dirty` event
(`{ dirty: boolean }`) the moment it sees the flag change, rather than only through the
next render:

```ts
const { addEventListener, removeEventListener } = useFormContextLite();
useEffect(() => {
	const listener = (event: FormDirtyEvent) => (dirtyRef.current = event.dirty);
	addEventListener("dirty", listener);
	return () => removeEventListener("dirty", listener);
}, [addEventListener, removeEventListener]);
```

The event reports *changes*. A listener subscribing later reads the current state off
`FormContextData.dirty`, which is unchanged.

`BasicFormPage` uses it for its unsaved-changes guard, which changes two things:

- **Submitting and then leaving in one go works.** `await submit(); goBack()` used to be
  stopped by the "you have unsaved changes" dialog: the record was already saved, but the
  guard still held the dirty flag from before the submit, because React had not
  re-rendered yet. The guard now reads the live state.
- **The guard is no longer switched off while a submit is in flight.** That was the
  workaround for the above, and it meant an unrelated navigation during a submit went
  through unguarded — including a submit which was about to fail validation and leave the
  form dirty. Navigating away mid-submit now asks, unless the form is already clean by
  then (which is the case for the form engine's own post-save redirect).

The same live state now drives the `UnsafeToLeave` lock and, in a `FullFormDialog`, the
close block — so closing the dialog straight after a save is no longer refused either.

`TypedEventTarget<Events>` — the small typed emitter behind this — is exported from
`utils`. It has the DOM's `addEventListener` / `removeEventListener` / `dispatchEvent`
names and bound methods, but no bubbling, capturing or cancellation: an event is a payload
handed to each listener. A throwing listener is logged and skipped, so one bad listener
can't fail a submit.

## Why

The dirty flag is derived from render state, so every consumer of it was one render behind
the form engine. For the navigation guard that lag is a bug, not an inconvenience: it
blocks the caller which knows best that there is nothing left to save.

## Migration

Nothing to do for the common case — the guard just stops firing where it had no business
firing.

- Code which builds a `FormContextData` or `FormContextDataLite` object by hand (test
  doubles, mocks) has to add `addEventListener` and `removeEventListener`.
- A flow which relied on navigating away mid-submit *without* being asked has to make sure
  the form is clean at that point, or navigate with the form's own `goBack(_, true)`
  (`forceNavigate`), which skips the confirmation as before.

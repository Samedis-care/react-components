# A pending auto-save is dropped when the form unmounts

- **Date:** 2026-11-06
- **Kind:** behavior, type
- **Scope:** `backend-components/Form` (`FormAutoSave`), `utils` (`debounce`)

## What changed

`FormAutoSave` waits `debounceTime` milliseconds after the last change before it saves.
A save still waiting when the form unmounts no longer runs. Before, it ran once the time was
up, on the form that was gone.

A new `debounceTime` now also applies to a save that is still waiting: when the prop changes
while the form has unsaved changes and is not saving, the form is saved the new
`debounceTime` milliseconds later. Before, the waiting save ran after the old time, and the
next change started a second timer next to it.

`debounce` (`utils`) returns a function with a `cancel()` method, which drops the call
waiting for the timeout. The return type is `CancelableDebounceFunc`, which extends
`DebounceTargetFunc`; both types are exported from the package root.

## Why

A user who edits a form with `FormAutoSave` and leaves the page within the pause is asked
whether to discard the change. After "discard" the form unmounted, and the waiting save
still saved the discarded change. A failure of that save was shown nowhere.

## Migration

Nothing to do. A form with `FormAutoSave` that unmounts less than `debounceTime` after a
change no longer saves that change by itself; with `debounceTime={0}` nothing waits, so
nothing changes there. A nested form keeps its change in the parent form while it is
unmounted: the parent's save includes it, and with `onlySubmitNestedIfMounted` its auto-save
saves it once the nested form is mounted again.

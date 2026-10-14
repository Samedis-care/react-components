# Form reads initialRecord when the record loads

- **Date:** 2026-10-14
- **Kind:** behavior
- **Scope:** `backend-components/Form`

## What changed

`Form` applies `initialRecord` when its server data loads, to the form data and to the dirty
baseline alike. Passing a new `initialRecord` afterwards, a new object or new values, no
longer changes either.

It used to replace the dirty baseline, but not the form data, every time the prop changed
identity. An `initialRecord` written inline in a component that re-renders therefore reset
the baseline on every render. Before a save that went unnoticed, because the content was the
same. After a nested form (`nestedFormName`) created its record, the form keeps `id={null}`,
so a re-render put the baseline back to the empty new record while the form data held the
saved one: the nested form reported itself dirty again, and with it the parent form, whose
unsaved-changes guard then asked "Leave form page?" right after a successful save.

## Why

The baseline and the form data are meant to come from the same `initialRecord`, so that an
untouched form is clean. Following the prop for one of them but not the other broke that
whenever it changed.

## Migration

Nothing to do where `initialRecord` is fixed while the form is open, which covers inline
objects with the same content. A form that should pick up a different `initialRecord` while
it is open has to be remounted (give it a `key` that changes with it), so that it loads again.

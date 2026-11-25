# useFormState restores a stored null and follows a changed name

- **Date:** 2026-11-21
- **Kind:** behavior, type
- **Scope:** `backend-components/Form`: `useFormState`, `FormContextData` (`hasCustomState`)

## What changed

`useFormState(name, initialState)` brings back a stored `null` or `undefined` when the component
mounts again. It used to fall back to `initialState` for both, so a choice reset to `null` came
back as the initial value after a remount. `initialState` is now used only while nothing is
stored under the name.

When `name` changes while the component stays mounted, the hook shows the state stored under
the new name, or `initialState` if there is none, and the old name keeps its own state. It used
to keep the old name's state and write it under the new name.

`FormContextData` has a new member, `hasCustomState(field)`: true once `setCustomState` wrote the
name, also with `null` or `undefined`. `useFormState` uses it to tell "nothing stored" apart from
a stored `null`.

## Why

A `null` (or `undefined`) set through `useFormState` was lost on the remount the hook exists
for. A changed name overwrote whatever another component had stored under it.

## Migration

Nothing to do for `useFormState` calls with a fixed name. A test that mocks `useFormContext`
and renders a component using `useFormState` must add `hasCustomState` to the mocked context.

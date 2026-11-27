# useFormState reads the Form's lite context

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/Form`: `useFormState`

## What changed

`useFormState` reads the Form's custom-state callbacks (`getCustomState`, `setCustomState`,
`hasCustomState`) from `FormContextLite` (`useFormContextLite`) instead of `FormContext`. A
component that calls it no longer renders again when a value, an error, a warning or a touched
flag of the Form changes; it renders for its own state, its props and the contexts it reads
itself, as before.

Outside a Form, the hook throws "Form Context (Lite) not set. Not using form engine?" instead
of "Form Context not set. Not using form engine?".

## Why

`FormContext` gets a new value with every change of a value of the Form. A component that kept
state with `useFormState` rendered again with each keystroke in any field of the Form, although
the hook only uses callbacks that never change. The lite context does not change with the
values, so a keystroke elsewhere in the Form no longer reaches it.

## Migration

Nothing to do for a component that reads `useFormContext()` itself: it renders again with the
Form's values, as before.

**Required for any app that provides `FormContext` again around a component that calls
`useFormState`** (e.g. to render a part of the form in a dialog outside the Form's tree):
provide `FormContextLite` there too, with the Form's lite context, as described in
[Lazy controls and CrudMultiSelect's validation read the Form's lite context](2026-11-27-lazy-controls-read-lite-form-context.md).
Without it the hook throws, or keeps its state in another Form further up the tree.

**Required for any test that replaces `useFormContext` with a stub** and renders a component
that calls the real `useFormState`: provide `FormContextLite` with `getCustomState`,
`setCustomState` and `hasCustomState`, or replace `useFormState` as well.

**Required for any component that calls `useFormState` and, while it renders, reads the Form's
values through `getFieldValue` or `getFieldValues` of `useFormContextLite()`**: these read the
latest values without subscribing to them, and the hook no longer renders the component again
when they change. Read `values` from `useFormContext()` instead if the component shows them.

# A nested form with disableNestedSubmit doesn't make its parent dirty

- **Date:** 2026-10-14
- **Kind:** behavior
- **Scope:** `backend-components/Form`

## What changed

A nested form (`nestedFormName`) with `disableNestedSubmit` no longer reports its changes
to the parent form. The parent's `dirty` flag, its dirty event and everything reading
them (the unsaved-changes guard of `BasicFormPage`, `UnsafeToLeave`, a `FullFormDialog`'s
close block) ignore it. Switching the flag on clears the nested form's share of the
parent's dirty state at once, and switching it off restores it.

It used to mark the parent dirty like any nested form, while the parent's submit skipped
it. The parent could not become clean by saving, so leaving after a successful save asked
"Leave form page?".

## Why

The parent's dirty state stands for what its save would write. A nested form the parent
neither validates nor submits is not part of that.

## Migration

Nothing to do for the usual case. Code that used a nested form with `disableNestedSubmit`
to keep its parent dirty, and so to keep the unsaved-changes guard armed, has to mark the
parent dirty itself, with `setCustomFieldDirty` on the parent's form context.

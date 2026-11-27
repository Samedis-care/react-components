# CrudSelect applies a change made while another one is written after it, and only what it changed

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`useCrudSelect`, and with it `CrudMultiSelect`,
  `CrudMultiSelectWithGroups`), `backend-components/Form/CrudControls`
  (`FormCrudMultiSelect`)

## What changed

`handleSelect` (which the field and end adornments call) and `addToSelection` (the ref) now
apply their changes one after another, in the order they were made:

- A change waits until the writes of the changes before it have settled, and is applied
  after the selection has loaded. `handleSelect`'s promise resolves once its own change is
  applied.
- A change is the difference between the selection of the render whose `handleSelect` was
  called and the one it is handed: the entries it creates, deletes, updates or restores. Only
  that difference is applied, to the selection as the changes before it left it. Deleted
  entries leave the selection, updated ones are replaced in their place, created and
  restored ones are added at the end. The order of the `ids` handed over no longer reorders
  the selection.
- Left out of a change, as the same gesture reported again: the removal of an entry that a
  change before is deleting or has deleted, the pick of a record (by `getIdOfData`) that a
  change before is creating or has linked, and an update that a change before has written.
- An entry whose removal or update the backend refused stays where it is listed. It used to
  move to the end of the selection.
- A change that writes nothing leaves `error` as it is. It used to clear it.
- A change whose turn comes while the control is disabled, read-only or blocks writes (a
  Form's save) writes nothing, as `addToSelection` already did. So does one whose turn
  comes once the control has unmounted: `addToSelection` then rejects, where its promise
  used to stay pending.
- The connector, `serialize`, `deserialize`, `prepareNewEntry` and `getIdOfData` a change
  uses are those of the render in which its turn comes.

Every change used to start its writes at once and then replace the whole selection with
what it was handed, once its writes settled.

## Why

The field hands over its whole selection, as it lists it, and it lists a change only once
its writes settled. A second change made meanwhile was computed from a selection without
the first, and whichever finished last replaced the selection: a removed entry came back
(removing it again got a 404), a created one was not listed (picking it again created a
second row), and a double click on a remove button or a pick made twice sent two writes.
With a LazyConnector the same happened while an async `deserialize` or `prepareNewEntry`
ran.

## Migration

Required for an end adornment that relies on `handleSelect` replacing the selection with
what it passes, for example to reorder the entries: `handleSelect` applies only what changed
against the selection of its render.

Nothing else to do.

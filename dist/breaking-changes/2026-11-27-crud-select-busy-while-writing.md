# CRUD selects are busy and say "Saving…" while a change is being written

- **Date:** 2026-11-27
- **Kind:** behavior, type
- **Scope:** `backend-components/Selector` (`useCrudSelect`, `CrudMultiSelect`,
  `CrudMultiSelectWithGroups`), `backend-components/Form/CrudControls`
  (`FormCrudMultiSelect`)

## What changed

While the connector has not answered a create, update or delete of the selection, the
field is marked `aria-busy="true"`, and a "Saving…" status line is shown under it, where
"Loading…" is shown while the selection loads. Once the writes have settled, the line goes
away and the change is listed, as before.

The field stays operable meanwhile: a change made then is applied after the running ones,
and a removal or a pick reported again writes nothing (see
[2026-11-27-crud-select-applies-changes-in-order.md](2026-11-27-crud-select-applies-changes-in-order.md)).

A change that waits for `prepareNewEntry` (for example a dialog that asks for the new
entry's data), or for the change before it, is not being written yet and shows nothing.
A LazyConnector only queues the writes until the Form saves, so with one the line shows
only while an asynchronous `serialize` or `deserialize` runs.

`UseCrudSelectResult`, the result of `useCrudSelect` and the value of
`useCrudSelectContext()`, has a new field `writing`: true while a change is being written.
An end adornment can read it, for example to show its own progress.

New translation key: `backend-components.selector.saving`.

## Why

On a slow network a pick or a removal looked like a click that did nothing: the list
closed, or the remove button stayed as it was, and nothing said that a request was
running, neither on the screen nor to assistive technology.

## Migration

Nothing required.

Code that builds a `UseCrudSelectResult` itself, for example a test that provides
`CrudSelectContext` with its own value, has to set `writing`. A test that expects no status
message under a CRUD select while its connector has not answered a write has to wait until
the write has settled.

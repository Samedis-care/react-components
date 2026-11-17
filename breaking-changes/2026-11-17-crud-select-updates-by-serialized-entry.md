# CrudSelect updates an entry only when what serialize returns for it changed

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `backend-components/Selector` (`useCrudSelect`, and with it `CrudMultiSelect`,
  `CrudMultiSelectWithGroups`), `backend-components/Form/CrudControls`
  (`FormCrudMultiSelect`)

## What changed

On every change of the selection (`handleSelect`, which the field and end adornments call),
an entry that stays selected is updated only when what `serialize` returns for it differs
from what it returns for the listed entry. The two results are compared as JSON, so a new
but equal object, array or `Date` is no change.

It used to compare the entries themselves, shallowly, with a fixed list of render fields
left out (`label`, `icon`, `onClick`, `group`, …). That has two consequences, both gone:

- A `deserialize` that builds a new object, array or `Date` per call made every entry look
  changed, because the field hands back its own copies of the listed entries. Every change
  sent an update for every other entry, before the change itself.
- A change of `titleTooltip` or `freeSolo`, or of any field `serialize` leaves out, sent an
  update.

In turn, a change of a render field that `serialize` returns (`label`, `icon`, …) is now
sent as an update. The local entry takes every change as before, sent or not.

`serialize` now also runs, on every change, for each entry that stays selected (once for
it and once for the listed entry). An entry whose `serialize` throws counts as changed: its
update is reported as failed in `error`, and the listed entry is kept.

## Why

The collections these controls edit are join records, and their endpoints often have no
update route. An update nobody asked for failed there: with `FormCrudMultiSelect` the save
stopped at it and the user's own change was not sent; with `CrudMultiSelect` the field
showed the refusal. Whether an entry needs a write is decided by what the write would send.

## Migration

Required for a `serialize` that returns a field whose change must not be written, such as a
`label` or `icon` that an end adornment or a `selectedEntryRenderer` changes for display:
leave that field out of what `serialize` returns, or the change is sent as an update (and
fails on an endpoint without an update route).

Required for a `serialize` with side effects or that is slow: it now runs for every
selected entry on each change. Keep it a pure mapping of the entry.

Nothing else to do. Entries may hold `Date`s, arrays and objects that `deserialize` builds
per call; they no longer need to be kept primitive to avoid updates.

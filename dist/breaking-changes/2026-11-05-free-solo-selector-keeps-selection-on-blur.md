# A freeSolo selector keeps its selection when the field is left

- **Date:** 2026-11-05
- **Kind:** behavior
- **Scope:** `standalone/Selector`, `backend-components/Selector`

## What changed

With `freeSolo`, leaving the field commits what it holds: the option highlighted in the
open list, else the typed text. In a single select this used to call `onSelect` when
nothing had been picked:

- Tabbing through the field, or leaving it with the selection's text, passed that text
  back as free text (`{ value: label, label, freeSolo: true }`), so a record was replaced
  by its own label.
- Opening the list and leaving it passed the loaded option again when `selected` was a
  copy of it. BackendSingleSelect always passes a copy.
- Leaving it while "Create" was highlighted passed `null` and cleared the selection.

In these three cases the selection now stays, `onSelect` is not called, and the input shows
the selection's text again. Leaving the field with typed text that equals the label of a
listed, enabled option now commits that option instead of free text. Other typed text, and
an option reached with the arrow keys, are still committed when the field is left.

## Why

Leaving a field without picking anything must not change its value. With
BackendSingleSelect, tabbing through a filled field turned the linked record into free text
(`onSelectFreeSolo` with its label), and the next save stored the record's name without its
id.

## Migration

Nothing to do. `onSelect` is no longer called for these blurs, so code that ran on them
for an unchanged selection no longer runs. When a user types an option's exact label and
leaves the field, BackendSingleSelect now calls `onSelect` with that record's id, where it
used to call `onSelectFreeSolo` with the text.

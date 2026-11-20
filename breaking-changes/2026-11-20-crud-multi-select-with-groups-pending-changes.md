# CrudMultiSelectWithGroups shows which entries were added and removed until they are saved

- **Date:** 2026-11-20
- **Kind:** behavior, type
- **Scope:** `backend-components/Selector/CrudMultiSelectWithGroups` with a `LazyConnector`;
  new props `added` and `removed` on `MultiSelectWithoutGroup`, `MultiSelectWithTags` and
  `BackendMultiSelectWithTags`; new prop `showDirtyState` on `CrudMultiSelectWithGroups`;
  theme slot `CcMultiSelectWithoutGroup.changeState`

## What changed

A `CrudMultiSelectWithGroups` given a `LazyConnector` (as SCF's
`SamedisCrudMultiSelectWithGroups` builds it with `useLazyCrudConnector`) queues its picks and
removals until the form saves. It now shows them, as `FormCrudMultiSelect` does:

- A queued pick's chip is marked **Added** (an outlined chip after its label).
- A queued removal stays listed, after the selected entries, with its label struck through
  and marked **Removed**. Where its remove button was, a **restore** button (named "Restore
  <label>") selects it again and cancels the queued delete; nothing is written for it. A
  removed entry is not offered in the search field, and a group pick that contains it
  restores it, so it comes back as itself rather than as a second record.
- With `showDirtyState` the title has the dirty marker while anything is queued (off by
  default, as on `CrudMultiSelect`). An explicit `dirty` still wins.
- The marks follow the queue: a write the save sent loses its mark, a sent removal leaves the
  list. A removal queued before the control was unmounted is listed again when it mounts again.

A pick that is removed again before the save leaves the list: there is nothing on the server
to restore. With any other connector (writes are sent at once) nothing changes.

The marks are text, not colour alone: "Added" and "Removed" are read with the entry, and the
mark has an outline. It uses the translations `FormCrudMultiSelect` uses; no new keys.

### New API

- `MultiSelectWithoutGroupProps.added?: string[]`: the values of `selected` entries to mark
  as added.
- `MultiSelectWithoutGroupProps.removed?: DataT[]`: entries to list as removed. They are not
  part of the selection: `onSelect` does not report them, except a restored one, which is
  appended to the selection. They are not offered as options. No restore button while
  disabled.
- `MultiSelectWithTags` and `BackendMultiSelectWithTags` take both and pass them on. A group
  pick selects an entry of `removed` with the same id (`getIdOfData`) as that entry, not as
  the group's copy of it.
- `MultiSelectWithoutGroupClassKey` gains `changeState` (the mark), and a chip has the class
  `CcMultiSelectWithoutGroup-added` or `CcMultiSelectWithoutGroup-removed`.
- `CrudMultiSelectWithGroupsProps.showDirtyState?: boolean`; `added` and `removed` are set by
  the component and not part of its props.

As for `CrudMultiSelect`, an entry's queued write is found by the entry's `value`, which has
to be the id of its record (what `deserialize` returns as `value`).

## Why

A queued pick looked like a saved entry, and a queued removal disappeared with no way back
short of discarding the whole form, unlike the same change in a `FormCrudMultiSelect`.

## Migration

Nothing required. Expect the marks, the struck-through chips and the restore button in
screenshots of a `CrudMultiSelectWithGroups` on a `LazyConnector`. To show the dirty marker
in a form, pass the form's `showDirtyState` (`useFormContextLite().showDirtyState`).

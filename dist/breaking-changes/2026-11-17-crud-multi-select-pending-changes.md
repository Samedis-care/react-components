# FormCrudMultiSelect shows which entries were added and removed until the form saves

- **Date:** 2026-11-17
- **Kind:** behavior, type
- **Scope:** `backend-components/Form/CrudControls/FormCrudMultiSelect`,
  `backend-components/Selector/CrudMultiSelect` and `useCrudSelect` with a `LazyConnector`;
  new props `added` and `removed` on `MultiSelect` and `BackendMultiSelect`, `changeState` and
  `handleRestore` on `MultiSelectEntryProps`; new prop `showDirtyState` on `CrudMultiSelect`
  and `FormCrudMultiSelect`; theme slots `CcMultiSelectEntry.changeState` and
  `CcMultiSelectEntry.restoreIconSvg`

## What changed

A `FormCrudMultiSelect` (or a `CrudMultiSelect` given a `LazyConnector`) queues its picks and
removals until the form saves. It now shows them, as `FormCrudFileUpload` shows queued files:

- A queued pick is marked **Added** (an outlined chip after its label).
- A queued removal stays listed, after the selected entries, with its label struck through
  and marked **Removed**. Where its remove button was, a **restore** button (named "Restore
  <label>") selects it again and cancels the queued delete; nothing is written for it. A
  removed entry is not offered in the dropdown, so it comes back through restore rather than
  as a second record.
- With the form's `showDirtyState` the field's label has the dirty marker while anything is
  queued. `FormCrudMultiSelect` follows the form's `showDirtyState` unless its own
  `showDirtyState` prop is set; `CrudMultiSelect` takes `showDirtyState` itself (off by
  default). An explicit `dirty` still wins.
- The marks follow the queue: a write that the save sent loses its mark, a sent removal
  leaves the list. After a save that failed part-way, what was not sent stays marked. A
  removal queued before the control was unmounted is listed again when it mounts again.

A pick that is removed again before the save leaves the list: there is nothing on the server
to restore. With any other connector (writes are sent at once) nothing changes.

The marks are text, not colour alone: screen readers read "Added" and "Removed" with the
entry, and the chip has an outline. New translation keys
`standalone.selector.multi-select.restore-item`,
`standalone.selector.multi-select.change.added` and
`standalone.selector.multi-select.change.removed`, in all eight locales.

### New API

- `MultiSelectProps.added?: string[]`: the values of `selected` entries to mark as added.
- `MultiSelectProps.removed?: DataT[]`: entries to list as removed. They are not part of the
  selection: `onSelect` does not report them, except a restored one, which is appended to the
  selection. They are hidden from the options.
- `MultiSelectEntryProps.changeState?: "added" | "removed"` (type `MultiSelectChangeState`)
  and `MultiSelectEntryProps.handleRestore`. `MultiSelectEntryProps`, `MultiSelectChangeState`
  and `MultiSelectEntryClassKey` are now exported from the package root.
- `UseCrudSelectResult` (and so `useCrudSelectContext()`) gains `added`, `removed` and
  `pendingChanges`. `handleSelect` with an entry of `removed` added back restores it: the
  queued delete is cancelled, nothing is created. `initialRawData` also holds the records of
  `removed`.

`useCrudSelect` finds an entry's queued write by the entry's `value`, which has to be the id
of its record (what `deserialize` returns as `value`, and what `serialize` returns as `id`).
An entry whose `value` is something else is not marked, and its removal is not listed, as
before.

## Why

A queued pick looked like a saved entry, and a queued removal disappeared with no way back
short of discarding the whole form. Nothing marked the field as changed, and an application
could not build that itself: it has no handle on the queue. After a save that failed
part-way, the user could not see what was left unsaved.

## Migration

Nothing required for the stock entries. Expect the chips, the struck-through entries and the
restore button in screenshots.

Required for a `FormCrudMultiSelect` or `CrudMultiSelect` with a custom `selectedEntryRenderer`:
render `changeState` and `handleRestore`, as `MultiSelectEntry` does. Without that, a removed
entry is listed like a selected one, with no remove button and no way to restore it:

```tsx
const MyEntry = (props: MultiSelectEntryProps<MyData>) => (
	<ListItem>
		<ListItemText
			primary={props.data.label}
			secondary={props.changeState && t(`…${props.changeState}`)}
		/>
		{props.changeState === "removed"
			? props.handleRestore && (
					<IconButton name={props.data.value} onClick={props.handleRestore} aria-label={…}>
						<RestoreFromTrash />
					</IconButton>
				)
			: props.handleDelete && (
					<IconButton name={props.data.value} onClick={props.handleDelete} aria-label={…}>
						<Cancel />
					</IconButton>
				)}
	</ListItem>
);
```

The button needs `name={data.value}`: `MultiSelect` finds the entry by it, as for removal.

# MultiSelect's remove and restore handlers are bound to their entry

- **Date:** 2026-11-21
- **Kind:** behavior, type
- **Scope:** `standalone/Selector`

## What changed

- `handleDelete` and `handleRestore`, which MultiSelect passes to `MultiSelectEntry` or a
  custom `selectedEntryRenderer`, are bound to the entry they are passed with. They used to
  find the entry by the `name` of the clicked element (`evt.currentTarget.name`), so they
  worked only as the `onClick` of a `<button name={data.value}>`. Called from anything
  else, `handleDelete` threw "Entry couldn't be found" and removed nothing, and
  `handleRestore` did nothing.
- Both take the click or key event of any element:
  `(evt: React.MouseEvent | React.KeyboardEvent) => void`, before
  `(evt: React.MouseEvent<HTMLButtonElement>) => void`.
- `MultiSelectorData.canUnselect` gets that event as its second argument, typed
  `React.MouseEvent | React.KeyboardEvent`, before `React.MouseEvent<HTMLElement>`. Its
  `currentTarget` is the element the handler was called from, for example a Chip's
  delete icon (an SVG element) or the Chip itself when it is removed with Delete or
  Backspace.
- `MultiSelectEntry`'s remove and restore buttons no longer have the entry's value as
  their `name`.

## Why

A custom entry could remove itself only through a button that carried the entry's value as
its `name`. A Chip's delete icon, its Delete key, a menu item or a link threw an error
instead of removing the entry.

## Migration

Nothing required for the stock entries.

- A `selectedEntryRenderer` can drop the `name={props.data.value}` of its remove and restore
  buttons and call the handlers from any element:

  ```tsx
  const ChipEntry = (props: MultiSelectEntryProps<MyData>) => (
  	<ListItem>
  		<Chip
  			label={props.data.label}
  			onDelete={
  				props.changeState === "removed"
  					? props.handleRestore
  					: props.handleDelete
  			}
  		/>
  	</ListItem>
  );
  ```

- Required for a `canUnselect` that declares its event parameter as
  `React.MouseEvent<HTMLElement>`: declare it as `React.MouseEvent | React.KeyboardEvent`,
  otherwise it no longer compiles. Both have the modifier keys (`shiftKey`, …).
- Required for code that renders `MultiSelectEntry` itself with its own `handleDelete` or
  `handleRestore`: accept `React.MouseEvent | React.KeyboardEvent`, and bind the handler to
  the entry instead of reading `evt.currentTarget.name`, which the buttons no longer set.
- Tests or styles that find a remove or restore button by its `name` have to use its role
  and accessible name ("Remove <label>", "Restore <label>").

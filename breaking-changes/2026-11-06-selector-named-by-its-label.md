# A selector's combobox and list are named by its label

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Selector` (BaseSelector and every selector built on it),
  `backend-components/Selector`, the selector renderers

## What changed

BaseSelector ties its `label` to the input: the label gets the id `<id>-label` and
`for="<id>"`, where `<id>` is `autocompleteId` or, without one, an id generated for the
selector. So:

- The combobox's accessible name is the label, with and without a selection. With a
  selection it used to be the input's `title`, the selected value, and without one there was
  no name. The `title` is now the combobox's description.
- The open list (`<id>-listbox`) is named by the label as well. Its `aria-labelledby`
  pointed at a label id that did not exist.
- A click on the label focuses the input, as on a text field's label.

## Why

Screen readers announced a selector as an unnamed combo box, or as "Germany, combo box"
without saying which field it was. Required and invalid states reached the input, but
never with the field's name.

## Migration

Nothing to do. Tests that find a selector by its selected value
(`getByRole("combobox", { name: "Germany" })`) find it by its label now
(`{ name: "Country" }`).

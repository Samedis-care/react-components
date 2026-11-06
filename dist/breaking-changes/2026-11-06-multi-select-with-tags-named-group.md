# MultiSelectWithTags is a group named by its title, and its group field has a name

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Selector` (`MultiSelectWithTags`, and through it
  `BackendMultiSelectWithTags` and `CrudMultiSelectWithGroups`)

## What changed

- The root element has `role="group"` and is named by the title (`aria-labelledby`).
- The title is a `<span>` instead of a `<label>`. It looks the same.
- The group field (the one whose pick adds all entries of a group) has a visually hidden
  `<label>`, the new slot `groupInputLabel`. Screen readers announce the field as "Add all
  entries of a group", translated in every locale. The new prop `groupInputLabel`
  replaces that text.
- Without `autocompleteId`, the group field's input gets a generated id. With it, the id
  is `<autocompleteId>-group-select`, as before.

## Why

The title was a `<label>` tied to no input, and the group field had no name. A screen
reader announced two unnamed comboboxes, without saying what the control is for or that
the first one adds whole groups.

## Migration

Nothing to do. Theme overrides or CSS that select the title as a `label` element have to
select it as the root's `.MuiTypography-caption` instead. To name the group field after
what its groups are, pass `groupInputLabel` (e.g. "Add a team").

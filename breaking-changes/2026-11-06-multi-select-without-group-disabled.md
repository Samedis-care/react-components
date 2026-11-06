# MultiSelectWithoutGroup's disabled disables its search field and its switch

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Selector` (`MultiSelectWithoutGroup`, and through it
  `MultiSelectWithTags`, `BackendMultiSelectWithTags` and `CrudMultiSelectWithGroups`),
  `standalone/InlineSwitch`

## What changed

- With `disabled`, MultiSelectWithoutGroup's search field is disabled: it cannot be
  focused, opened or typed into, and its label and search icon are greyed out. Before,
  `disabled` only hid the chips' remove buttons, and the search field still added picks.
- With `disabled` and `displaySwitch`, the switch is disabled too: it cannot be focused or
  toggled, and `setSwitchValue` is not called.
- MultiSelectWithTags' data field follows its `disabled` like the group field already did.
  A read-only BackendMultiSelectWithTags form field can no longer be edited through it.
- InlineSwitch takes `disabled`. A disabled switch and its label are greyed out, also
  when the switch is on.

## Why

A disabled control has to be disabled as a whole. The search field and the switch kept
working, so a user could still add entries to a disabled field and change its filter.

## Migration

Nothing to do. A caller that relied on picks through a disabled MultiSelectWithoutGroup
has to leave `disabled` off.

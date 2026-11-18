# A disabled selector disables its switch

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `standalone/Selector` (`BaseSelector`, and through it `SingleSelect`,
  `MultiSelect`, `BackendSingleSelect`, `BackendMultiSelect` and `BackendMultipleSelect`)

## What changed

With `disabled` and `displaySwitch` (on the backend selectors: `switchFilterName`),
BaseSelector disables its switch like its combobox: the switch cannot be focused or
toggled, also not through its label, and switch and label are greyed out. Before, the
switch stayed enabled: Tab stopped on it, screen readers announced an operable switch,
and turning it on reloaded the options with the switch filter.

## Why

A disabled control has to be disabled as a whole. The switch is part of the selector
field, and a field the user cannot edit must not send new queries.

## Migration

Nothing to do. A caller that wants the switch to stay usable has to leave `disabled` off.

# InlineSwitch's slots have static `CcInlineSwitch-*` classes

- **Date:** 2026-11-25
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`, and so the switch of every selector that shows one

## What changed

Each slot of InlineSwitch has a static class name, as MUI's slots have their
`Mui<Name>-<slot>` classes:

- the outer `<div>`: `CcInlineSwitch-root`
- the wrapper of switch and label: `CcInlineSwitch-switchWrapper`
- the switch's root (MUI's `.MuiSwitch-root`): `CcInlineSwitch-switch`

Before, the slots had only emotion's generated class names, so a rule for one of these
classes, in a stylesheet, a `styled(InlineSwitch)` style or a theme override of a
component around the switch, matched nothing. Such a rule applies now. The switch of
BaseSelector and of the selectors built on it looks as before; MultiSelectWithoutGroup's
own rule for its switch row applies now, see
[MultiSelectWithoutGroup's switch has a row of its own above the chips](2026-11-26-multi-select-without-group-switch-row.md).

## Why

A theme or an app can select the slots of InlineSwitch by class, as it can those of MUI's
components and of the DataGrid (`CcDataGrid-*`).

## Migration

Nothing required. An app with a rule for `.CcInlineSwitch-root`,
`.CcInlineSwitch-switchWrapper` or `.CcInlineSwitch-switch` gets its styles now: check that
the switch looks as intended.

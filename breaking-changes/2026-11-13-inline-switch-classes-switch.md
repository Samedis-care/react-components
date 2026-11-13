# InlineSwitch applies `classes.switch`

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`

## What changed

`classes.switch` reaches the switch's root element (MUI's `.MuiSwitch-root`). Before, the
key was accepted and typed, but its class name was dropped.

## Why

`switch` is a key of `InlineSwitchClassKey`, and `classes.root` and `classes.switchWrapper`
already reached their elements. Only the switch got no class name, so an app could not
style the switch of one InlineSwitch without a theme override.

## Migration

Nothing required. An InlineSwitch that passes `classes.switch` gets its styles now: check
that the switch looks as intended.

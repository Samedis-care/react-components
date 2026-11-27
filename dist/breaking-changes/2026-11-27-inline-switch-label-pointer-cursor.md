# InlineSwitch's label shows the pointer cursor

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`, and so the switch of the selectors (`displaySwitch`)

## What changed

Over an InlineSwitch's label (the `<label>` around the switch and its text) the mouse
shows the pointer (hand) cursor, as over MUI's `FormControlLabel`. Before, only the switch
itself showed it, and the label's text showed the default cursor. While the switch is
`disabled`, the label shows the default cursor.

## Why

A click anywhere on the label toggles the switch, so the label shows that it can be
clicked, as MUI's labeled controls do.

## Migration

Nothing to do.

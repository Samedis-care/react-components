# FormDialog renders a button's color

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `non-standalone/Dialog` `FormDialog` (not `FullFormDialog`)

## What changed

A `FormDialog` button now renders the `color` of its button config, `"primary"` when it has
none, as ErrorDialog, InfoDialog and ConfirmDialog already did. FormDialog used to render
every button primary.

## Why

`FormDialog` takes the same button configs as the other message dialogs, whose `color`
it ignored.

## Migration

Nothing to do. A FormDialog button configured with `color: "secondary"` now shows in the
secondary color.

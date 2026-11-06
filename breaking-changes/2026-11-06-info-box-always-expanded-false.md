# InfoBox's alwaysExpanded={false} lets the user open and close the box

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/InfoBox`

## What changed

- `alwaysExpanded={false}` behaves like an unset `alwaysExpanded`: the box starts as
  `expanded` says, and the user opens and closes it. It used to keep the box closed for
  good and ignore `expanded`, while the header stayed a toggle that called
  `onChange(event, true)` and opened nothing.
- A change of `alwaysExpanded` after mount takes effect. Turned on, it opens the box and
  keeps it open; that used to be ignored when `alwaysExpanded` was unset at mount. Turned
  off (`false` or unset), it gives the box back to the user, in the state they last toggled
  it to (initially `expanded`), and the header keeps its `aria-expanded`. It used to keep
  the box closed (`false`), or close it and remove the header's `aria-expanded` (unset).

## Why

`alwaysExpanded={isLocked}` is the natural way to pass a condition, and with
`isLocked === false` it hid the message from every user behind a toggle that did nothing.

## Migration

Nothing to do: samedis-ui and identity-management-frontend don't use InfoBox. A box can
no longer be kept closed; where `alwaysExpanded={false}` was passed, the user can now open
it.

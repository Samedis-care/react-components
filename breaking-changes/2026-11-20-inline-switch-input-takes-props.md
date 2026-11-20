# InlineSwitch's switch takes the props it does not know, so a bare switch can be named

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`

## What changed

`InlineSwitch` now forwards the props it does not know to the `<input role="switch">`
inside the switch, and offers a new `inputProps` prop for the same. Both were dropped
before, so an `aria-label`, `aria-describedby`, `id` or `name` passed to `InlineSwitch`
never reached the element a screen reader names.

A switch rendered without `label` (the `NoLabel` story) can now be named, for example
`<InlineSwitch value={false} visible onChange={onChange} aria-label="Show inactive entries" />`,
and help text can be attached with `aria-describedby`. With an `inputProps` object the
same works in typed code.

## Why

`label` was the switch's only accessible name, and it is optional. Without it a screen
reader announced "switch, off" with no purpose, and axe reported the input as `label`
(critical, WCAG 4.1.2 Name, Role, Value). MUI's own `Switch` and `Checkbox` take the same
attributes through `slotProps.input`; forwarding unknown props keeps `InlineSwitch`'s
short API while giving an app that route.

## Migration

Nothing to do. An app that passed an attribute to `InlineSwitch` for another purpose —
or relied on it being ignored — should check it: the attribute now lands on the switch's
`<input>`. A switch that has neither `label` nor `aria-label` (or `inputProps`) is still
unnamed.

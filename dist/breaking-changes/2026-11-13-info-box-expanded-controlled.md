# InfoBox's expanded is controlled, and defaultExpanded sets the initial state

- **Date:** 2026-11-13
- **Kind:** API, type, behavior
- **Scope:** `standalone/InfoBox`

## What changed

InfoBox takes `expanded`, `defaultExpanded` and `onChange` like MUI's `Accordion`:

- `expanded` is controlled. The box shows its value and follows every change, so a parent
  opens and closes the box from code. A click on the header no longer changes the box by
  itself: it calls `onChange(event, requested)`, and the box changes once the parent passes
  the requested state back into `expanded`. It used to be read once at mount, as the initial
  state, and later changes were ignored.
- `expanded` is optional (it was required). Without it the box is uncontrolled: the user
  opens and closes it.
- `defaultExpanded` (new, default `false`) is the initial state of an uncontrolled box, read
  once at mount like MUI's `defaultExpanded`.
- A box is controlled or uncontrolled for its whole life. Switching `expanded` between a
  boolean and `undefined` after mount, or changing `defaultExpanded`, is ignored and logs a
  MUI error in development, as it does for MUI's `Accordion`.
- `alwaysExpanded` is unchanged: `true` keeps the box open whatever `expanded` says. When it
  is turned off, the box shows `expanded`, or, without it, the state the user last toggled to
  (initially `defaultExpanded`).

## Why

`expanded` has the name of MUI's controlled prop. The usual wiring,
`expanded={open}` with `onChange={(_, next) => setOpen(next)}`, opened the box on a click,
but `setOpen(false)` from code, `expanded={hasErrors}` after a validation and a setting that
loads after mount changed nothing.

## Migration

Required for every caller that passes `expanded` as the initial state of a box the user
toggles (no `onChange` that sets `expanded`): rename it to `defaultExpanded`. Otherwise the
box is stuck in that state, because a click only calls `onChange`.

```tsx
// before
<InfoBox heading={heading} message={message} expanded={false} />
// after
<InfoBox heading={heading} message={message} defaultExpanded={false} />
// or simply, since false is the default
<InfoBox heading={heading} message={message} />
```

A caller that mirrors `onChange` into `expanded` keeps its code: opening and closing the box
from code now works. A caller that remounted the box with a new `key` to apply a new
`expanded` can pass the value directly instead.

samedis-ui and identity-management-frontend don't use InfoBox: nothing to do there.

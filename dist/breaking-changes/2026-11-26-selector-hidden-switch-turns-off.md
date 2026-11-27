# Hiding a selector's switch turns it off, and showing it starts it at defaultSwitchValue

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/Selector` (`BaseSelector`, and through it `SingleSelect`,
  `MultiSelect`, `BackendSingleSelect`, `BackendMultiSelect` and `BackendMultipleSelect`)
  when `displaySwitch` (on the backend selectors: `switchFilterName`) changes after mount

## What changed

Turning `displaySwitch` off turns the switch off. If the user had turned it on, the
options are loaded again at once with `switchValue` `false`, and every later load gets
`false` while the switch stays hidden. Before, the switch disappeared but stayed on: every
load still got `switchValue` `true`, so the options stayed filtered by a switch the user
could no longer see or turn off. On the backend selectors, removing `switchFilterName`
now also reloads the options without the switch's filter.

Turning `displaySwitch` on after mount starts the switch at `defaultSwitchValue` (off when
unset). Before, `defaultSwitchValue` only applied when the selector mounted with the
switch shown, and a switch shown again came back in the state it was hidden in.

## Why

A switch the user cannot see must not filter what the user can pick. An app hides the
switch when its filter no longer applies (another field or the user's role changed), and as
the switch is uncontrolled, hiding it is the only way the app can take that filter away.
MultiSelectWithTags already resets its switch this way.

## Migration

Nothing to do. An app that wants a filter to stay applied without a visible switch applies
it in its own `onLoad`.

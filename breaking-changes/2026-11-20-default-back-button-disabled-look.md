# A disabled default Back button looks like every disabled ActionButton

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`BackActionButton`, `DefaultFormPageButtons`, `FlowEngineBackButton`)

## What changed

The grey of a `BackActionButton` without a `color` (`BackButtonDefaultColorClass`) now
applies only while the button is enabled: the rule's selector is
`&.${BackButtonDefaultColorClass}:not(.Mui-disabled)`. A disabled one, such as the Back of
`DefaultFormPage` while the form saves, takes the disabled look of every `ActionButton`
(MUI's disabled background, plus whatever the theme gives disabled ActionButtons), the same
as Save next to it.

It used to keep `grey[300]` (`grey[800]` in the dark palette) while disabled. In the light
palette on a white footer that grey looks the same as MUI's disabled background, so there
the change is not visible; in the dark palette, and in a theme that gives disabled
ActionButtons a background of its own, the disabled Back used to differ from the disabled
Save.

## Why

A disabled Back that keeps its enabled background looks clickable during a save, and a
click on it does nothing, with no visible reason.

## Migration

Nothing to do. A theme that restyles the default Back button in
`components.CcDefaultFormPageButtons.styleOverrides.backButton` with
`&.${BackButtonDefaultColorClass}` alone keeps its color while the button is disabled:
restrict that rule with `:not(.Mui-disabled)` to get the disabled look.

Expect the disabled Back in the colors of a disabled Save in screenshots taken during a
save.

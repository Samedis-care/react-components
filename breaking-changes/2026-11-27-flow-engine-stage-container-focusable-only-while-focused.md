# FlowEngine's stage container is focusable only while it holds the focus

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `backend-components/Form/FlowEngine`

## What changed

The container FlowEngine renders the stage in (the theme slot `components.CcFlowEngine`
`root`) no longer has a permanent `tabindex="-1"`. It gets the attribute when a stage
change moves the focus to it, and loses it again when the focus leaves it (e.g. with Tab)
or a pointer presses inside it. Before that first stage change, and after the focus has
moved on, the container has no `tabindex`.

A click on blank space in a stage (between fields, beside a heading) therefore no longer
focuses the container: the focus goes where the browser puts it without the container,
and the next Tab goes to the control after the point clicked.

What a stage change does is unchanged: the container takes the focus, shows no focus ring,
and the next Tab goes to the first control of the new stage.

## Why

A click on blank space focused the container, so the next Tab went back to the first
control of the stage instead of the control after the point clicked.

## Migration

Nothing is required.

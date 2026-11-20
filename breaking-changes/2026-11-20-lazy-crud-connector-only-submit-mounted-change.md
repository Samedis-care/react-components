# A lazy control's queue keeps the Form dirty when onlySubmitMounted changes while it is shown

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`useLazyCrudConnector`, and with it `FormCrudMultiSelect`, `FormCrudFileUpload`, `FormCrudMultiImage`)

## What changed

A Form's `onlySubmitMounted` can change while a control built on `useLazyCrudConnector` stays
mounted: the Form gets another `onlySubmitMounted` prop, or in a flow form a stage sets another
value through `useFormFlowEngineStageConfig` than the stage before, while the control sits
outside the stages. The control's queued writes now keep the Form dirty, and the next save sends
them, whatever the value. Turning `onlySubmitMounted` off used to clear the Form's dirty flag
while the writes stayed queued and listed: a Save button that follows `dirty` was disabled,
leaving did not ask, and `submit()` sent nothing.

What counts for the control is the `onlySubmitMounted` the Form has when the control unmounts.
Turned off before, a hidden control's queue keeps the Form dirty and is sent by the next save,
as in any Form without `onlySubmitMounted`. Turned on before, it is neither saved nor counted as
dirty until the control mounts again, as before.

## Why

The Form looked as if nothing were pending while the control listed writes, and no save sent
them.

## Migration

Nothing required.

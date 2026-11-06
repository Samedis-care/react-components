# A lazy control's queue counts again when it mounts again, and flow forms save it

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`useLazyCrudConnector`, and with it `FormCrudMultiSelect`, `FormCrudFileUpload`, `FormCrudMultiImage`)

## What changed

This is about a Form with `onlySubmitMounted`, which every flow form (`flowEngine`) has unless
a stage config turns it off. A control built on `useLazyCrudConnector` that unmounts (a tab, a
conditional section, a flow stage that was left) keeps its queued writes in the Form, as before.
While it is unmounted they are neither saved nor counted as dirty.

- **Mounting again:** a control that mounts again with queued writes makes the Form dirty again,
  and the next save sends them. It used to list them while the Form stayed clean, so a Save
  button that follows `dirty` stayed disabled, leaving did not ask, and `submit()` sent nothing.
- **Flow forms:** the queue of a stage that was left (`goToStage(next, false)`) keeps the Form
  dirty and is sent with the record by the next submit to the server (`goToStage(…, true)`,
  `submit({ submitToServer: true })`), like the stage's staged values. It used to be dropped
  from that save, without a message. A stage left with nothing queued sends nothing for it, as
  before. What decides is the submit the stage change makes: like the values of the mounted
  fields, it stages the queue of every control mounted at that moment. A control hidden within
  its stage (a tab, a conditional section) before such a submit is not staged, and follows
  `onlySubmitMounted` like in any other Form.

Without `onlySubmitMounted` nothing changes: an unmounted control's queue keeps the Form dirty
and is sent by the next save.

## Why

The control listed picks, uploads and removals that no save wrote, and the Form looked as if
nothing were pending. A queued write now behaves like the value of a model field: kept while the
control is hidden, and counted and saved while it is shown. In a flow form it is saved with the
stage it was made in.

## Migration

Nothing required. A flow that submits to the server before it leaves a stage with a lazy control,
so that the picks are saved, can keep doing so. It no longer needs to. A step that goes back
with `goToStage(earlier, false)` now leaves that stage's queued writes pending: they are sent by
the flow's next save, like the stage's other edits.

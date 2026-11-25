# A flow form has a second dirty flag, stagedDirty, for staged edits

- **Date:** 2026-11-24
- **Kind:** behavior, type
- **Scope:** `backend-components/Form` (`Form` with `flowEngine`, `FlowEngineSaveButton`,
  `FormContextData`, `FormContextDataLite`, `PageProps`, `BasicFormPage`, the `"dirty"` event)

## What changed

A Form has two dirty flags now. In flow mode (`flowEngine`) they mean:

- `dirty`, as before: the values the shown stage submits differ from the server record (the
  fields it renders, `alwaysSubmitFields` and hidden fields, or every field when its stage config
  turns `onlySubmitMounted` off), a custom field is dirty, or the record is deleted on submit.
- `stagedDirty`, new: values that stages staged (`goToStage(next, false)`) differ from the server
  record. It stays set until the flow saves them (`goToStage(…, true)`, `FlowEngineSaveButton`,
  `submit({ submitToServer: true })`) or the staged values are the server's again. Without
  `flowEngine` it is always false.

`stagedDirty` is on `FormContextData` (`useFormContext`), on `FormContextDataLite`
(`useFormContextLite`), in `PageProps` (the props the Form gives its page, which `FlowEngine`
hands to every stage as `formProps`) and in the `"dirty"` event (`FormDirtyEvent`). The
`"dirty"` event is dispatched when either flag changes and carries both, so a listener can get
an event whose `dirty` is the same as in the event before.

The form holds unsaved changes while `dirty || stagedDirty`, and the library follows that:

| After an edit in stage a and `goToStage("b", false)`                                    | Before   | Now                                |
| --------------------------------------------------------------------------------------- | -------- | ---------------------------------- |
| `dirty` in stage b (which does not render the edited field)                             | false    | false                              |
| `stagedDirty`                                                                           | –        | true                               |
| `FlowEngineSaveButton` in stage b                                                       | disabled | enabled, saves the edit of stage a |
| Closing the browser tab, a navigation away, closing a `FullFormDialog`, a page's goBack | leaves   | asks first                         |

## Why

The edits of a stage that was left were lost without a prompt: the form looked saved, its Save
button was disabled and leaving did not ask, while the flow's next save would still have sent
them. A button that goes on to the next stage and a button that saves need different flags:
going on concerns the values of the shown stage, a save also sends what earlier stages staged.

## Migration

**Required for any app with a flow form whose own buttons or code read `dirty`.** Without it,
a save button of the app's own stays disabled in a later stage although the edits of an earlier
stage are waiting to be saved, and code that waits for or checks unsaved changes misses them.

- A button that saves (`goToStage(…, true)`, `submit`/`safeSubmit` with `submitToServer: true`):
  enable it while `dirty || stagedDirty`.
- A button that only goes to the next stage (`goToStage(next, false)`): keep `dirty`.
- A `FlowEngineSaveButton` with an `onClick` that only goes to the next stage: it is enabled for
  staged edits now too; pass `disabled={!dirty}`, or use an `ActionButton`.
- Code that asks whether the form holds unsaved changes (hides an action that would lose them,
  waits for the form to be clean before it leaves, a `"dirty"` event listener that guards
  leaving): use `dirty || stagedDirty`, in a listener `event.dirty || event.stagedDirty`.

```tsx
const { dirty, stagedDirty, submitting, readOnly } =
	useFormContextLite<MyModel>();

// Next: the values of the shown stage
<ActionButton
	disabled={!dirty || submitting || readOnly}
	onClick={() => void safeGoToStage("step2", false)}
>
	{t("next")}
</ActionButton>;

// a save of the app's own: the shown values and the staged ones
<ActionButton
	disabled={!(dirty || stagedDirty) || submitting || readOnly}
	onClick={() => void safeGoToStage("done", true)}
>
	{t("ok")}
</ActionButton>;
```

**Required for any app that builds `PageProps`, `BasicFormPage` props, a `FormContextData` or a
`FormContextDataLite` object itself** (instead of passing on what the Form gives it, e.g. a
form context simulated for a dialog): add `stagedDirty` (`false` outside a flow form).
TypeScript reports the missing property.

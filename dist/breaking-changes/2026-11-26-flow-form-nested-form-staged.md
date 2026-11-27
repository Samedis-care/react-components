# A nested form in a flow stage that was left keeps its edits for the flow's save

- **Date:** 2026-11-26
- **Kind:** behavior, type
- **Scope:** `backend-components/Form` (`Form` with `nestedFormName` inside a `Form` with
  `flowEngine`, `nestedSubmitBeforeParent`, `FormContextData.setCustomFieldDirty`)

## What changed

A nested form (`nestedFormName`) inside a flow form (`flowEngine`) follows the stages like the
fields of its stage:

| A nested form in stage a is edited, then `goToStage("b", false)`     | Before                                        | Now                                                                                |
| -------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------- |
| The parent in stage b                                                | clean (`dirty`, `stagedDirty`)                | `stagedDirty` (`dirty` follows stage b's values)                                   |
| Leaving the page, closing a `FullFormDialog`, the form page's goBack | leaves without asking                         | asks first                                                                         |
| `FlowEngineSaveButton` in stage b                                    | disabled (unless b is edited)                 | enabled                                                                            |
| The flow's save (`goToStage(…, true)`, `FlowEngineSaveButton`)       | saves the parent only                         | saves the parent and the nested form                                               |
| The same with `nestedSubmitBeforeParent`                             | `goToStage("b", false)` saved the nested form | `goToStage("b", false)` sends nothing; the flow's save saves it, before the parent |

A nested form hidden within its stage, with nothing staged since it mounted, follows the
parent's `onlySubmitMounted` as before: its edits are neither counted nor saved. A nested form
with `onlySubmitNestedIfMounted` or `disableNestedSubmit` keeps its behavior. When the stage is
shown again, the nested form gets its edits back and counts toward `dirty` again.

`setCustomFieldDirty(field, dirty)` takes `"staged"` besides `true` and `false`: in a flow form
the field's changes count toward `stagedDirty` instead of `dirty` (changes that belong to a stage
that was left); without `flowEngine` `"staged"` counts like `true`. The nested form reports its
edits this way when its stage is left.

## Why

The edits of a nested form were lost without a prompt when its stage was left: the parent
looked saved and the flow's save left them out. A step that only goes to the next stage must
not save anything, and with `nestedSubmitBeforeParent` it saved the nested form.

## Migration

**Required for any app that builds a `FormContextData` object itself** (instead of passing on
what `useFormContext` gives it): its `setCustomFieldDirty` takes `dirty: boolean | "staged"`.
TypeScript reports the place.

```tsx
const setCustomFieldDirty = (field: string, dirty: boolean | "staged") => {
	/* … */
};
```

**Required for any app with a flow form that nests a form with `nestedSubmitBeforeParent` and
needs the nested record saved when the stage is left** (e.g. a later stage reads the id the
save gave it): save when leaving the stage, `goToStage(next, true)` or
`submit({ submitToServer: true })`, as a stage change with `false` no longer saves it.

Any app whose flow stage saves to the server before it is left only so that the nested forms
in it are saved can drop that save and go on with `goToStage(next, false)`: the flow's save
saves the nested forms. Code that reads `dirty || stagedDirty` (see
[the stagedDirty entry](2026-11-24-flow-form-staged-dirty.md)) covers the nested forms' edits
without a change.

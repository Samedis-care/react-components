# FlowEngine moves the focus to a new stage, in a container of its own

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `backend-components/Form/FlowEngine`

## What changed

- FlowEngine renders the stage inside a `div`, the theme slot `components.CcFlowEngine`
  `root`. It used to render no element of its own. The container is a flex column that
  grows (`flex-grow: 1`), so a stage whose page layout grows to fill the form still does.
- After a stage change, the container takes the keyboard focus. It has `tabindex="-1"` and
  no outline, so no focus ring shows, and the next Tab goes to the first control of the
  new stage. If the start of the new stage is scrolled out of view (in the window or in a
  scroll area such as a dialog's content), it is scrolled to the top of that area. When
  the start is in view, nothing scrolls.
- Focus and scrolling stay as they are when the new stage focuses a control itself
  (`autoFocus`), when the focus is on an element outside the FlowEngine (e.g. a stepper
  around it), on the first render, and when `goToStage` stays on the current stage.
- New prop `stageLabels`: the name of each stage. The container of a named stage is a
  `group` with that name, which screen readers announce when the focus moves there.
- New prop `disableAutoFocus`: leaves focus and scroll position alone after a stage change.
  A theme can set it as a default (`components.CcFlowEngine.defaultProps`).

## Why

A stage change replaced the old stage, including the button that started it. The keyboard
focus fell to the page (in a dialog, to the dialog), screen readers announced nothing, and
a tall stage showed at the scroll position of the previous one.

## Migration

Required for the stage change to be announced: pass `stageLabels`, with the translated step
title the user sees, for every stage. Without it the focus moves to the new stage, but
screen readers do not say which step it is.

```tsx
const stageLabels = useMemo(
	() => ({ select: t("steps.select"), details: t("steps.details") }),
	[t],
);
return (
	<FlowEngine<Model, "select" | "details", CrudFormProps>
		defaultStage={"select"}
		formProps={props}
		stageLabels={stageLabels}
	>
		{STAGES}
	</FlowEngine>
);
```

A flow that moves the focus or the scroll position itself after a stage change: pass
`disableAutoFocus`. A stage that focuses a field with `autoFocus` keeps doing so and needs
no change.

Styles that targeted the stage's outermost element as a direct child of the form (e.g.
`form > div`) now match the FlowEngine container; style the stage's own element, or the
container through `components.CcFlowEngine.styleOverrides.root`.

# A dirty form page still asks before it is left while it saves

- **Date:** 2026-11-10
- **Kind:** behavior
- **Scope:** `backend-components/Form/BasicFormPage`, and the pages built on it
  (`DefaultFormPage`, `EditOnlyFormPage`, `FlowEngineFormPage`, every CRUD record page),
  in a page and in a `FullFormDialog`

## What changed

A save makes the form read-only (`readOnlyReasons` gets the key
`FORM_SUBMITTING_READ_ONLY_REASON`, `"submit"`), and so does a busy reason
(`addBusyReason`). A form page used to drop its leave guards whenever its form was
read-only, so they were off for as long as a save ran. Now a form page keeps them while
it saves or is busy, and releases them once the form is clean:

| While a dirty form page saves                        | Before | Now                     |
| ---------------------------------------------------- | ------ | ----------------------- |
| Escape, a backdrop click or X on a FullFormDialog    | closes | asks "Leave form page?" |
| A navigation (link, browser Back)                    | leaves | asks                    |
| Closing the browser tab                              | leaves | the browser asks        |
| The footer's `customProps.goBack`                    | leaves | asks                    |
| CRUD's move from the create form to the saved record | moves  | moves, never asks       |

CRUD's move from `<url>/new` to `<url>/<id>` after a create keeps the Form with all of
its state, so the page moves rather than being left: it passes the guard whatever the
form's dirty state, and the guard goes on guarding the page at its new url.

A form that is read-only for another reason (any other key in `readOnlyReasons`, the
`readOnly` prop, a CRUD without edit permission) still takes no guard, also while it is
busy.

`FORM_SUBMITTING_READ_ONLY_REASON` is new and exported from the package root.

## Why

A save can fail. A form page closed while its save was pending could not show the
failure, so the user believed the edits were saved. Now the user is asked first, and
"No" keeps the form, which shows the save's outcome.

## Migration

Code that navigates while the save is still running, e.g. without awaiting `submit`, now
gets the prompt while the form has unsaved changes; await the save first.

Once `submit`/`safeSubmit` has resolved, and in the Form's `onSubmit`, the model fields
are clean. A dirty state reported through `setCustomFieldDirty` is not: it counts until
the control clears it. A control that recomputes it in an effect, and skips that while the
form is read-only, clears it only after the save has finished and the form has rendered
again; code that navigates before that gets the prompt. CRUD's own move to the saved
record is not affected (see above).

**Required for controls that report `setCustomFieldDirty` for a value the save takes
care of** (e.g. in a post submit handler), on pages whose code navigates right after the
save: clear the field by the time the save resolves, at the end of that post submit
handler, not only in an effect after the next render. `setCustomFieldDirty` announces the
change at once, so the form is clean when `onSubmit` runs and when `submit` resolves.
Without it, such a navigation stops behind "Leave form page?" although the record is saved.

```tsx
const { setPostSubmitHandler, removePostSubmitHandler, setCustomFieldDirty } =
	useFormContext();
useEffect(() => {
	setPostSubmitHandler("images", async (id) => {
		await saveImages(id);
		setCustomFieldDirty("images", false);
	});
	return () => removePostSubmitHandler("images");
}, [setPostSubmitHandler, removePostSubmitHandler, setCustomFieldDirty]);
```

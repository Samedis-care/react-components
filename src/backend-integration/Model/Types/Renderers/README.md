# Renderers

## Purpose

Renderers are responsible to display values of the [type](../README.md) they implement based on the visibility parameters.
They act as View layer in an MVC concept.

## Implementation

Renderers implement the `render(params: ModelRenderParams<?>)` method for their given type. You can use the template to implement your own renderer

### Template

```tsx
import React from "react";
import { ModelRenderParams } from "components-care";
import TypeYourType from "../TypeYourType";

/**
 * Renders YourType // TODO: Replace "YourType" with your actual type
 */
class RendererYourType extends ModelDataTypeYourType {
	render(params: ModelRenderParams<Date | null>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
			dirty,
			autoFocus,
			id,
			messageId,
			describedBy,
		} = params;

		// if the visibility is disabled you should not render anything, so return <></> (empty React.Fragment)
		if (visibility.disabled) return <></>;
		// if the visibility is hidden you should save a string representation of your field to a hidden input field
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={value.toString()} // TODO: modify this to suit YourType
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		// if the visibility is editable we show the edit control and an validation error message display (FormHelperText)
		if (visibility.editable) {
			// you can implement your own editable grid renderer here, no need to show labels in that case
			if (visibility.grid) throw new Error("Not supported");

			return (
				<>
					<YourEditControl
						id={id}
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						onChange={(value) => handleChange(field, value)}
						onBlur={handleBlur}
						error={!!errorMsg}
						aria-describedby={describedBy}
						dirty={dirty}
						autoFocus={autoFocus}
						fullWidth
					/>
					<FormHelperText id={messageId} error={!!errorMsg}>
						{errorMsg}
					</FormHelperText>
				</>
			);
		}

		// if the control is not editable we show a basic read-only view. If visibility.grid is true don't show the label
		return (
			<Typography>
				{visibility.grid && `${label} `}:{value}
			</Typography>
		);
	}
}

export default RendererYourType;
```

### Remarks

`dirty` says the field should be marked as modified — false unless the application asked
for the marker, so a renderer can always forward it. Hand it to any control built on a MUI
`FormControl` or `TextField` and the marker — a small blue dot — appears after the label on
its own. A control that labels itself some other way should render `DirtyMarker` next to its
label instead. See
[Showing dirty state](../../../../../docs/FormEngine.md#showing-dirty-state).

`autoFocus` is true while the field mounts if the form should start in it
(`FormField autoFocus`), and false right after. Hand it to the control's own `autoFocus`,
after any options you spread, so the form's value wins, and render that input right away.
A control with several inputs gives it to the one where typing starts, such as the empty
entry at the end of a list; a control with nothing to type into can ignore it. See
[Starting in a field](../../../../../docs/FormEngine.md#starting-in-a-field).

`id`, `messageId` and `describedBy` tie the field's message to its control. Give `id` to the
element the user operates (the input, or the group of a radio field) and `describedBy` to the same
element as its `aria-describedby`, and render the error or warning message in an element with
`messageId`: a screen reader then reads the message when the user reaches the control. While
`errorMsg` is set, mark the control invalid: `error` does that for a MUI input, anything else
needs `aria-invalid`. All three are undefined where there is no form behind the control. See
[Describing a field](../../../../../docs/FormEngine.md#describing-a-field).

The label must name the control. A MUI `TextField` and a `<label>` around or `for` an input
do that on their own. A control the label cannot point at, such as MUI's `Select`, whose
combobox is a `div`, points at the label instead: give the label the id `` `${id}-label` `` and
the control `labelId` (or `aria-labelledby`) with it, and where `id` is undefined, give the
control `aria-label={label}`. `RendererEnumSimpleSelect` does both.

If you implement an editable grid control you need to make sure that handleChange is only called when needed. Calling handleChange will send a update request to the backend and refresh the grid.

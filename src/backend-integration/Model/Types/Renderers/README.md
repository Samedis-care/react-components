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
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						onChange={(value) => handleChange(field, value)}
						onBlur={handleBlur}
						error={!!errorMsg}
						fullWidth
					/>
					<FormHelperText error={!!errorMsg}>{errorMsg}</FormHelperText>
				</>
			);
		}

		// if the control is not editable we show a basic read-only view. If visibility.grid is true don't show the label
		return (
			<Typography>
				{visibility.grid && `${label} `}:
                {value}
			</Typography>
		);
	}
}

export default RendererYourType;
```

### Remarks

If you implement an editable grid control you need to make sure that handleChange is only called when needed. Calling handleChange will send a update request to the backend and refresh the grid.

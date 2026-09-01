import React from "react";
import { styled, useThemeProps } from "@mui/material";

export interface FormFieldStateWrapperProps {
	/**
	 * The field name as specified in the model
	 */
	field: string;
	/**
	 * Does the field's value differ from the server-side value?
	 * @remarks Mirrors `RenderParams.dirty` for the same field.
	 */
	dirty: boolean;
	/**
	 * The rendered field
	 */
	children: React.ReactNode;
}

export type FormFieldStateWrapperClassKey = "root";

/**
 * Layout neutral element wrapping every field rendered by {@link Field}, carrying the
 * field's state as data attributes so a theme can style the control from the outside.
 *
 * @remarks It exists for the controls that have no state props of their own — file
 * uploads, image selectors, signature pads, nested data grids. Controls that do take a
 * `dirty` prop are also reached directly through `RenderParams.dirty`, which is
 * the better hook whenever the affordance is an element rather than a color.
 *
 * `display: contents` keeps the element out of layout entirely while still making it a
 * CSS ancestor, so `[data-cc-dirty="true"] .MuiInputBase-root {}` works without the
 * wrapper itself occupying a box. A theme override that wants to paint the wrapper
 * (a bar down the side, say) has to set a real `display` along with it.
 */
const Root = styled("div", {
	name: "CcFormFieldStateWrapper",
	slot: "root",
})({
	display: "contents",
});

const FormFieldStateWrapper = (inProps: FormFieldStateWrapperProps) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcFormFieldStateWrapper",
	});
	const { field, dirty, children } = props;
	return (
		<Root data-cc-field={field} data-cc-dirty={dirty}>
			{children}
		</Root>
	);
};

export default React.memo(FormFieldStateWrapper);

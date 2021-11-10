import React from "react";
import { FormHelperText, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import { ColorInput } from "../../../../../standalone";
import { ColorInputProps } from "../../../../../standalone/UIKit/InputControls/ColorInput";
import TypeColor from "../../TypeColor";

export type ModelDataTypeColorRenderer = Omit<
	ColorInputProps,
	| "name"
	| "value"
	| "label"
	| "disabled"
	| "required"
	| "onChange"
	| "onBlur"
	| "error"
>;

/**
 * Renders a text field
 */
class RendererColor extends TypeColor {
	props?: ModelDataTypeColorRenderer;

	constructor(props?: ModelDataTypeColorRenderer) {
		super();

		this.props = props;
	}

	render(params: ModelRenderParams<string>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
		} = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={value}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			return (
				<>
					<ColorInput
						fullWidth
						{...this.props}
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(color: string) => {
							handleChange(field, color);
						}}
						onBlur={handleBlur}
						error={!!errorMsg}
					/>
					<FormHelperText error={!!errorMsg}>{errorMsg}</FormHelperText>
				</>
			);
		}
		return (
			<Typography noWrap={visibility.grid}>
				{!visibility.grid && `${label}: `}
				{value}
			</Typography>
		);
	}
}

export default RendererColor;

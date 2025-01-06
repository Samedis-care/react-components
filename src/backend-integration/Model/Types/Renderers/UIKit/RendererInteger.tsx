import React from "react";
import { TextFieldProps, Typography } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import {
	FormHelperTextCC,
	IntegerInputField,
	NumberFormatter,
} from "../../../../../standalone";
import TypeNumber from "../../TypeNumber";
import { IntegerInputFieldProps } from "../../../../../standalone/UIKit/InputControls/IntegerInputField";

export type ModelDataTypeIntegerRendererCCParams = Omit<
	TextFieldProps,
	| "name"
	| "value"
	| "label"
	| "disabled"
	| "required"
	| "onChange"
	| "onBlur"
	| "error"
	| "multiline"
> &
	Omit<IntegerInputFieldProps, "warning" | "onChange" | "value">;

/**
 * Renders a text field
 */
class RendererInteger extends TypeNumber {
	props?: ModelDataTypeIntegerRendererCCParams;

	constructor(props?: ModelDataTypeIntegerRendererCCParams) {
		super();

		this.props = props;
	}

	render(params: ModelRenderParams<number | null>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
			warningMsg,
		} = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={this.stringify(value)}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			return (
				<>
					<IntegerInputField
						fullWidth
						{...this.props}
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(
							evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
							value: number | null,
						) => {
							handleChange(evt.target.name, value);
						}}
						onBlur={handleBlur}
						error={!!errorMsg}
						warning={!!warningMsg}
					/>
					<FormHelperTextCC error={!!errorMsg} warning={!!warningMsg}>
						{errorMsg || warningMsg}
					</FormHelperTextCC>
				</>
			);
		}
		return (
			<Typography>
				{!visibility.grid && `${label}: `}
				{this.props?.noFormat ? (
					value ? (
						value.toString(10)
					) : (
						""
					)
				) : (
					<NumberFormatter value={value} />
				)}
			</Typography>
		);
	}
}

export default RendererInteger;

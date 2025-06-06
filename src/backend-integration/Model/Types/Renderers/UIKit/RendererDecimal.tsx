import React from "react";
import { TextFieldProps, Typography } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import {
	DecimalInputField,
	FormHelperTextCC,
	NumberFormatter,
} from "../../../../../standalone";
import TypeNumber from "../../TypeNumber";
import { DecimalInputFieldProps } from "../../../../../standalone/UIKit/InputControls/DecimalInputField";

export type ModelDataTypeDecimalRendererCCParams = Omit<
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
	Omit<DecimalInputFieldProps, "warning" | "value" | "onChange">;

/**
 * Renders a text field
 */
class RendererDecimal extends TypeNumber {
	props?: ModelDataTypeDecimalRendererCCParams;

	constructor(props?: ModelDataTypeDecimalRendererCCParams) {
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
					<DecimalInputField
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
				<NumberFormatter value={value} />
			</Typography>
		);
	}
}

export default RendererDecimal;

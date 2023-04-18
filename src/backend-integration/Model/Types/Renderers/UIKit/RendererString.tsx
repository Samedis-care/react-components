import React from "react";
import TypeString from "../../TypeString";
import { TextFieldProps, Typography } from "@mui/material";
import { ModelRenderParams } from "../../../index";
import { FormHelperTextCC, TextFieldWithHelp } from "../../../../../standalone";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";

export type ModelDataTypeStringRendererCCParams = Omit<
	TextFieldProps,
	| "name"
	| "value"
	| "label"
	| "disabled"
	| "required"
	| "onChange"
	| "onBlur"
	| "error"
> &
	Omit<TextFieldWithHelpProps, "warning">;

/**
 * Renders a text field
 */
class RendererString extends TypeString {
	props?: ModelDataTypeStringRendererCCParams;

	constructor(props?: ModelDataTypeStringRendererCCParams) {
		super(props?.multiline);

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
			warningMsg,
		} = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={value ?? ""}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			return (
				<>
					<TextFieldWithHelp
						variant={this.multiline ? "outlined" : undefined}
						fullWidth
						{...this.props}
						name={field}
						value={value ?? ""}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
							handleChange(evt.target.name, evt.target.value);
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
			<Typography noWrap={visibility.grid}>
				{!visibility.grid && `${label}: `}
				{value}
			</Typography>
		);
	}
}

export default RendererString;

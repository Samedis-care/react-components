import React from "react";
import TypeString from "../../TypeString";
import { TextFieldProps, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import {
	FormHelperTextCC,
	TextFieldCC,
} from "../../../../../standalone/UIKit/MuiWarning";

export type ModelDataTypeStringRendererMUIParams = Omit<
	TextFieldProps,
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
class RendererString extends TypeString {
	props?: ModelDataTypeStringRendererMUIParams;

	constructor(props?: ModelDataTypeStringRendererMUIParams) {
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
					<TextFieldCC
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
					<FormHelperTextCC warning={!!warningMsg} error={!!errorMsg}>
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

import React from "react";
import TypeString from "../TypeString";
import {
	FormHelperText,
	TextField,
	TextFieldProps,
	Typography,
} from "@material-ui/core";
import { ModelRenderParams } from "../../index";

export type ModelDataTypeStringRendererMUIParams = Pick<
	TextFieldProps,
	"inputProps" | "InputProps" | "multiline" | "variant"
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
					<TextField
						variant={this.multiline ? "outlined" : undefined}
						fullWidth
						{...this.props}
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
							handleChange(evt.target.name, evt.target.value);
						}}
						onBlur={handleBlur}
						error={!!errorMsg}
					/>
					<FormHelperText error={!!errorMsg}>{errorMsg}</FormHelperText>
				</>
			);
		}
		return (
			<Typography>
				{!visibility.grid && `${label}: `}
				{value}
			</Typography>
		);
	}
}

export default RendererString;

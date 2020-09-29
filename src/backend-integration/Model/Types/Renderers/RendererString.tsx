import React from "react";
import TypeString from "../TypeString";
import { FormHelperText, TextField, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../index";

class RendererString extends TypeString {
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
			return (
				<>
					<TextField
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
						multiline={this.multiline}
						variant={this.multiline ? "outlined" : undefined}
						fullWidth
					/>
					<FormHelperText error={!!errorMsg}>{errorMsg}</FormHelperText>
				</>
			);
		}
		return <Typography>{value}</Typography>;
	}
}

export default RendererString;

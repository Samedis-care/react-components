import React from "react";
import { Typography } from "@mui/material";
import TypeStringNullable from "../../TypeStringNullable";
import ModelRenderParams from "../../../RenderParams";
import { FormHelperTextCC, TextFieldWithHelp } from "../../../../../standalone";
import type { ModelDataTypeStringRendererCCParams } from "./RendererString";

/**
 * Renders a text field for a string that can be unset (null)
 * @remarks null shows as empty. Editing sets a string, so a cleared field holds "", not null.
 */
class RendererStringNullable extends TypeStringNullable {
	props?: ModelDataTypeStringRendererCCParams;

	constructor(props?: ModelDataTypeStringRendererCCParams) {
		super(props?.multiline);

		this.props = props;
	}

	// also takes the non-nullable string's params: RendererString renders through this
	render(
		params: ModelRenderParams<string | null> | ModelRenderParams<string>,
	): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
			warningMsg,
			dirty,
			autoFocus,
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
						dirty={dirty}
						autoFocus={autoFocus}
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

export default RendererStringNullable;

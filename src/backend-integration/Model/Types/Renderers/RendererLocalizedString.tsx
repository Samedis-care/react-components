import React from "react";
import { Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import MultiLanguageInput, {
	MultiLanguageInputProps,
	MultiLanguageInputSupportedLanguages,
} from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import TypeLocalizedString from "../TypeLocalizedString";
import { FormHelperTextCC } from "../../../../standalone";

export type ModelDataTypeLocalizedStringRendererParams = Omit<
	MultiLanguageInputProps,
	| "name"
	| "values"
	| "label"
	| "disabled"
	| "required"
	| "onChange"
	| "onBlur"
	| "error"
	| "warning"
>;

/**
 * Renders a text field
 */
class RendererLocalizedString extends TypeLocalizedString {
	props: ModelDataTypeLocalizedStringRendererParams;

	constructor(props: ModelDataTypeLocalizedStringRendererParams) {
		super(props?.multiline);

		this.props = props;
	}

	render(
		params: ModelRenderParams<
			Partial<Record<MultiLanguageInputSupportedLanguages, string>>
		>
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
		} = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={JSON.stringify(value ?? {})}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			return (
				<>
					<MultiLanguageInput
						{...this.props}
						name={field}
						values={value ?? {}}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(
							newValues: Partial<
								Record<MultiLanguageInputSupportedLanguages, string>
							>
						) => {
							handleChange(field, newValues);
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
				{this.stringify(value)}
			</Typography>
		);
	}
}

export default RendererLocalizedString;

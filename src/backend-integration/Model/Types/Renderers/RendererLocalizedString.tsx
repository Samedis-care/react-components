import React from "react";
import { Typography } from "@mui/material";
import { ModelRenderParams } from "../../index";
import MultiLanguageInput, {
	MultiLanguageInputProps,
	MultiLanguageInputSupportedLanguages,
} from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import TypeLocalizedString from "../TypeLocalizedString";
import { FormHelperTextCC } from "../../../../standalone";
import { TypeSettings } from "../../Type";

export type ModelDataTypeLocalizedStringRendererGetFallbackLabel = (
	value: Partial<Record<MultiLanguageInputSupportedLanguages, string>>,
	values: Record<string, unknown>
) => string;

export interface ModelDataTypeLocalizedStringRendererParamsExtra {
	/**
	 * fallback label for data-grid view
	 */
	getFallbackLabel?: ModelDataTypeLocalizedStringRendererGetFallbackLabel;
	/**
	 * Values used in getFallbackLabel
	 * @see TypeSettings.updateHooks
	 */
	getFallbackLabelValues?: string[];
}

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
> &
	ModelDataTypeLocalizedStringRendererParamsExtra;

/**
 * Renders a text field
 */
class RendererLocalizedString extends TypeLocalizedString {
	props: Omit<
		ModelDataTypeLocalizedStringRendererParams,
		keyof ModelDataTypeLocalizedStringRendererParamsExtra
	>;
	settings: TypeSettings;
	extra: ModelDataTypeLocalizedStringRendererParamsExtra;

	constructor(props: ModelDataTypeLocalizedStringRendererParams) {
		super(props?.multiline);

		const { getFallbackLabel, getFallbackLabelValues, ...other } = props;
		this.props = other;
		this.extra = {
			getFallbackLabel,
			getFallbackLabelValues,
		};
		this.settings = {
			updateHooks: getFallbackLabelValues,
		};
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
				{this.stringify(value) ||
					(this.extra.getFallbackLabel
						? this.extra.getFallbackLabel(value, params.values)
						: "")}
			</Typography>
		);
	}
}

export default RendererLocalizedString;

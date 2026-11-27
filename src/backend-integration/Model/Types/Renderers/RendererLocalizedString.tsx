import React from "react";
import { Typography } from "@mui/material";
import ModelRenderParams from "../../RenderParams";
import MultiLanguageInput, {
	MultiLanguageInputProps,
	MultiLanguageInputSupportedLanguages,
} from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import TypeLocalizedString from "../TypeLocalizedString";
import { FormHelperTextCC } from "../../../../standalone/UIKit/MuiFieldState";
import { TypeSettings } from "../../Type";

/**
 * Gives the text a grid cell or read-only field shows while the value has no
 * text in the UI language
 * @param value The value
 * @param values The record's values, those named in getFallbackLabelValues
 * included
 * @returns The text; an empty string to show the first enabled language that
 * has text instead
 */
export type ModelDataTypeLocalizedStringRendererGetFallbackLabel = (
	value: Partial<Record<MultiLanguageInputSupportedLanguages, string>>,
	values: Record<string, unknown>,
) => string;

export interface ModelDataTypeLocalizedStringRendererParamsExtra {
	/**
	 * The text a grid cell or read-only field shows while the value has no text
	 * in the components-care UI language (or only whitespace); not called while
	 * it has. Without it, or while it returns an empty string, the text of the
	 * first language in `enabledLanguages` that has text shows, marked with its
	 * language (`lang`), as `stringify` returns it.
	 * @default none: the first enabled language that has text
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
	| "autoFocus"
	| "warning"
> &
	ModelDataTypeLocalizedStringRendererParamsExtra;

/**
 * Renders a localized string: a MultiLanguageInput when editable, otherwise
 * its text in the UI language, falling back to the first enabled language that
 * has text (see getFallbackLabel)
 */
class RendererLocalizedString extends TypeLocalizedString {
	props: Omit<
		ModelDataTypeLocalizedStringRendererParams,
		keyof ModelDataTypeLocalizedStringRendererParamsExtra
	>;
	settings: TypeSettings;
	extra: ModelDataTypeLocalizedStringRendererParamsExtra;

	constructor(props: ModelDataTypeLocalizedStringRendererParams) {
		super(props?.multiline, props?.enabledLanguages ?? null);

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
		>,
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
							>,
						) => {
							handleChange(field, newValues);
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
		const uiLanguageText = this.getUiLanguageText(value);
		const fallbackLabel = uiLanguageText
			? ""
			: (this.extra.getFallbackLabel?.(value, params.values) ?? "");
		const fallbackText =
			uiLanguageText || fallbackLabel ? null : this.getFallbackText(value);
		return (
			<Typography noWrap={visibility.grid}>
				{!visibility.grid && `${label}: `}
				{fallbackText ? (
					// another language than the page's, for screen readers
					<span lang={fallbackText.language}>{fallbackText.text}</span>
				) : (
					(uiLanguageText?.text ?? fallbackLabel)
				)}
			</Typography>
		);
	}
}

export default RendererLocalizedString;

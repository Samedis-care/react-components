import React from "react";
import { TextFieldProps, Typography } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import { FormHelperTextCC, TextFieldWithHelp } from "../../../../../standalone";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";
import TypeLocalizedString from "../../TypeLocalizedString";
import { MultiLanguageInputSupportedLanguages } from "../../../../../standalone/UIKit/InputControls/MultiLanguageInput";

export type ModelDataTypeStringLocalizedSingleRendererCCParams = Omit<
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

export const ModelDataTypeStringLocalizedSingleRendererContext =
	React.createContext<MultiLanguageInputSupportedLanguages | null>(null);

/**
 * Renders a text field
 */
class RendererStringLocalizedSingle extends TypeLocalizedString {
	props?: ModelDataTypeStringLocalizedSingleRendererCCParams;

	constructor(props?: ModelDataTypeStringLocalizedSingleRendererCCParams) {
		super(props?.multiline);

		this.props = props;
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
				<ModelDataTypeStringLocalizedSingleRendererContext.Consumer>
					{(language) => {
						if (!language)
							throw new Error(
								"Please wrap field" +
									field +
									" with ModelDataTypeStringLocalizedSingleRendererContext.Provider and specify a language",
							);
						return (
							<>
								{" "}
								<TextFieldWithHelp
									variant={this.multiline ? "outlined" : undefined}
									fullWidth
									{...this.props}
									name={field}
									value={value[language] ?? ""}
									label={label}
									disabled={visibility.readOnly}
									required={visibility.required}
									onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
										handleChange(evt.target.name, {
											...value,
											[language]: evt.target.value,
										});
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
					}}
				</ModelDataTypeStringLocalizedSingleRendererContext.Consumer>
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

export default RendererStringLocalizedSingle;

import React from "react";
import { TextFieldProps, Typography } from "@mui/material";
import { ModelRenderParams } from "../../../index";
import { FormHelperTextCC, NumberFormatter } from "../../../../../standalone";
import TypeNumber from "../../TypeNumber";
import CurrencyInput, {
	CurrencyInputProps,
} from "../../../../../standalone/UIKit/InputControls/CurrencyInput";
import { TypeSettings } from "../../../Type";

export interface ModelDataTypeDecimalCurrencyRendererCCParams
	extends Omit<
			CurrencyInputProps,
			"currency" | "value" | "onChange" | "warning"
		>,
		Omit<
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
		> {
	/**
	 * The currency or callback to derive currency from other record values
	 */
	currency: string | ((values: Record<string, unknown>) => string);
	/**
	 * The currency update fields (use when using get currency callback)
	 * List the fields used in the callback (dependencies) in here using dot notation
	 */
	currencyUpdateFields?: string[];
}

/**
 * Renders a text field
 */
class RendererDecimalCurrency extends TypeNumber {
	props: ModelDataTypeDecimalCurrencyRendererCCParams;
	settings: TypeSettings = {};

	constructor(props: ModelDataTypeDecimalCurrencyRendererCCParams) {
		super();
		this.settings.updateHooks = props.currencyUpdateFields;

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
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { currencyUpdateFields, ...otherProps } = this.props;

			return (
				<>
					<CurrencyInput
						fullWidth
						{...otherProps}
						currency={this.getCurrency(params.values)}
						name={field}
						value={value}
						label={label}
						disabled={visibility.readOnly}
						required={visibility.required}
						onChange={(
							evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
							value: number | null
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
				<NumberFormatter
					value={value}
					options={{
						style: "currency",
						currency: this.getCurrency(params.values),
					}}
				/>
			</Typography>
		);
	}

	getCurrency = (params: Record<string, unknown>): string => {
		if (typeof this.props.currency === "function") {
			return this.props.currency(params);
		}
		return this.props.currency;
	};
}

export default RendererDecimalCurrency;

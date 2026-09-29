import React from "react";
import {
	FormControlLabel,
	FormHelperText,
	FormLabel,
	Radio,
	RadioGroup,
	Typography,
} from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import TypeEnum, { EnumValue } from "../../TypeEnum";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone";

export type WrapButtonFunc = (
	btn: React.ReactElement,
	value: EnumValue,
) => React.ReactElement;

/**
 * Renders TypeEnum as radio buttons
 */
class RendererEnumRadio extends TypeEnum {
	protected horizontal: boolean;
	protected wrapButton: WrapButtonFunc;

	constructor(
		values: EnumValue[],
		horizontal = false,
		wrapButton: WrapButtonFunc = (btn: React.ReactElement) => btn,
		numericMode = false,
	) {
		super(values, numericMode);

		this.horizontal = horizontal;
		this.wrapButton = wrapButton;
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
			dirty,
			autoFocus,
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

			// where tabbing into the group lands: the checked option, else the first one
			const focusable = this.values.filter(
				(entry) => !entry.invisible && !entry.disabled,
			);
			const focusValue = autoFocus
				? (focusable.find((entry) => entry.value === value) ?? focusable[0])
						?.value
				: undefined;

			return (
				<FormControlFieldsetCC
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
					warning={!!warningMsg}
					dirty={dirty}
				>
					<FormLabel component={"legend"}>{label}</FormLabel>
					<RadioGroup
						name={field}
						value={value}
						onChange={(evt) => handleChange(evt.target.name, evt.target.value)}
						onBlur={handleBlur}
						data-name={field}
						row={this.horizontal}
					>
						{this.values
							.filter((value) => !value.invisible)
							.map((entry) =>
								this.wrapButton(
									<FormControlLabel
										key={entry.value}
										value={entry.value}
										control={<Radio autoFocus={entry.value === focusValue} />}
										label={entry.getLabel()}
										disabled={visibility.readOnly || entry.disabled}
									/>,
									entry,
								),
							)}
					</RadioGroup>
					<FormHelperText>{errorMsg || warningMsg}</FormHelperText>
				</FormControlFieldsetCC>
			);
		}
		const valueInfo = this.values.find((entry) => entry.value === value);
		return (
			<Typography>
				{!visibility.grid && `${label}: `}
				{valueInfo
					? valueInfo.getLabel()
					: ccI18n.t("backend-integration.model.types.renderers.enum.unknown")}
			</Typography>
		);
	}
}

export default RendererEnumRadio;

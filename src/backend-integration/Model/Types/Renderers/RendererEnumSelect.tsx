import React from "react";
import { FormHelperText, Typography } from "@mui/material";
import ModelRenderParams from "../../RenderParams";
import TypeEnum, { EnumValue } from "../TypeEnum";
import ccI18n from "../../../../i18n";
import {
	BaseSelectorData,
	BaseSelectorProps,
	getStringLabel,
	SingleSelect,
} from "../../../../standalone/Selector";
import { FormControlFieldsetCC } from "../../../../standalone";
import uniqueArray from "../../../../utils/uniqueArray";

export type RendererEnumSelectProps = Omit<
	BaseSelectorProps<BaseSelectorData, false>,
	"selected" | "onLoad" | "onSelect" | "disabled"
>;

export type AdvancedEnumValue = Omit<BaseSelectorData, "label"> &
	Pick<EnumValue, "getLabel" | "invisible" | "invisibleInGridFilter">;

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererEnumSelect extends TypeEnum {
	private props?: RendererEnumSelectProps;

	constructor(
		values: AdvancedEnumValue[],
		props?: RendererEnumSelectProps,
		numericMode = false,
	) {
		super(values, numericMode);
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
					value={value}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			const data: BaseSelectorData[] = (this.values as AdvancedEnumValue[])
				.filter((entry) => !entry.invisible || value === entry.value)
				.map((entry) => ({
					...entry,
					label: entry.getLabel(),
					isDisabled: entry.invisible || entry.isDisabled,
				}));
			const selected = data.find((entry) => entry.value === value) || null;

			const onLoad = (query: string) =>
				uniqueArray([
					...data.filter((entry) =>
						getStringLabel(entry).toLowerCase().startsWith(query.toLowerCase()),
					),
					...data.filter((entry) =>
						getStringLabel(entry).toLowerCase().includes(query.toLowerCase()),
					),
				]);

			return (
				<FormControlFieldsetCC
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
					warning={!!warningMsg}
					onBlur={handleBlur}
					name={field}
				>
					<SingleSelect
						refreshToken={this.values.map((e) => e.value).join(",")}
						{...this.props}
						label={label}
						selected={selected}
						onLoad={onLoad}
						onSelect={(value) => handleChange(field, value ? value.value : "")}
						disabled={visibility.readOnly}
						required={visibility.required}
					/>
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

export default RendererEnumSelect;

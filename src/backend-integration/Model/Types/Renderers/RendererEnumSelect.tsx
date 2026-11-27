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
import { DistributiveOmit } from "../../../../utils/distributiveOmit";

/**
 * The params of ModelDataTypeEnumSelectRenderer: the props of the SingleSelect
 * it renders while the field is editable (placeholder, enableIcons, grouped,
 * noOptionsText and the like). It sets label, required, dirty, error, warning
 * and autocompleteId from the field, over the ones given here.
 * disableClearable defaults to true unless the enum starts empty (its default
 * value is `""`).
 */
export type RendererEnumSelectProps = DistributiveOmit<
	BaseSelectorProps<BaseSelectorData, false>,
	"selected" | "onLoad" | "onSelect" | "disabled" | "autoFocus"
>;

/**
 * One value of ModelDataTypeEnumSelectRenderer: the enum value's value,
 * getLabel, invisible and invisibleInGridFilter, plus the fields of a selector
 * entry other than label and value (icon, group, isDisabled, isDivider and the
 * like). An invisible value is left out of the options unless it is the
 * field's value, which then shows disabled.
 * @typeParam T The enum's values
 */
export type AdvancedEnumValue<T extends string = string> = Omit<
	BaseSelectorData,
	"label" | "value"
> &
	Pick<
		EnumValue<T>,
		"value" | "getLabel" | "invisible" | "invisibleInGridFilter"
	>;

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererEnumSelect<T extends string = string> extends TypeEnum<T> {
	private props?: RendererEnumSelectProps;

	constructor(
		values: AdvancedEnumValue<T>[],
		defaultValue: NoInfer<T>,
		props?: RendererEnumSelectProps,
		numericMode = false,
	) {
		super(values, defaultValue, numericMode);
		this.props = props;
	}

	render(params: ModelRenderParams<T>): React.ReactElement {
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
			id,
			messageId,
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

			const onLoad = (query: string) => ({
				options: uniqueArray([
					...data.filter((entry) =>
						getStringLabel(entry).toLowerCase().startsWith(query.toLowerCase()),
					),
					...data.filter((entry) =>
						getStringLabel(entry).toLowerCase().includes(query.toLowerCase()),
					),
				]),
			});

			return (
				<FormControlFieldsetCC
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
					warning={!!warningMsg}
					dirty={dirty}
					onBlur={handleBlur}
					name={field}
				>
					<SingleSelect
						refreshToken={this.values.map((e) => e.value).join(",")}
						// only an enum that starts empty can be emptied
						disableClearable={this.defaultValue !== ""}
						{...this.props}
						label={label}
						selected={selected}
						onLoad={onLoad}
						// the options are the enum's values
						onSelect={(value) =>
							handleChange(
								field,
								value ? (value.value as T) : this.defaultValue,
							)
						}
						disabled={visibility.readOnly}
						required={visibility.required}
						dirty={dirty}
						autoFocus={autoFocus}
						autocompleteId={id}
						error={!!errorMsg}
						warning={!!warningMsg}
					/>
					<FormHelperText id={messageId}>
						{errorMsg || warningMsg}
					</FormHelperText>
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

import React from "react";
import { FormHelperText, Typography } from "@mui/material";
import { ModelRenderParams } from "../../../index";
import TypeEnumMulti, { AdvancedMultiEnumValue } from "../TypeEnumMulti";
import ccI18n from "../../../../i18n";
import {
	BaseSelectorData,
	FormControlFieldsetCC,
	getStringLabel,
	MultiSelectorData,
	MultiSelectProps,
} from "../../../../standalone";
import MultiSelect from "../../../../standalone/Selector/MultiSelect";

export type RendererEnumMultiSelectProps = Omit<
	MultiSelectProps<MultiSelectorData>,
	"label" | "selected" | "onLoad" | "onSelect" | "disabled"
>;

/**
 * Renders TypeEnumMulti as selector
 */
class RendererEnumMultiSelect extends TypeEnumMulti {
	props?: RendererEnumMultiSelectProps;

	constructor(
		values: AdvancedMultiEnumValue[],
		props?: RendererEnumMultiSelectProps
	) {
		super(values);
		this.props = props;
	}

	render(params: ModelRenderParams<string[]>): React.ReactElement {
		const {
			visibility,
			field,
			label,
			handleChange,
			handleBlur,
			errorMsg,
			warningMsg,
			value,
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

			const data: BaseSelectorData[] = this.values
				.filter((entry) => !entry.invisible)
				.map((entry) => ({
					...entry,
					label: entry.getLabel(),
				}));
			const selected = data.filter((entry) => value.includes(entry.value));

			const onLoad = (query: string) =>
				data.filter((entry) =>
					getStringLabel(entry).toLowerCase().includes(query.toLowerCase())
				);

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
					<MultiSelect
						label={label}
						selected={selected}
						onLoad={onLoad}
						onSelect={(selected) =>
							handleChange(
								field,
								selected.map((entry) => entry.value)
							)
						}
						disabled={visibility.readOnly}
						{...this.props}
					/>
					<FormHelperText>{errorMsg || warningMsg}</FormHelperText>
				</FormControlFieldsetCC>
			);
		}
		return (
			<Typography>
				{!visibility.grid && `${label}: `}
				{value
					.map((enumValue) => {
						const valueInfo = this.values.find(
							(entry) => entry.value === enumValue
						);
						return valueInfo
							? valueInfo.getLabel()
							: ccI18n.t(
									"backend-integration.model.types.renderers.enum.unknown"
							  );
					})
					.join(", ")}
			</Typography>
		);
	}
}

export default RendererEnumMultiSelect;

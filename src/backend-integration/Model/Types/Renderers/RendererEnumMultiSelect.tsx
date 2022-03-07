import React from "react";
import { FormControl, FormHelperText, Typography } from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import TypeEnumMulti from "../TypeEnumMulti";
import ccI18n from "../../../../i18n";
import { EnumValue } from "../TypeEnum";
import { BaseSelectorData } from "../../../../standalone";
import { AdvancedEnumValue } from "./RendererEnumSelect";
import MultiSelect from "../../../../standalone/Selector/MultiSelect";

/**
 * Renders TypeEnumMulti as checkboxes
 */
class RendererEnumMultiSelect extends TypeEnumMulti {
	constructor(values: EnumValue[]) {
		super(values);
	}

	render(params: ModelRenderParams<string[]>): React.ReactElement {
		const {
			visibility,
			field,
			label,
			handleChange,
			handleBlur,
			errorMsg,
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

			const data: BaseSelectorData[] = (this.values as AdvancedEnumValue[])
				.filter((entry) => !entry.invisible)
				.map((entry) => ({
					...entry,
					label: entry.getLabel(),
				}));
			const selected = data.filter((entry) => value.includes(entry.value));

			const onLoad = (query: string) =>
				data.filter((entry) =>
					entry.label.toLowerCase().includes(query.toLowerCase())
				);

			return (
				<FormControl
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
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
					/>
					<FormHelperText>{errorMsg}</FormHelperText>
				</FormControl>
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

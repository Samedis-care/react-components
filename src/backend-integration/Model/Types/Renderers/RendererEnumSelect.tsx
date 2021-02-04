import React from "react";
import {
	FormControl,
	FormHelperText,
	FormLabel,
	Typography,
} from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import TypeEnum from "../TypeEnum";
import ccI18n from "../../../../i18n";
import {
	BaseSelectorData,
	SingleSelect,
} from "../../../../standalone/Selector";

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererEnumSelect extends TypeEnum {
	render(params: ModelRenderParams<string>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
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

			const data: BaseSelectorData[] = this.values.map((entry) => ({
				value: entry.value,
				label: entry.getLabel(),
			}));
			const selected = data.find((entry) => entry.value === value) || null;

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
				>
					<FormLabel component={"legend"}>{label}</FormLabel>
					<SingleSelect
						selected={selected}
						onLoad={onLoad}
						onSelect={(value) => handleChange(field, value ? value.value : "")}
						disabled={visibility.readOnly}
					/>
					<FormHelperText>{errorMsg}</FormHelperText>
				</FormControl>
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

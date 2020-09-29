import React from "react";
import {
	FormControl,
	FormHelperText,
	FormLabel,
	MenuItem,
	Select,
	Typography,
} from "@material-ui/core";
import { ModelRenderParams } from "../../index";
import TypeEnum from "../TypeEnum";
import ccI18n from "../../../../i18n";

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
			return (
				<FormControl
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
				>
					<FormLabel component={"legend"}>{label}</FormLabel>
					<Select
						name={field}
						value={value}
						onChange={(evt) => handleChange(field, evt.target.value as string)}
						onBlur={handleBlur}
					>
						{this.values.map((entry) => (
							<MenuItem key={entry.value} value={entry.value}>
								{entry.getLabel()}
							</MenuItem>
						))}
					</Select>
					<FormHelperText>{errorMsg}</FormHelperText>
				</FormControl>
			);
		}
		const valueInfo = this.values.find((entry) => entry.value === value);
		return (
			<Typography>
				{valueInfo
					? valueInfo.getLabel()
					: ccI18n.t("backend-integration.model.types.renderers.enum.unknown")}
			</Typography>
		);
	}
}

export default RendererEnumSelect;

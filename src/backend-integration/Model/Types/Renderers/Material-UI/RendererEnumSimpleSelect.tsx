import React from "react";
import {
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import TypeEnum from "../../TypeEnum";
import ccI18n from "../../../../../i18n";
import { FormControlFieldsetCC } from "../../../../../standalone";

/**
 * Renders TypeEnum as drop-down selector (without search)
 */
class RendererEnumSelect<T extends string = string> extends TypeEnum<T> {
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
			describedBy,
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
			// the combobox is a div, which a label's htmlFor cannot reach: it and its list of
			// options point at the label by id, else (no form behind them, e.g. a data grid
			// cell) take its text
			const labelId = id && `${id}-label`;
			const nameProps = labelId ? undefined : { "aria-label": label };
			return (
				<FormControlFieldsetCC
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
					warning={!!warningMsg}
					dirty={dirty}
				>
					<InputLabel id={labelId} shrink>
						{label}
					</InputLabel>
					<Select
						name={field}
						value={value}
						disabled={visibility.readOnly}
						// the options are the enum's values
						onChange={(evt) => handleChange(field, evt.target.value as T)}
						onBlur={handleBlur}
						autoFocus={autoFocus}
						labelId={labelId}
						inputProps={nameProps}
						MenuProps={nameProps && { slotProps: { list: nameProps } }}
						SelectDisplayProps={{ id }}
						aria-describedby={describedBy}
					>
						{this.values.map((entry) => (
							<MenuItem
								key={entry.value}
								value={entry.value}
								disabled={entry.disabled}
							>
								{entry.getLabel()}
							</MenuItem>
						))}
					</Select>
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

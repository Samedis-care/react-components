import React from "react";
import {
	FormControlLabel,
	FormHelperText,
	FormLabel,
	Typography,
	Checkbox,
	FormGroup,
} from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import TypeEnumMulti from "../../TypeEnumMulti";
import ccI18n from "../../../../../i18n";
import { EnumValue } from "../../TypeEnum";
import { FormControlFieldsetCC } from "../../../../../standalone";

export type WrapButtonFunc = (
	btn: React.ReactElement,
	value: EnumValue
) => React.ReactElement;

/**
 * Renders TypeEnumMulti as checkboxes
 */
class RendererEnumRadio extends TypeEnumMulti {
	protected horizontal: boolean;
	protected wrapButton: WrapButtonFunc;

	constructor(
		values: EnumValue[],
		horizontal = false,
		wrapButton: WrapButtonFunc = (btn: React.ReactElement) => btn
	) {
		super(values);

		this.horizontal = horizontal;
		this.wrapButton = wrapButton;
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

			return (
				<FormControlFieldsetCC
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
					warning={!!warningMsg}
				>
					<FormLabel component={"legend"}>{label}</FormLabel>
					<FormGroup
						onBlur={handleBlur}
						row={this.horizontal}
						data-name={field}
					>
						{this.values
							.filter((entry) => !entry.invisible)
							.map((entry) =>
								this.wrapButton(
									<FormControlLabel
										key={entry.value}
										value={entry.value}
										control={
											<Checkbox
												checked={value.includes(entry.value)}
												name={entry.value}
												onChange={(evt) =>
													handleChange(
														field,
														evt.target.checked
															? value.concat([entry.value]) // add value
															: value.filter((v) => v !== entry.value) // remove value
													)
												}
											/>
										}
										label={entry.getLabel()}
										disabled={visibility.readOnly}
									/>,
									entry
								)
							)}
					</FormGroup>
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

export default RendererEnumRadio;

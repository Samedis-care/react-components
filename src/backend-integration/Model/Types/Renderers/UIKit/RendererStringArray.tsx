import React from "react";
import { TextFieldProps, Typography } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import {
	FormHelperTextCC,
	GroupBox,
	TextFieldWithHelp,
} from "../../../../../standalone";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";
import TypeStringArray from "../../TypeStringArray";
import { useMountLogging } from "../../../../../utils";
import useCCTranslations from "../../../../../utils/useCCTranslations";
import addSlotAttributes from "../../../../../utils/internal/addSlotAttributes";

export type ModelDataTypeStringArrayRendererCCParams = Omit<
	TextFieldProps,
	| "name"
	| "value"
	| "label"
	| "multiline"
	| "placeholder"
	| "disabled"
	| "required"
	| "onChange"
	| "onBlur"
	| "error"
	| "autoFocus"
> &
	Omit<TextFieldWithHelpProps, "warning">;

/**
 * Renders text fields inside a group box
 */
class RendererStringArray extends TypeStringArray {
	props?: ModelDataTypeStringArrayRendererCCParams;

	constructor(props?: ModelDataTypeStringArrayRendererCCParams) {
		super();

		this.props = props;
	}

	render(params: ModelRenderParams<string[]>): React.ReactElement {
		const { visibility, field, value, label } = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={this.stringify(value ?? [])}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			return <RendererStringArrayComponent options={this.props} {...params} />;
		}
		return (
			<Typography noWrap={visibility.grid}>
				{!visibility.grid && `${label}: `}
				{(value ?? []).join("; ")}
			</Typography>
		);
	}
}

const RendererStringArrayComponent = (
	props: {
		options?: ModelDataTypeStringArrayRendererCCParams;
	} & ModelRenderParams<string[]>,
) => {
	const {
		options,
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
	} = props;

	useMountLogging(RendererStringArrayComponent);
	const { t } = useCCTranslations();

	const textField = (idx: number) => (
		<TextFieldWithHelp
			key={"input_" + idx}
			fullWidth
			{...options}
			name={`${field}`}
			value={value[idx] ?? ""}
			disabled={visibility.readOnly}
			required={visibility.required}
			onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
				const newValue = [...value];
				newValue[idx] = evt.target.value;
				handleChange(field, newValue);
			}}
			onBlur={(evt: React.FocusEvent<HTMLInputElement>) => {
				handleChange(field, value.filter(Boolean));
				handleBlur(evt);
			}}
			error={!!errorMsg}
			warning={!!warningMsg}
			dirty={dirty}
			// the empty entry at the end, where a new value goes
			autoFocus={autoFocus && idx === value.length}
			// the group box's legend shows the label once for all entries
			slotProps={addSlotAttributes(options?.slotProps, "htmlInput", {
				"aria-label":
					idx === value.length
						? t(
								"backend-integration.model.types.renderers.string-array.new-entry",
								{ LABEL: label },
							)
						: t(
								"backend-integration.model.types.renderers.string-array.entry",
								{ LABEL: label, NUM: idx + 1 },
							),
			})}
		/>
	);

	return (
		<GroupBox label={label} id={id} aria-describedby={describedBy}>
			{value.map((_, idx) => textField(idx)).concat(textField(value.length))}
			<FormHelperTextCC
				id={messageId}
				error={!!errorMsg}
				warning={!!warningMsg}
			>
				{errorMsg || warningMsg}
			</FormHelperTextCC>
		</GroupBox>
	);
};

export default RendererStringArray;

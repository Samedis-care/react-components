import React from "react";
import { FormHelperText } from "@mui/material";
import { ModelFieldName, ModelRenderParams, PageVisibility } from "../../index";
import TypeStringArray from "../TypeStringArray";
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "../../../../backend-components/Selector/BackendMultiSelect";
import Model from "../../Model";
import {
	FormControlFieldsetCC,
	MultiSelectorData,
} from "../../../../standalone";

type OmitProperties =
	| "selected"
	| "onSelect"
	| "disabled"
	| "model"
	| "initialData";

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendMultiSelect<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends TypeStringArray {
	private readonly props: Omit<
		BackendMultiSelectProps<KeyT, VisibilityT, CustomT, MultiSelectorData>,
		OmitProperties
	>;

	constructor(
		props: Omit<
			BackendMultiSelectProps<KeyT, VisibilityT, CustomT, MultiSelectorData>,
			OmitProperties
		>
	) {
		super();
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
			relationData,
			relationModel,
			value,
		} = params;

		if (visibility.disabled) return <></>;
		if (visibility.hidden) {
			return (
				<input
					type="hidden"
					name={field}
					value={this.stringify(value)}
					readOnly
					aria-hidden={"true"}
				/>
			);
		}
		if (visibility.editable) {
			if (visibility.grid) throw new Error("Not supported");

			if (!relationModel)
				throw new Error(
					"Type BackendMultiSelect requires relation model: " + field
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
					<BackendMultiSelect
						selected={value}
						label={label}
						onSelect={(value) => handleChange(field, value)}
						disabled={visibility.readOnly}
						model={
							(relationModel as unknown) as Model<KeyT, VisibilityT, CustomT>
						}
						initialData={relationData}
						{...this.props}
					/>
					<FormHelperText>{errorMsg || warningMsg}</FormHelperText>
				</FormControlFieldsetCC>
			);
		}

		throw new Error("view-only rendering not supported");
	}
}

export default RendererBackendMultiSelect;

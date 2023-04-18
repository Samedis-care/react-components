import React from "react";
import { FormHelperText } from "@mui/material";
import { ModelFieldName, ModelRenderParams, PageVisibility } from "../../index";
import TypeStringArray from "../TypeStringArray";
import Model from "../../Model";
import BackendMultiSelectWithTags, {
	BackendMultiSelectWithTagsProps,
} from "../../../../backend-components/Selector/BackendMultiSelectWithTags";
import {
	BaseSelectorData,
	FormControlFieldsetCC,
	MultiSelectorData,
} from "../../../../standalone";

type OmitProperties =
	| "selected"
	| "onSelect"
	| "disabled"
	| "dataModel"
	| "initialData"
	| "title";

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendMultiSelectWithTags<
	GroupKeyT extends ModelFieldName,
	DataKeyT extends ModelFieldName,
	GroupVisibilityT extends PageVisibility,
	DataVisibilityT extends PageVisibility,
	GroupCustomT,
	DataCustomT,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData
> extends TypeStringArray {
	private readonly props: Omit<
		BackendMultiSelectWithTagsProps<
			GroupKeyT,
			DataKeyT,
			GroupVisibilityT,
			DataVisibilityT,
			GroupCustomT,
			DataCustomT,
			GroupDataT,
			DataDataT
		>,
		OmitProperties
	>;

	constructor(
		props: Omit<
			BackendMultiSelectWithTagsProps<
				GroupKeyT,
				DataKeyT,
				GroupVisibilityT,
				DataVisibilityT,
				GroupCustomT,
				DataCustomT,
				GroupDataT,
				DataDataT
			>,
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
					<BackendMultiSelectWithTags
						selected={value}
						onChange={(value) => handleChange(field, value)}
						disabled={visibility.readOnly}
						dataModel={
							(relationModel as unknown) as Model<
								DataKeyT,
								DataVisibilityT,
								DataCustomT
							>
						}
						initialData={relationData}
						title={label}
						{...this.props}
					/>
					<FormHelperText>{errorMsg || warningMsg}</FormHelperText>
				</FormControlFieldsetCC>
			);
		}

		throw new Error("view-only rendering not supported");
	}
}

export default RendererBackendMultiSelectWithTags;

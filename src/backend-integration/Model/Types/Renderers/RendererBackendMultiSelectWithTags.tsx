import React from "react";
import { FormHelperText } from "@mui/material";
import { ModelIdFilterData, ModelRecord, ModelUnknown } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import BackendMultiSelectWithTags, {
	BackendMultiSelectWithTagsProps,
} from "../../../../backend-components/Selector/BackendMultiSelectWithTags";
import {
	BaseSelectorData,
	FormControlFieldsetCC,
	MultiSelectorData,
} from "../../../../standalone";
import TypeIds from "../TypeIds";

type OmitProperties =
	| "selected"
	| "onSelect"
	| "disabled"
	| "dataModel"
	| "initialData"
	| "title"
	| "autoFocus";

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendMultiSelectWithTags<
	GroupModelT extends ModelUnknown,
	DataModelT extends ModelUnknown,
	GroupDataT extends BaseSelectorData,
	DataDataT extends MultiSelectorData,
> extends TypeIds {
	idFilter?: ModelIdFilterData;
	private readonly props: Omit<
		BackendMultiSelectWithTagsProps<
			GroupModelT,
			DataModelT,
			GroupDataT,
			DataDataT
		>,
		OmitProperties
	>;

	constructor(
		props: Omit<
			BackendMultiSelectWithTagsProps<
				GroupModelT,
				DataModelT,
				GroupDataT,
				DataDataT
			>,
			OmitProperties
		>,
	) {
		super();
		this.props = props;
		// the grid's ID filter selects records of the same relation model
		this.idFilter = {
			...props,
			groupSorter: undefined,
			getIdOfData: undefined,
			modelToSelectorData: props.convData,
			sort: props.dataSort,
			lru: undefined,
			endAdornment: undefined,
		} as unknown as ModelIdFilterData;
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
			dirty,
			autoFocus,
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
					"Type BackendMultiSelect requires relation model: " + field,
				);

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
					<BackendMultiSelectWithTags
						selected={value}
						onChange={(value) => handleChange(field, value)}
						disabled={visibility.readOnly}
						required={visibility.required}
						dataModel={relationModel as DataModelT}
						// the form's relations hold deserialized records of the relation model
						initialData={relationData as ModelRecord<DataModelT>[] | undefined}
						title={label}
						{...this.props}
						dirty={dirty}
						autoFocus={autoFocus}
					/>
					<FormHelperText>{errorMsg || warningMsg}</FormHelperText>
				</FormControlFieldsetCC>
			);
		}

		throw new Error("view-only rendering not supported");
	}
}

export default RendererBackendMultiSelectWithTags;

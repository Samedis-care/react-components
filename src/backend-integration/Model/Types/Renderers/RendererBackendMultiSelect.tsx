import React from "react";
import { FormHelperText } from "@mui/material";
import { ModelIdFilterData, ModelRecord, ModelUnknown } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import {
	FormControlFieldsetCC,
	MultiSelectorData,
} from "../../../../standalone";
import {
	FormBackendMultiSelect,
	FormBackendMultiSelectProps,
} from "../../../../backend-components/Selector/FormSelectors";
import TypeIds from "../TypeIds";

type OmitProperties =
	"selected" | "onSelect" | "disabled" | "model" | "initialData" | "autoFocus";

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendMultiSelect<M extends ModelUnknown> extends TypeIds {
	idFilter?: ModelIdFilterData;
	private readonly props: Omit<
		FormBackendMultiSelectProps<M, MultiSelectorData>,
		OmitProperties
	>;

	constructor(
		props: Omit<
			FormBackendMultiSelectProps<M, MultiSelectorData>,
			OmitProperties
		>,
	) {
		super();
		this.props = props;
		// the grid's ID filter selects records of the same relation model
		this.idFilter = {
			...props,
			lru: undefined,
			onAddNew: undefined,
			classes: undefined,
			endAdornment: undefined,
			modelFetch: props.modelFetch,
		} as ModelIdFilterData;
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

			const typedRelationModel = relationModel as unknown as M;

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
					<FormBackendMultiSelect<M, MultiSelectorData>
						selected={value}
						label={label}
						onSelect={(value) => handleChange(field, value)}
						disabled={visibility.readOnly}
						required={visibility.required}
						model={typedRelationModel}
						// the form's relations hold deserialized records of the relation model
						initialData={relationData as ModelRecord<M>[] | undefined}
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

export default RendererBackendMultiSelect;

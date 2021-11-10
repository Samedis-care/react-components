import React from "react";
import { FormControl, FormHelperText } from "@material-ui/core";
import { ModelFieldName, ModelRenderParams, PageVisibility } from "../../index";
import Model from "../../Model";
import TypeId from "../TypeId";
import { BackendSingleSelectProps } from "../../../../backend-components/Selector/BackendSingleSelect";
import { BackendSingleSelect } from "../../../../backend-components";

type OmitProperties =
	| "selected"
	| "onSelect"
	| "disabled"
	| "model"
	| "initialData";

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendSingleSelect<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends TypeId {
	private readonly props: Omit<
		BackendSingleSelectProps<KeyT, VisibilityT, CustomT>,
		OmitProperties
	>;

	constructor(
		props: Omit<
			BackendSingleSelectProps<KeyT, VisibilityT, CustomT>,
			OmitProperties
		>
	) {
		super();
		this.props = props;
	}

	render(params: ModelRenderParams<string | null>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
			relationData,
			relationModel,
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
				<FormControl
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
					onBlur={handleBlur}
				>
					<BackendSingleSelect
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
					<FormHelperText>{errorMsg}</FormHelperText>
				</FormControl>
			);
		}

		throw new Error("view-only rendering not supported");
	}
}

export default RendererBackendSingleSelect;

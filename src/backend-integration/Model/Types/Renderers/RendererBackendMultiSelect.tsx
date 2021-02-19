import React from "react";
import { FormControl, FormHelperText, InputLabel } from "@material-ui/core";
import { ModelFieldName, ModelRenderParams, PageVisibility } from "../../index";
import TypeStringArray from "../TypeStringArray";
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "../../../../backend-components/Selector/BackendMultiSelect";
import Model from "../../Model";
import { MultiSelectorData } from "../../../../standalone";

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
			relationData,
			relationModel,
		} = params;

		let { value } = params;

		// Workaround for https://github.com/formium/formik/issues/2098
		if (value === undefined) {
			value = [];
		}

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
					<InputLabel shrink>{label}</InputLabel>
					<BackendMultiSelect
						selected={value}
						onSelect={(value) => handleChange(field, value)}
						disabled={visibility.readOnly}
						model={relationModel as Model<KeyT, VisibilityT, CustomT>}
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

export default RendererBackendMultiSelect;

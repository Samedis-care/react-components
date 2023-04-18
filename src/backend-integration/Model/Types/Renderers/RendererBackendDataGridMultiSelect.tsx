import React from "react";
import { FormControl } from "@mui/material";
import { ModelFieldName, ModelRenderParams, PageVisibility } from "../../index";
import TypeStringArray from "../TypeStringArray";
import Model from "../../Model";
import BackendDataGridMultiSelect, {
	BackendDataGridMultiSelectProps,
} from "../../../../backend-components/Selector/BackendDataGridMultiSelect";
import { FormHelperTextCC } from "../../../../standalone";

type OmitProperties = "selected" | "onChange" | "readOnly" | "model";

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendDataGridMultiSelect<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends TypeStringArray {
	private readonly props?: Omit<
		BackendDataGridMultiSelectProps<KeyT, VisibilityT, CustomT>,
		OmitProperties
	>;

	constructor(
		props?: Omit<
			BackendDataGridMultiSelectProps<KeyT, VisibilityT, CustomT>,
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
			handleChange,
			handleBlur,
			errorMsg,
			warningMsg,
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
					"Type BackendDataGridMultiSelect requires relation model: " + field
				);

			return (
				<FormControl
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
					onBlur={handleBlur}
					name={field}
					style={{ height: "100%" }}
				>
					<BackendDataGridMultiSelect
						selected={value}
						model={
							(relationModel as unknown) as Model<KeyT, VisibilityT, CustomT>
						}
						onChange={(value) => handleChange(field, value)}
						readOnly={visibility.readOnly}
						{...this.props}
					/>
					<FormHelperTextCC error={!!errorMsg} warning={!!warningMsg}>
						{errorMsg || warningMsg}
					</FormHelperTextCC>
				</FormControl>
			);
		}

		throw new Error("view-only rendering not supported");
	}
}

export default RendererBackendDataGridMultiSelect;

import React from "react";
import { FormControl, FormHelperText, FormLabel } from "@material-ui/core";
import { ModelFieldName, ModelRenderParams, PageVisibility } from "../../index";
import TypeStringArray from "../TypeStringArray";
import BackendMultiSelect, {
	BackendMultiSelectProps,
} from "../../../../backend-components/Selector/MultiSelect";

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendMultiSelect<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> extends TypeStringArray {
	private props: Omit<
		BackendMultiSelectProps<KeyT, VisibilityT, CustomT>,
		"selected" | "onSelect" | "disabled"
	>;

	constructor(
		props: Omit<
			BackendMultiSelectProps<KeyT, VisibilityT, CustomT>,
			"selected" | "onSelect" | "disabled"
		>
	) {
		super();
		this.props = props;
	}

	render(params: ModelRenderParams<string[]>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			label,
			handleChange,
			handleBlur,
			errorMsg,
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

			return (
				<FormControl
					component={"fieldset"}
					required={visibility.required}
					fullWidth
					error={!!errorMsg}
					onBlur={handleBlur}
				>
					<FormLabel component={"legend"}>{label}</FormLabel>
					<BackendMultiSelect
						selected={value}
						onSelect={(value) => handleChange(field, value)}
						disabled={visibility.readOnly}
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

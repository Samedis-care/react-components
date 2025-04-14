import React from "react";
import { FormHelperText } from "@mui/material";
import Model, { ModelFieldName, PageVisibility } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import TypeId from "../TypeId";
import { BackendSingleSelectProps } from "../../../../backend-components/Selector/BackendSingleSelect";
import { FormControlFieldsetCC } from "../../../../standalone";
import {
	FormBackendSingleSelect,
	FormBackendSingleSelectProps,
} from "../../../../backend-components/Selector/FormSelectors";

type OmitProperties =
	| "selected"
	| "onSelect"
	| "disabled"
	| "model"
	| "initialData";

export type RendererBackendSingleSelectProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
> = Omit<
	FormBackendSingleSelectProps<KeyT, VisibilityT, CustomT>,
	OmitProperties | "modelFetch"
> & {
	// model fetch with callback for current values, works similar to ModelFieldDefinition getRelationModel
	modelFetch?:
		| BackendSingleSelectProps<KeyT, VisibilityT, CustomT>["modelFetch"]
		| ((
				data: Record<string, unknown>,
		  ) => BackendSingleSelectProps<KeyT, VisibilityT, CustomT>["modelFetch"]);
};

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendSingleSelect<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
> extends TypeId {
	private readonly props: RendererBackendSingleSelectProps<
		KeyT,
		VisibilityT,
		CustomT
	>;

	constructor(
		props: RendererBackendSingleSelectProps<KeyT, VisibilityT, CustomT>,
	) {
		super();
		this.props = props;
	}

	render(params: ModelRenderParams<string | null>): React.ReactElement {
		const {
			visibility,
			field,
			value,
			values,
			label,
			handleChange,
			handleBlur,
			errorMsg,
			warningMsg,
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
					"Type BackendMultiSelect requires relation model: " + field,
				);

			const modelFetch =
				typeof this.props.modelFetch === "function"
					? this.props.modelFetch(values)
					: this.props.modelFetch;

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
					<FormBackendSingleSelect
						selected={value}
						label={label}
						onSelect={(value) => handleChange(field, value)}
						disabled={visibility.readOnly}
						model={
							relationModel as unknown as Model<KeyT, VisibilityT, CustomT>
						}
						initialData={relationData}
						{...this.props}
						modelFetch={modelFetch}
						refreshToken={
							JSON.stringify(relationModel.getReactQueryKeyFetchAll()) +
							this.props.refreshToken
						}
					/>
					<FormHelperText>{errorMsg || warningMsg}</FormHelperText>
				</FormControlFieldsetCC>
			);
		}

		throw new Error("view-only rendering not supported");
	}
}

export default RendererBackendSingleSelect;

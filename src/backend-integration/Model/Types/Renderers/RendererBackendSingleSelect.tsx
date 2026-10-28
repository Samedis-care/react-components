import React from "react";
import { FormHelperText } from "@mui/material";
import { ModelIdFilterData, ModelRecord, ModelUnknown } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import TypeId from "../TypeId";
import { BackendSingleSelectProps } from "../../../../backend-components/Selector/BackendSingleSelect";
import { FormControlFieldsetCC } from "../../../../standalone";
import {
	FormBackendSingleSelect,
	FormBackendSingleSelectProps,
} from "../../../../backend-components/Selector/FormSelectors";

type OmitProperties =
	"selected" | "onSelect" | "disabled" | "model" | "initialData" | "autoFocus";

export type RendererBackendSingleSelectProps<M extends ModelUnknown> = Omit<
	FormBackendSingleSelectProps<M>,
	OmitProperties | "modelFetch"
> & {
	// model fetch with callback for current values, works similar to ModelFieldDefinition getRelationModel
	modelFetch?:
		| BackendSingleSelectProps<M>["modelFetch"]
		| ((
				data: Record<string, unknown>,
		  ) => BackendSingleSelectProps<M>["modelFetch"]);
};

/**
 * Renders TypeEnum as drop-down selector (with search)
 */
class RendererBackendSingleSelect<M extends ModelUnknown> extends TypeId {
	idFilter?: ModelIdFilterData;
	private readonly props: RendererBackendSingleSelectProps<M>;

	constructor(props: RendererBackendSingleSelectProps<M>) {
		super();
		this.props = props;
		// the grid's ID filter selects records of the same relation model
		this.idFilter = {
			...props,
			lru: undefined,
			onAddNew: undefined,
			defaultQuery: undefined,
			classes: undefined,
			endAdornment: undefined,
			modelFetch: props.modelFetch as unknown as ModelUnknown,
		} as ModelIdFilterData;
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
			dirty,
			autoFocus,
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
					<FormBackendSingleSelect<M>
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

import Type from "./Type";
import Visibility from "./Visibility";
import Connector from "../Connector/Connector";
import { useMutation, useQuery } from "react-query";
import { MutationResultPair, QueryResult } from "react-query/types/core/types";
import { ModelDataStore } from "../index";

export interface PageVisibility {
	overview: Visibility;
	edit: Visibility;
	create: Visibility;
}

export interface ModelFieldDefinition<
	TypeT,
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> {
	/**
	 * The Renderer of the field
	 */
	type: Type<TypeT>;
	/**
	 * The visibility settings of the field
	 */
	visibility: VisibilityT;
	/**
	 * The label to display to the user
	 */
	getLabel: () => string;
	/**
	 * The default value
	 */
	getDefaultValue?: () => Promise<TypeT> | TypeT;
	/**
	 * Callback to validate field
	 * @param value The value of this field
	 * @param values All field values
	 */
	validate?: (value: TypeT, values: Record<KeyT, unknown>) => string | null;
	/**
	 * User-defined data
	 */
	customData: CustomT;
	// TODO: References
}

export type ModelDef<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
> = Record<KeyT, ModelFieldDefinition<any, KeyT, VisibilityT, CustomT>>;
export type ModelFieldName = "id" | string;

class Model<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
> {
	/**
	 * A unique model identifier, used for caching
	 */
	public readonly modelId: string;
	/**
	 * The actual model definition
	 */
	public readonly fields: ModelDef<KeyT, VisibilityT, CustomT>;
	/**
	 * The backend connector providing a CRUD interface for the model
	 */
	public readonly connector: Connector<KeyT>;

	/**
	 * Creates a new model
	 * @param name A unique name for the model (modelId)
	 * @param model The actual model definition
	 * @param connector A backend connector
	 */
	constructor(
		name: string,
		model: ModelDef<KeyT, VisibilityT, CustomT>,
		connector: Connector<KeyT>
	) {
		this.modelId = name;
		this.fields = model;
		this.connector = connector;
	}

	/**
	 * Provides a react-query useQuery hook for the given data id
	 * @param id The data entry id
	 */
	public get(id: string | null): QueryResult<Record<KeyT, unknown>, Error> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useQuery([this.modelId, { id: id }], () => {
			if (!id) return this.getDefaultValues();
			return this.connector.read(id);
		});
	}

	/**
	 * Provides a react-query useMutation hook for creation or updates to an data entry
	 */
	public createOrUpdate<SnapshotT = unknown>(): MutationResultPair<
		Record<KeyT, unknown>,
		Error,
		Record<string, unknown>,
		SnapshotT
	> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useMutation(
			(values: Record<string, unknown>) =>
				"id" in values
					? this.connector.update(values)
					: this.connector.create(values),
			{
				onSuccess: (data: Record<KeyT, unknown>) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					ModelDataStore.setQueryData([this.modelId, { id: data.id }], data);
				},
			}
		);
	}

	/**
	 * Validates the given values against the field defined validation rules
	 * @param values The values to validate
	 */
	public validate(values: Record<KeyT, unknown>): Record<string, string> {
		const errors: Record<string, string> = {};

		Object.entries(values).forEach(([field, value]) => {
			// first apply type validation
			let error = this.fields[field as KeyT].type.validate(value);

			// then apply custom field validation if present
			const fieldValidation = this.fields[field as KeyT].validate;
			if (!error && fieldValidation) {
				error = fieldValidation(value, values);
			}

			if (error) errors[field] = error;
		});

		return errors;
	}

	/**
	 * Gets an empty/default model data entry
	 */
	protected async getDefaultValues(): Promise<Record<KeyT, unknown>> {
		const data: Record<string, unknown> = {};
		const promises = Object.entries(this.fields).map(async (entry) => {
			const [field, def] = entry as [
				KeyT,
				ModelFieldDefinition<unknown, KeyT, VisibilityT, CustomT>
			];
			if (def.getDefaultValue) data[field] = await def.getDefaultValue();
			else data[field] = def.type.getDefaultValue();
		});
		await Promise.all(promises);
		return data as Record<KeyT, unknown>;
	}
}

export default Model;

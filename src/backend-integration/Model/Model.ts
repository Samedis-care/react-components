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
	/**
	 * onChange event handler, fired before changes have been saved
	 * @param value The new value
	 * @param model The model definition
	 * @param setFieldValue Allows setting of other values
	 * @returns The updated value (can be modified by this handler)
	 */
	onChange?: (
		value: TypeT,
		model: Model<KeyT, VisibilityT, CustomT>,
		setFieldValue: (
			field: KeyT,
			value: unknown,
			shouldValidate?: boolean
		) => void
	) => TypeT;
	// TODO: References
}

export type ModelField<
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
	public readonly fields: ModelField<KeyT, VisibilityT, CustomT>;
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
		model: ModelField<KeyT, VisibilityT, CustomT>,
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
		return useQuery([this.modelId, { id: id }], async () => {
			if (!id) return this.getDefaultValues();
			return this.applySerialization(
				await this.connector.read(id),
				"deserialize"
			);
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
			async (values: Record<string, unknown>) => {
				const serializedValues = await this.applySerialization(
					values,
					"serialize"
				);
				if ("id" in values && values.id) {
					return this.connector.update(serializedValues);
				} else {
					return this.connector.create(serializedValues);
				}
			},
			{
				onSuccess: (data: Record<KeyT, unknown>) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					ModelDataStore.setQueryData([this.modelId, { id: data.id }], data);
				},
				throwOnError: true,
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

	/**
	 * Serializes the given values into a JSON string
	 * @param values The values to serialize
	 */
	public async serialize(values: Record<KeyT, unknown>): Promise<string> {
		const serializable = await this.applySerialization(values, "serialize");
		return JSON.stringify(serializable);
	}

	/**
	 * Deserializes the given JSON data back into a data record
	 * @param data The JSON string
	 */
	public async deserialize(data: string): Promise<Record<KeyT, unknown>> {
		const parsed = JSON.parse(data) as Record<KeyT, unknown>;
		return await this.applySerialization(parsed, "deserialize");
	}

	/**
	 * Applies the given serialization function to the data
	 * @param values The data
	 * @param func The function to apply
	 * @returns A copy of the data (not deep-copy)
	 * @private
	 */
	private async applySerialization(
		values: Record<KeyT, unknown>,
		func: "serialize" | "deserialize"
	): Promise<Record<KeyT, unknown>> {
		const copy: Record<string, unknown> = {};

		for (const key in values) {
			if (!Object.prototype.hasOwnProperty.call(values, key)) continue;

			const field = this.fields[key];
			const serializeFunc = field.type[func];

			if (serializeFunc) {
				copy[key] = await serializeFunc(values[key]);
			} else {
				copy[key] = values[key];
			}
		}

		return copy as Record<KeyT, unknown>;
	}
}

export default Model;

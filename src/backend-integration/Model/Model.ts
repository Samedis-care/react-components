import Type from "./Type";
import Visibility from "./Visibility";
import Connector, { ResponseMeta } from "../Connector/Connector";
import { useMutation, useQuery } from "react-query";
import { ModelDataStore } from "../index";
import { IDataGridLoadDataParameters } from "../../standalone/DataGrid";
import {
	UseMutationResult,
	UseQueryResult,
} from "react-query/types/react/types";

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
	 * Enable filtering? (for BackendDataGrid)
	 */
	filterable?: boolean;
	/**
	 * Enable sorting? (for BackendDataGrid)
	 */
	sortable?: boolean;
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

/**
 * Deletion request. If invert is false only delete ids array. If invert is true delete everything except the given ids
 * @param invert Invert the selection
 * @param ids The selection
 */
export type AdvancedDeleteRequest = [
	invert: boolean,
	ids: string[],
	filter?: Partial<IDataGridLoadDataParameters>
];

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
	 * Loads a list of data entries by the given search params
	 * @param params The search params
	 */
	public async index(
		params: Partial<IDataGridLoadDataParameters> | undefined
	): Promise<[Record<KeyT, unknown>[], ResponseMeta]> {
		const [rawData, meta] = await this.connector.index(params);
		return [
			await Promise.all(
				rawData.map((data) =>
					this.applySerialization(data, "deserialize", "overview")
				)
			),
			meta,
		];
	}

	/**
	 * Provides a react-query useQuery hook for the given data id
	 * @param id The data entry id
	 */
	public get(id: string | null): UseQueryResult<Record<KeyT, unknown>, Error> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useQuery([this.modelId, { id: id }], async () => {
			if (!id) return this.getDefaultValues();
			return this.applySerialization(
				await this.connector.read(id),
				"deserialize",
				"edit"
			);
		});
	}

	/**
	 * Provides a react-query useMutation hook for creation or updates to an data entry
	 */
	public createOrUpdate<TContext = unknown>(): UseMutationResult<
		Record<KeyT, unknown>,
		Error,
		Record<string, unknown>,
		TContext
	> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useMutation(
			this.modelId + "-create-or-update",
			async (values: Record<string, unknown>) => {
				const update = !!("id" in values && values.id);
				const serializedValues = await this.applySerialization(
					values,
					"serialize",
					update ? "edit" : "create"
				);
				if (update) {
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
			}
		);
	}

	public delete<TContext = unknown>(): UseMutationResult<
		void,
		Error,
		string,
		TContext
	> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useMutation(
			this.modelId + "-delete",
			(id: string) => {
				return this.connector.delete(id);
			},
			{
				onSuccess: (data: void, id: string) => {
					ModelDataStore.setQueryData([this.modelId, { id: id }], undefined);
				},
			}
		);
	}

	public deleteMultiple<TContext = unknown>(): UseMutationResult<
		void,
		Error,
		string[],
		TContext
	> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useMutation(
			this.modelId + "-delete-multi",
			(ids: string[]) => {
				return this.connector.deleteMultiple(ids);
			},
			{
				onSuccess: (data: void, ids: string[]) => {
					ids.forEach((id) =>
						ModelDataStore.setQueryData([this.modelId, { id: id }], undefined)
					);
				},
			}
		);
	}

	public doesSupportAdvancedDeletion(): boolean {
		return !!this.connector.deleteAdvanced;
	}

	public deleteAdvanced<TContext = unknown>(): UseMutationResult<
		void,
		Error,
		AdvancedDeleteRequest,
		TContext
	> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useMutation(
			this.modelId + "-delete-adv",
			(req: AdvancedDeleteRequest) => {
				if (!this.connector.deleteAdvanced) {
					throw new Error("Connector doesn't support advanced deletion");
				}
				return this.connector.deleteAdvanced(req);
			},
			{
				onSuccess: (data: void, req: AdvancedDeleteRequest) => {
					if (!req[0]) {
						req[1].forEach((id) =>
							ModelDataStore.setQueryData([this.modelId, { id: id }], undefined)
						);
					} else {
						ModelDataStore.clear();
					}
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

	/**
	 * Serializes the given values into a JSON string
	 * @param values The values to serialize
	 * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
	 */
	public async serialize(
		values: Record<KeyT, unknown>,
		visibility: keyof PageVisibility
	): Promise<string> {
		const serializable = await this.applySerialization(
			values,
			"serialize",
			visibility
		);
		return JSON.stringify(serializable);
	}

	/**
	 * Deserializes the given JSON data back into a data record
	 * @param data The JSON string
	 * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
	 */
	public async deserialize(
		data: string,
		visibility: keyof PageVisibility
	): Promise<Record<KeyT, unknown>> {
		const parsed = JSON.parse(data) as Record<KeyT, unknown>;
		return await this.applySerialization(parsed, "deserialize", visibility);
	}

	/**
	 * Applies the given serialization function to the data
	 * @param values The data
	 * @param func The function to apply
	 * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
	 * @returns A copy of the data (not deep-copy)
	 */
	public async applySerialization(
		values: Record<string, unknown>,
		func: "serialize" | "deserialize",
		visibility: keyof PageVisibility
	): Promise<Record<string, unknown>> {
		const copy: Record<string, unknown> = {};

		for (const key in values) {
			if (!Object.prototype.hasOwnProperty.call(values, key)) continue;

			const field = this.fields[key as KeyT];
			if (!field) {
				// eslint-disable-next-line no-console
				console.debug(
					`[Components-Care] [Model] Trying to ${func} data with no field definition: ${key}`
				);
				continue;
			}

			// don't include disabled fields
			if (field.visibility[visibility].disabled) {
				continue;
			}

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

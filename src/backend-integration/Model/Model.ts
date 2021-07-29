import Type from "./Type";
import Visibility, { getVisibility, VisibilityCallback } from "./Visibility";
import Connector, { ResponseMeta } from "../Connector/Connector";
import { useMutation, useQuery } from "react-query";
import { ModelDataStore } from "../index";
import {
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "../../standalone/DataGrid/DataGrid";
import {
	UseMutationResult,
	UseQueryResult,
} from "react-query/types/react/types";
import queryCache from "../Store";
import { QueryKey } from "react-query/types/core/types";

export interface PageVisibility {
	overview: Visibility;
	edit: VisibilityCallback;
	create: VisibilityCallback;
}

export type ModelRecord<
	ModelT extends Model<ModelFieldName, PageVisibility, unknown>
> = {
	[Field in keyof ModelT["fields"]]: ReturnType<
		ModelT["fields"][Field]["type"]["getDefaultValue"]
	>;
};

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
	 * Column width settings (for BackendDataGrid)
	 */
	columnWidth?: IDataGridColumnDef["width"];
	/**
	 * The default value
	 */
	getDefaultValue?: () => Promise<TypeT> | TypeT;
	/**
	 * Callback to validate field
	 * @param value The value of this field
	 * @param values All field values
	 * @param field This field
	 */
	validate?: (
		value: TypeT,
		values: Record<KeyT, unknown>,
		field: ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>
	) => string | null;
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
	/**
	 * The referenced model for backend connected data types.
	 * If TypeScript complains cast the return value to `Model<ModelFieldName, PageVisibility, unknown>`
	 */
	getRelationModel?: () => Model<ModelFieldName, PageVisibility, unknown>;
	// TypeScript doesn't like the following definition (it would save you the cast):
	//getRelationModel?: <
	//	SubKeyT extends ModelFieldName,
	//	SubVisibilityT extends PageVisibility,
	//	SubCustomT
	//>() => Model<SubKeyT, SubVisibilityT, SubCustomT>;
}

export type ModelField<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
> = Record<KeyT, ModelFieldDefinition<any, KeyT, VisibilityT, CustomT>>;
export type ModelFieldName = "id" | string;

export type ModelGetResponseRelations<KeyT extends ModelFieldName> = Partial<
	Record<KeyT, Record<ModelFieldName, unknown>[]>
>;

export type ModelData<KeyT extends ModelFieldName> = Record<KeyT, unknown>;

/**
 * Response for GET single data entry
 */
export type ModelGetResponse<KeyT extends ModelFieldName> = [
	ModelData<KeyT>, // the main data entry
	ModelGetResponseRelations<KeyT> // data in relations
];

/**
 * Deletion request. If invert is false only delete ids array. If invert is true delete everything except the given ids
 * @param invert Invert the selection
 * @param ids The selection
 */
export type AdvancedDeleteRequest = [
	invert: boolean,
	ids: string[],
	filter?: Pick<
		IDataGridLoadDataParameters,
		"quickFilter" | "additionalFilters" | "fieldFilter"
	>
];

export interface CacheOptions {
	/**
	 * Time to consider data valid in milliseconds
	 * @default 30s
	 */
	staleTime?: number;
	/**
	 * Time to keep data cached after it's no longer in use
	 * @default 5m
	 */
	cacheTime?: number;
}

/**
 * React-Query's useQuery for the given model and record ID
 * @param model The model ID to load
 * @param id The record ID (or null to get default values on create)
 */
export const useModelGet = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	model: Model<KeyT, VisibilityT, CustomT>,
	id: string | null
): UseQueryResult<ModelGetResponse<KeyT>, Error> => {
	return useQuery(
		model.getReactQueryKey(id),
		() => model.getRaw(id),
		model.cacheOptions
	);
};

/**
 * React-Query's useMutation to update/create a new record on backend
 * @param model The model
 * @see model.createOrUpdateRecordRaw
 */
export const useModelMutation = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	TContext = unknown
>(
	model: Model<KeyT, VisibilityT, CustomT>
): UseMutationResult<
	ModelGetResponse<KeyT>,
	Error,
	Record<string, unknown>,
	TContext
> => {
	return useMutation(
		model.modelId + "-create-or-update",
		model.createOrUpdateRecordRaw.bind(model),
		{
			onSuccess: (data: ModelGetResponse<KeyT>) => {
				ModelDataStore.setQueryData(
					model.getReactQueryKey((data[0] as Record<"id", string>).id),
					data
				);
			},
		}
	);
};

/**
 * React-Query's useMutation to delete a single record on backend
 * @param model The model
 */
export const useModelDelete = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	TContext = unknown
>(
	model: Model<KeyT, VisibilityT, CustomT>
): UseMutationResult<void, Error, string, TContext> => {
	return useMutation(model.modelId + "-delete", model.deleteRaw.bind(this), {
		onSuccess: (data: void, id: string) => {
			ModelDataStore.removeQueries(model.getReactQueryKey(id));
		},
	});
};

/**
 * React-Query's useMutation to delete multiple records by ID on backend
 * @param model The model
 */
export const useModelDeleteMultiple = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	TContext = unknown
>(
	model: Model<KeyT, VisibilityT, CustomT>
): UseMutationResult<void, Error, string[], TContext> => {
	return useMutation(
		model.modelId + "-delete-multi",
		model.deleteMultipleRaw.bind(this),
		{
			onSuccess: (data: void, ids: string[]) => {
				ids.forEach((id) =>
					ModelDataStore.removeQueries(model.getReactQueryKey(id))
				);
			},
		}
	);
};

/**
 * React-Query's useMutation to delete records using advanced filters on backend
 * @param model The model
 * @see model.deleteAdvancedRaw
 */
export const useModelDeleteAdvanced = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	TContext = unknown
>(
	model: Model<KeyT, VisibilityT, CustomT>
): UseMutationResult<void, Error, AdvancedDeleteRequest, TContext> => {
	return useMutation(
		model.modelId + "-delete-adv",
		model.deleteAdvancedRaw.bind(this),
		{
			onSuccess: (data: void, req: AdvancedDeleteRequest) => {
				// this function is likely to flush more then actually deleted
				const [invert, ids] = req;
				if (!invert) {
					ids.forEach((id) =>
						ModelDataStore.removeQueries(model.getReactQueryKey(id))
					);
				} else {
					// delete everything from this model, unless ID matches
					ModelDataStore.removeQueries(undefined, {
						predicate: (query): boolean => {
							return (
								query.queryKey[0] === model.modelId &&
								!ids.includes((query.queryKey[1] as { id: string }).id)
							);
						},
					});
				}
			},
		}
	);
};

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
	public connector: Connector<KeyT, VisibilityT, CustomT>;
	/**
	 * Optional additional cache keys
	 */
	public readonly cacheKeys?: unknown;
	/**
	 * Caching options
	 */
	public cacheOptions?: CacheOptions;

	/**
	 * Creates a new model
	 * @param name A unique name for the model (modelId)
	 * @param model The actual model definition
	 * @param connector A backend connector
	 * @param cacheKeys Optional cache keys
	 * @param cacheOptions Optional cache options
	 */
	constructor(
		name: string,
		model: ModelField<KeyT, VisibilityT, CustomT>,
		connector: Connector<KeyT, VisibilityT, CustomT>,
		cacheKeys?: unknown,
		cacheOptions?: CacheOptions
	) {
		this.modelId = name;
		this.fields = model;
		this.connector = connector;
		this.cacheKeys = cacheKeys;
		this.cacheOptions = cacheOptions ?? {
			staleTime: 30000,
		};
	}

	/**
	 * Loads a list of data entries by the given search params
	 * @param params The search params
	 */
	public async index(
		params: Partial<IDataGridLoadDataParameters> | undefined
	): Promise<[Record<KeyT, unknown>[], ResponseMeta]> {
		const [rawData, meta] = await this.connector.index(params, this);
		// eslint-disable-next-line no-debugger
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
	 * Gets the react-query cache key for this model
	 * @param id The record id
	 */
	public getReactQueryKey(id: string | null): QueryKey {
		return [this.modelId, { id: id }, this.cacheKeys];
	}

	/**
	 * Provides a react-query useQuery hook for the given data id
	 * @param id The data record id
	 * @deprecated Use useModelGet(model, id) instead
	 */
	public get(id: string | null): UseQueryResult<ModelGetResponse<KeyT>, Error> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useModelGet(this, id);
	}

	/**
	 * Provides cached access for the given data id
	 * @param id The data record id or null to obtain the default values
	 */
	public getCached(id: string | null): Promise<ModelGetResponse<KeyT>> {
		return queryCache.fetchQuery(
			this.getReactQueryKey(id),
			() => this.getRaw(id),
			this.cacheOptions
		);
	}

	/**
	 * Provides uncached access for the given data id
	 * @param id The data record id or null to obtain the default values
	 */
	public async getRaw(id: string | null): Promise<ModelGetResponse<KeyT>> {
		if (!id) return [await this.getDefaultValues(), {}];

		const rawData = await this.connector.read(id, this);

		return this.deserializeResponse(rawData);
	}

	/**
	 * Deserializes the given ModelGetResponse
	 * @param rawData The data to deserialize
	 * @private
	 */
	private async deserializeResponse(
		rawData: ModelGetResponse<KeyT>
	): Promise<ModelGetResponse<KeyT>> {
		return [
			await this.applySerialization(rawData[0], "deserialize", "edit"),
			Object.fromEntries(
				await Promise.all(
					Object.entries(rawData[1]).map(async (keyValue) => {
						const fieldName = keyValue[0];
						const values = keyValue[1] as Record<string, unknown>[];
						const refModel = this.fields[fieldName as KeyT]?.getRelationModel;

						if (!refModel) {
							// eslint-disable-next-line no-console
							console.warn(
								"[Components-Care] [Model] Backend connector supplied related data, but no model is defined for this relationship (relationship name = " +
									fieldName +
									"). Data will be ignored."
							);
						}

						return [
							fieldName,
							refModel
								? await Promise.all(
										values.map((value) =>
											refModel().applySerialization(
												value,
												"deserialize",
												"edit"
											)
										)
								  )
								: null,
						];
					})
				)
			),
		];
	}

	/**
	 * Provides a react-query useMutation hook for creation or updates to an data entry
	 * @deprecated Use useModelMutation(model) instead
	 */
	public createOrUpdate<TContext = unknown>(): UseMutationResult<
		ModelGetResponse<KeyT>,
		Error,
		Record<string, unknown>,
		TContext
	> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useModelMutation(this);
	}

	/**
	 * Updates a single record on backend (doesn't update local cache)
	 * @param values The new values (set id field to update)
	 */
	public async createOrUpdateRecordRaw(
		values: Record<string, unknown>
	): Promise<ModelGetResponse<KeyT>> {
		const update = !!("id" in values && values.id);
		const serializedValues = await this.applySerialization(
			values,
			"serialize",
			update ? "edit" : "create"
		);
		if (update) {
			return this.deserializeResponse(
				await this.connector.update(serializedValues, this)
			);
		} else {
			delete serializedValues["id" as KeyT];
			return this.deserializeResponse(
				await this.connector.create(serializedValues, this)
			);
		}
	}

	/**
	 * Provides a react hook to delete a given record id
	 * @deprecated Use useModelDelete(model)
	 */
	public delete<TContext = unknown>(): UseMutationResult<
		void,
		Error,
		string,
		TContext
	> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useModelDelete(this);
	}

	/**
	 * Delete a single record in backend (does not affect local cache)
	 * @param id The ID to delete
	 */
	public async deleteRaw(id: string): Promise<void> {
		return this.connector.delete(id, this);
	}

	/**
	 * Provides a react hook to delete multiple records at once
	 * @deprecated Use useModelDeleteMultiple(model)
	 */
	public deleteMultiple<TContext = unknown>(): UseMutationResult<
		void,
		Error,
		string[],
		TContext
	> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useModelDeleteMultiple(this);
	}

	/**
	 * Deletes multiple record at once (does not affect local cache)
	 * @param ids The IDs to delete
	 */
	// eslint-disable-next-line @typescript-eslint/require-await
	public async deleteMultipleRaw(ids: string[]): Promise<void> {
		return this.connector.deleteMultiple(ids, this);
	}

	/**
	 * Does the connector support delete all functionality?
	 */
	public doesSupportAdvancedDeletion(): boolean {
		return !!this.connector.deleteAdvanced;
	}

	/**
	 * Provides a react hook to mass delete data
	 * @deprecated Use useModelDeleteAdvanced(model)
	 */
	public deleteAdvanced<TContext = unknown>(): UseMutationResult<
		void,
		Error,
		AdvancedDeleteRequest,
		TContext
	> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useModelDeleteAdvanced(this);
	}

	/**
	 * Raw request to mass-delete data (does not affect local cache)
	 * @param req The deletion request
	 */
	public async deleteAdvancedRaw(req: AdvancedDeleteRequest): Promise<void> {
		if (!this.connector.deleteAdvanced) {
			throw new Error("Connector doesn't support advanced deletion");
		}
		return this.connector.deleteAdvanced(req, this);
	}

	/**
	 * Updates stored data (not relations)
	 * @param id The id of the record to edit
	 * @param updater The function which updates the data
	 */
	public updateStoredData(
		id: string,
		updater: (old: Record<KeyT, unknown>) => Record<KeyT, unknown>
	): void {
		ModelDataStore.setQueryData(
			this.getReactQueryKey(id),
			(data: ModelGetResponse<KeyT> | undefined): ModelGetResponse<KeyT> => {
				if (!data) throw new Error("Data not set");
				const [record, ...other] = data;
				return [updater(record), ...other];
			}
		);
	}

	/**
	 * Returns a data grid compatible column definition
	 */
	public toDataGridColumnDefinition(): IDataGridColumnDef[] {
		return Object.entries(this.fields)
			.filter(
				(entry) =>
					!(entry[1] as ModelFieldDefinition<
						unknown,
						KeyT,
						VisibilityT,
						CustomT
					>).visibility.overview.disabled
			)
			.map((entry) => {
				const key = entry[0];
				const value = entry[1] as ModelFieldDefinition<
					unknown,
					KeyT,
					VisibilityT,
					CustomT
				>;
				return {
					field: key,
					headerName: value.getLabel(),
					type: value.type.getFilterType(),
					hidden: value.visibility.overview.hidden,
					filterable: value.filterable,
					sortable: value.sortable,
					width: value.columnWidth,
				};
			});
	}

	/**
	 * Validates the given values against the field defined validation rules
	 * @param values The values to validate
	 * @param view Optional view filter (only applies validations on fields present in given view)
	 * @param fieldsToValidate List of fields to validate
	 */
	public validate(
		values: Record<KeyT, unknown>,
		view?: "edit" | "create",
		fieldsToValidate?: KeyT[]
	): Record<string, string> {
		const errors: Record<string, string> = {};

		Object.entries(values).forEach(([field, value]) => {
			// skip validations for fields which aren't defined in the model or which are disabled in the current view or aren't currently mounted
			if (!(field in this.fields)) return;
			try {
				const fieldDef = this.fields[field as KeyT];
				if (view && getVisibility(fieldDef.visibility[view], values).disabled)
					return;
				if (fieldsToValidate && !fieldsToValidate.includes(field as KeyT))
					return;

				// first apply type validation
				let error = fieldDef.type.validate(value);

				// then apply custom field validation if present
				const fieldValidation = fieldDef.validate;
				if (!error && fieldValidation) {
					error = fieldValidation(value, values, fieldDef);
				}

				if (error) errors[field] = error;
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(
					"[Components-Care] [Model.validate] Error during field validation:",
					field,
					value,
					e
				);
			}
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
		values: Record<KeyT, unknown>,
		func: "serialize" | "deserialize",
		visibility: keyof PageVisibility
	): Promise<Record<KeyT, unknown>> {
		const copy: Partial<Record<KeyT, unknown>> = {};

		for (const key in values) {
			if (!Object.prototype.hasOwnProperty.call(values, key)) continue;

			const field = this.fields[key as KeyT];
			if (!field) {
				continue;
			}

			// don't include disabled fields (except ID and disabled readonly fields when serializing)
			const visValue = getVisibility(field.visibility[visibility], values);
			if (
				visValue.disabled &&
				(func === "serialize" || !visValue.readOnly) &&
				key !== "id"
			) {
				continue;
			}

			const serializeFunc = field.type[func];

			if (serializeFunc) {
				copy[key] = (await serializeFunc(values[key])) as unknown;
			} else {
				copy[key] = values[key];
			}
		}

		return copy as Record<KeyT, unknown>;
	}
}

export default Model;

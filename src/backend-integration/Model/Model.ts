import Type from "./Type";
import Visibility, { getVisibility, VisibilityCallback } from "./Visibility";
import Connector, {
	ConnectorIndex2Params,
	ResponseMeta,
} from "../Connector/Connector";
import { useMutation, useQuery } from "react-query";
import { ModelDataStore } from "../index";
import {
	DataGridSetFilterData,
	DataGridSetFilterDataEntry,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
} from "../../standalone/DataGrid/DataGrid";
import {
	UseMutationResult,
	UseQueryResult,
} from "react-query/types/react/types";
import queryCache from "../Store";
import { QueryKey } from "react-query/types/core/types";
import { deepAssign, dotToObject, getValueByDot } from "../../utils";
import throwError from "../../utils/throwError";

// optional import
let captureException: ((e: Error) => void) | null = null;
import("@sentry/react")
	.then((Sentry) => (captureException = Sentry.captureException))
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	.catch(() => {}); // ignore

export interface PageVisibility {
	overview: Visibility;
	edit: VisibilityCallback;
	create: VisibilityCallback;
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
	 * Column width settings (for BackendDataGrid)
	 */
	columnWidth?:
		| IDataGridColumnDef["width"]
		| (() => IDataGridColumnDef["width"]);
	/**
	 * Custom label for grid column header
	 * @remarks Used for BackendDataGrid
	 * @default return value of getLabel
	 */
	getColumnLabel?: () => string;
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
		values: Record<string, unknown>,
		field: ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>
	) => Promise<string | null> | string | null;
	/**
	 * Callback to validate field to provide optional hints
	 */
	validateHint?: ModelFieldDefinition<
		TypeT,
		KeyT,
		VisibilityT,
		CustomT
	>["validate"];
	/**
	 * User-defined data
	 */
	customData: CustomT;
	/**
	 * onChange event handler, fired before changes have been saved
	 * @param value The new value
	 * @param model The model definition
	 * @param setFieldValue Allows setting of other values
	 * @param getFieldValue Allow getting another field value
	 * @returns The updated value (can be modified by this handler)
	 */
	onChange?: (
		value: TypeT,
		model: Model<KeyT, VisibilityT, CustomT>,
		setFieldValue: (
			field: KeyT,
			value: unknown,
			shouldValidate?: boolean,
			triggerOnChange?: boolean
		) => void,
		getFieldValue: (field: KeyT) => unknown
	) => TypeT;
	/**
	 * The referenced model for backend connected data types.
	 * If TypeScript complains cast the return value to `Model<ModelFieldName, PageVisibility, unknown>`
	 * @param id The current record ID
	 * @param values Subset of the current record (select relevant data with getRelationModelValues)
	 */
	getRelationModel?: (
		id: string | null,
		values: Record<string, unknown>
	) => Model<ModelFieldName, PageVisibility, unknown>;
	// TypeScript doesn't like the following definition (it would save you the cast):
	//getRelationModel?: <
	//	SubKeyT extends ModelFieldName,
	//	SubVisibilityT extends PageVisibility,
	//	SubCustomT
	//>() => Model<SubKeyT, SubVisibilityT, SubCustomT>;
	getRelationModelValues?: string[]; // actually KeyT[], but TypeScript doesn't like it
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ModelData<KeyT extends ModelFieldName> = Record<string, unknown>;

/**
 * Response for GET single data entry
 */
export type ModelGetResponse<KeyT extends ModelFieldName> = [
	ModelData<KeyT>, // the main data entry
	ModelGetResponseRelations<KeyT>, // data in relations
	unknown? // optional user-defined data
];

export type ModelIndexResponse = [
	records: Record<string, unknown>[],
	meta: ResponseMeta,
	userMeta?: unknown
];

export type ModelFetchAllParams = Partial<
	Omit<IDataGridLoadDataParameters, "rows" | "page">
>;

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
	return useQuery(model.getReactQueryKey(id), () => model.getRaw(id), {
		// 3 retries if we get network error
		retry: (count, err: Error) => err.name === "NetworkError" && count < 3,
		...model.cacheOptions,
	});
};

/**
 * React-Query's useQuery for the given model and index params
 * @param model The model ID to load
 * @param params The params to pass to fetchAll/index
 * @returns ModelIndexResponse where userMeta and meta is taken from the last call
 * @see Model.fetchAll
 */
export const useModelFetchAll = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	model: Model<KeyT, VisibilityT, CustomT>,
	params?: ModelFetchAllParams
): UseQueryResult<ModelIndexResponse, Error> => {
	return useQuery(
		model.getReactQueryKeyFetchAll(params),
		() => model.fetchAll(params),
		{
			// 3 retries if we get network error
			retry: (count, err: Error) => err.name === "NetworkError" && count < 3,
			...model.cacheOptions,
		}
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
				if (!(data[0] as Record<"id", string>).id) {
					throw new Error("Can't update null ID");
				}
				if (model.hooks.onCreateOrUpdate) {
					model.hooks.onCreateOrUpdate(data);
				}
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
	return useMutation(model.modelId + "-delete", model.deleteRaw.bind(model), {
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
		model.deleteMultipleRaw.bind(model),
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
		model.deleteAdvancedRaw.bind(model),
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

export interface ModelHooks<KeyT extends ModelFieldName> {
	/**
	 * Hook fired on useModelMutation success
	 * @param data The updated record
	 */
	onCreateOrUpdate?: (data: ModelGetResponse<KeyT>) => void;
}

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
	 * Hooks
	 */
	public readonly hooks: ModelHooks<KeyT>;
	/**
	 * Global toggle to trigger auto validation of UX when constructor is called
	 */
	public static autoValidateUX = false;
	/**
	 * Throw errors when UX auto validation fails, only used when autoValidateUX is true
	 */
	public static autoValidateUXThrow = false;

	/**
	 * Creates a new model
	 * @param name A unique name for the model (modelId)
	 * @param model The actual model definition
	 * @param connector A backend connector
	 * @param cacheKeys Optional cache keys
	 * @param cacheOptions Optional cache options
	 * @param hooks Optional: Model hooks
	 */
	constructor(
		name: string,
		model: ModelField<KeyT, VisibilityT, CustomT>,
		connector: Connector<KeyT, VisibilityT, CustomT>,
		cacheKeys?: unknown,
		cacheOptions?: CacheOptions,
		hooks?: ModelHooks<KeyT>
	) {
		this.modelId = name;
		this.fields = model;
		this.connector = connector;
		this.cacheKeys = cacheKeys;
		this.cacheOptions = cacheOptions ?? {
			staleTime: 30000,
		};
		this.hooks = hooks ?? {};
		if (Model.autoValidateUX) this.validateUX(Model.autoValidateUXThrow);
	}

	/**
	 * Loads a list of data entries by the given search params
	 * @param params The search params
	 */
	public async index(
		params: Partial<IDataGridLoadDataParameters> | undefined
	): Promise<ModelIndexResponse> {
		const [rawData, meta, userData] = await this.connector.index(params, this);
		return [
			await Promise.all(
				rawData.map((data) =>
					this.applySerialization(data, "deserialize", "overview")
				)
			),
			meta,
			userData,
		];
	}

	/**
	 * Loads a list of data entries by the given search params. Works with offsets rather than pages
	 * @param params The search params
	 */
	public async index2(
		params: ConnectorIndex2Params
	): Promise<ModelIndexResponse> {
		const [rawData, meta, userData] = await this.connector.index2(params, this);
		return [
			await Promise.all(
				rawData.map((data) =>
					this.applySerialization(data, "deserialize", "overview")
				)
			),
			meta,
			userData,
		];
	}

	/**
	 * Fetches all records using index calls
	 * @param params The params to pass to index
	 * @returns ModelIndexResponse where userMeta and meta is taken from the last call
	 */
	public async fetchAll(
		params?: ModelFetchAllParams
	): Promise<ModelIndexResponse> {
		let page = 1;
		let perPage = 1000;
		let perPageDefault = true;
		let meta: ResponseMeta;
		let userMeta: unknown;
		const records: Record<string, unknown>[] = [];

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const [tRecords, tMeta, tUserMeta] = await this.index({
				...params,
				rows: perPage,
				page,
			});
			// save data
			records.push(...tRecords);
			meta = tMeta;
			userMeta = tUserMeta;

			// calibrate defaults
			if (perPageDefault) {
				perPageDefault = false;
				perPage = tRecords.length;
			}
			page++;

			// finish condition
			const totalRows = meta.filteredRows ?? meta.totalRows;
			if (records.length >= totalRows || tRecords.length === 0) break;
		}

		return [records, meta, userMeta];
	}

	/**
	 * Fetches all records using index calls and caches the result
	 * @param params The params to pass to index
	 * @returns ModelIndexResponse where userMeta and meta is taken from the last call
	 * @see fetchAll
	 */
	public async fetchAllCached(
		params?: ModelFetchAllParams
	): Promise<ModelIndexResponse> {
		return queryCache.fetchQuery(
			this.getReactQueryKeyFetchAll(params),
			() => this.fetchAll(params),
			this.cacheOptions
		);
	}

	/**
	 * Gets the react-query cache key for this model
	 * @param id The record id
	 */
	public getReactQueryKey(id: string | null): QueryKey {
		return [this.modelId, { id: id }, this.cacheKeys];
	}

	/**
	 * Gets the react-query cache key for this model (for fetch all)
	 * @param params The fetch all params
	 */
	public getReactQueryKeyFetchAll(params?: ModelFetchAllParams): QueryKey {
		return [this.modelId, params, this.cacheKeys];
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
		const deserialized = await this.applySerialization(
			rawData[0],
			"deserialize",
			"edit"
		);
		return [
			deserialized,
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
											refModel(
												deserialized.id as string | null,
												deserialized
											).applySerialization(value, "deserialize", "edit")
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
		updater: (old: Record<string, unknown>) => Record<string, unknown>
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
	public toDataGridColumnDefinition(
		includeHidden = false
	): IDataGridColumnDef[] {
		return (!includeHidden
			? Object.entries(this.fields).filter(
					(entry) =>
						!(entry[1] as ModelFieldDefinition<
							unknown,
							KeyT,
							VisibilityT,
							CustomT
						>).visibility.overview.disabled
			  )
			: Object.entries(this.fields)
		).map((entry) => {
			const key = entry[0];
			const value = entry[1] as ModelFieldDefinition<
				unknown,
				KeyT,
				VisibilityT,
				CustomT
			>;

			let filterData: DataGridSetFilterData | undefined = undefined;
			if (value.type.getFilterType() === "enum") {
				if (!value.type.getEnumValues)
					throw new Error(
						"Model Type Filter Type is enum, but getEnumValues not set"
					);
				filterData = value.type
					.getEnumValues()
					.filter((value) => !(value.invisibleInGridFilter ?? value.invisible))
					.map(
						(value) =>
							({
								getLabelText: value.getLabel,
								value: value.value,
								disabled: value.disabled,
								isDivider: value.isDivider,
							} as DataGridSetFilterDataEntry)
					);
			} else if (value.type.getFilterType() === "boolean") {
				filterData = [true, false].map(
					(boolVal) =>
						({
							getLabelText: value.type.stringify.bind(value.type, boolVal),
							value: boolVal ? "true" : "false",
						} as DataGridSetFilterDataEntry)
				);
			}

			return {
				field: key,
				headerName: value.getLabel(),
				headerLabel: value.getColumnLabel ? value.getColumnLabel() : undefined,
				type: value.type.getFilterType(),
				filterData,
				hidden: value.visibility.overview.hidden,
				filterable: value.filterable,
				sortable: value.sortable,
				width:
					(typeof value.columnWidth === "function"
						? value.columnWidth()
						: value.columnWidth) ??
					(typeof value.type.dataGridColumnSizingHint === "function"
						? value.type.dataGridColumnSizingHint()
						: value.type.dataGridColumnSizingHint),
			};
		});
	}

	/**
	 * Validates the given values against the field defined validation rules
	 * @param values The values to validate
	 * @param view Optional view filter (only applies validations on fields present in given view)
	 * @param fieldsToValidate List of fields to validate
	 * @param type The validation type (normal = validate, hint = validateHint]
	 */
	public async validate(
		values: Record<string, unknown>,
		view?: "edit" | "create",
		fieldsToValidate?: KeyT[],
		type: "normal" | "hint" = "normal"
	): Promise<Record<string, string>> {
		const errors: Record<string, string> = {};
		const validationFunction = type === "normal" ? "validate" : "validateHint";

		await Promise.all(
			Object.keys(this.fields).map(async (field) => {
				// skip validations for fields which aren't defined in the model or which are disabled in the current view or aren't currently mounted
				const value = getValueByDot(field, values);
				if (value === undefined) return;

				try {
					const fieldDef = this.fields[field as KeyT];
					if (
						view &&
						getVisibility(fieldDef.visibility[view], values, values).disabled
					)
						return;
					if (fieldsToValidate && !fieldsToValidate.includes(field as KeyT))
						return;

					// first apply type validation
					let error: string | null;
					try {
						const validate = fieldDef.type[validationFunction]?.bind(
							fieldDef.type
						);
						error = validate ? await validate(value) : null;
					} catch (e) {
						// eslint-disable-next-line
						console.error(
							"[Components-Care] [Model.validate] Error during validation:",
							e
						);
						if (captureException) captureException(e as Error);
						error = (e as Error).message;
					}

					// then apply custom field validation if present
					const fieldValidation = fieldDef[validationFunction]?.bind(fieldDef);
					if (!error && fieldValidation) {
						try {
							error = await fieldValidation(value, values, fieldDef);
						} catch (e) {
							// eslint-disable-next-line
							console.error(
								"[Components-Care] [Model.validate] Error during validation:",
								e
							);
							if (captureException) captureException(e as Error);
							error = (e as Error).message;
						}
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
					if (captureException) captureException(e as Error);
				}
			})
		);

		return errors;
	}

	/**
	 * Gets an empty/default model data entry
	 */
	protected async getDefaultValues(): Promise<Record<string, unknown>> {
		const data: Record<string, unknown> = {};
		const promises = Object.entries(this.fields)
			.filter(([field]) => {
				try {
					return !getVisibility(
						this.fields[field as KeyT].visibility.create,
						{},
						{}
					).disabled;
				} catch (e) {
					return true;
				}
			})
			.map(async (entry) => {
				const [field, def] = entry as [
					KeyT,
					ModelFieldDefinition<unknown, KeyT, VisibilityT, CustomT>
				];
				let defaultValue: unknown;
				if (def.getDefaultValue) defaultValue = await def.getDefaultValue();
				else defaultValue = def.type.getDefaultValue();
				deepAssign(data, dotToObject(field, defaultValue));
			});
		await Promise.all(promises);
		return data;
	}

	/**
	 * Serializes the given values into a JSON string
	 * @param values The values to serialize
	 * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
	 */
	public async serialize(
		values: Record<string, unknown>,
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
	): Promise<Record<string, unknown>> {
		const parsed = JSON.parse(data) as Record<string, unknown>;
		return await this.applySerialization(parsed, "deserialize", visibility);
	}

	/**
	 * Applies the given serialization function to the data
	 * @param values The data
	 * @param func The function to apply
	 * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
	 * @returns A copy of the data
	 */
	public async applySerialization(
		values: Record<string, unknown>,
		func: "serialize" | "deserialize",
		visibility: keyof PageVisibility
	): Promise<Record<string, unknown>> {
		const copy: Record<string, unknown> = {};

		for (const key in this.fields) {
			if (!Object.prototype.hasOwnProperty.call(this.fields, key)) continue;

			const field = this.fields[key];

			const value = getValueByDot(key, values);
			if (value === undefined && func === "serialize") {
				continue;
			}

			// don't include disabled fields (except ID and disabled+readonly fields when serializing)
			const visValue = getVisibility(
				field.visibility[visibility],
				values,
				values
			);
			if (
				visValue.disabled &&
				(func === "serialize" || !visValue.readOnly) &&
				key !== "id"
			) {
				continue;
			}

			const serializeFunc = field.type[func];

			let result: unknown;
			if (serializeFunc) {
				result = (await serializeFunc(value)) as unknown;
			} else {
				result = value;
			}
			deepAssign(copy, dotToObject(key, result));
		}

		return copy;
	}

	/**
	 * Find UX issues (dev util)
	 * @param throwErr If true throws an error, otherwise logs it to console as warning
	 * @remarks To enable this automatically set `Model.autoValidateUX = true; Model.autoValidateUXThrow = false/true;`
	 */
	public validateUX(throwErr = false): void {
		const report = (msg: string) =>
			// eslint-disable-next-line no-console
			throwErr ? throwError(msg) : console.warn(msg);

		// iterate over the whole definition
		Object.entries(this.fields).forEach((kv) => {
			const field = kv[0];
			const def = kv[1] as ModelFieldDefinition<
				unknown,
				KeyT,
				VisibilityT,
				CustomT
			>;

			// fields that are visibile in grid
			if (def.visibility.overview.grid) {
				// check if they have a label
				if (!def.getLabel().trim())
					report(
						`[Components-Care] [Model.validateUX] ${this.modelId}.${field} is visible in Grid but doesn't have label`
					);
			}
		});
	}
}

export default Model;

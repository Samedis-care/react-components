import Type from "./Type";
import Visibility, { getVisibility, VisibilityCallback } from "./Visibility";
import Connector, {
	ConnectorIndex2Params,
	ResponseMeta,
} from "../Connector/Connector";
import {
	hashKey,
	QueryKey,
	useMutation,
	UseMutationResult,
	useQuery,
	UseQueryOptions,
	UseQueryResult,
} from "@tanstack/react-query";
import {
	DataGridCustomFilterData,
	DataGridIdFilterData,
	IDataGridColumnDef,
	DataGridFilterParameters,
	IDataGridLoadDataParameters,
} from "../../standalone/DataGrid/DataGrid";
import ModelDataStore from "../Store";
import { dotToObject, getValueByDot } from "../../utils/dotUtils";
import deepAssign from "../../utils/deepAssign";
import deepClone from "../../utils/deepClone";
import isPlainObject from "../../utils/isPlainObject";
import throwError from "../../utils/throwError";
import RequestBatching from "./RequestBatching";
import { blobsToDataUris } from "../Connector/bodyFiles";

// optional import
let captureException: ((e: Error) => void) | null = null;
import("@sentry/react")
	.then((Sentry) => (captureException = Sentry.captureException))
	.catch(() => {}); // ignore

export interface PageVisibility {
	overview: Visibility;
	edit: VisibilityCallback;
	create: VisibilityCallback;
}

export type ModelIdFilterData = Omit<DataGridIdFilterData, "model">;
export type ModelCustomFilterData = DataGridCustomFilterData;

export interface ModelFieldDefinition<
	TypeT,
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
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
	 * Custom label shown in DataGrid settings (not column label, use getColumnLabel for that)
	 * @remarks Used for BackendDataGrid
	 * @default return value of getLabel
	 */
	getHeaderName?: () => string;
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
		IDataGridColumnDef["width"] | (() => IDataGridColumnDef["width"]);
	/**
	 * Custom label for grid column header (not DataGrid settings, use getHeaderName for that)
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
	validate?(
		value: TypeT,
		values: Record<string, unknown>,
		field: ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>,
	): Promise<string | null> | string | null;
	/**
	 * Callback to validate field to provide optional hints
	 * @see validate
	 */
	validateHint?(
		value: TypeT,
		values: Record<string, unknown>,
		field: ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>,
	): Promise<string | null> | string | null;
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
	onChange?(
		value: TypeT,
		model: ModelUnknown,
		setFieldValue: ModelSetFieldValue<KeyT>,
		getFieldValue: ModelGetFieldValue<KeyT>,
	): TypeT;
	/**
	 * The referenced model for backend connected data types.
	 * @param id The current record ID
	 * @param values Subset of the current record (select relevant data with getRelationModelValues)
	 */
	getRelationModel?: (
		id: string | null,
		values: Record<string, unknown>,
	) => ModelUnknown;
	/**
	 * The fields of this model getRelationModel gets in its values
	 */
	getRelationModelValues?: KeyT[];
}

export type ModelFieldName = "id" | string;

/**
 * Sets another field's value, as onChange gets it
 * @remarks a method signature, so a model typed with other field names still fits
 */
export type ModelSetFieldValue<KeyT extends ModelFieldName> = {
	set(
		field: KeyT,
		value: unknown,
		shouldValidate?: boolean,
		triggerOnChange?: boolean,
	): void;
}["set"];
/**
 * Gets another field's value, as onChange gets it
 * @see ModelSetFieldValue
 */
export type ModelGetFieldValue<KeyT extends ModelFieldName> = {
	get(field: KeyT): unknown;
}["get"];

/**
 * A field definition of any model
 */
export type ModelFieldDefinitionUnknown = ModelFieldDefinition<
	// any: Type<T> is invariant in T (RenderParams), so no other value type takes every field
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	ModelFieldName,
	PageVisibility,
	unknown
>;
/**
 * The field definitions of a model, by field name
 */
export type ModelFields = Record<ModelFieldName, ModelFieldDefinitionUnknown>;

/**
 * Rejects keys a field definition doesn't know (typos), which inferring the field definitions
 * would accept
 */
export type ModelFieldsNoExtraKeys<FieldsT> = {
	[K in keyof FieldsT]: string extends keyof FieldsT[K]
		? unknown // not an object literal, its keys are not known
		: {
				[
					P in Exclude<keyof FieldsT[K], keyof ModelFieldDefinitionUnknown>
				]: never;
			};
};

/**
 * Requires a field's getDefaultValue to return what its type holds, which the field definitions'
 * inference doesn't check. undefined falls back to the type's default value.
 */
export type ModelFieldsDefaultsMatchType<FieldsT> = {
	[K in keyof FieldsT]: {
		getDefaultValue?: () =>
			| Promise<ModelFieldValue<FieldsT[K]> | undefined>
			| ModelFieldValue<FieldsT[K]>
			| undefined;
	};
};

/**
 * Any model
 */

export type ModelUnknown = Model;

/**
 * What the type helpers need of a model: its field definitions
 */
export interface ModelLike {
	readonly fields: ModelFields;
}

/**
 * The field names of a model
 */
export type ModelFieldNames<M extends ModelLike> = keyof M["fields"] & string;

type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * The value type of a field definition
 */
export type ModelFieldValue<FieldT> = FieldT extends {
	type: Type<infer T>;
}
	? IsAny<T> extends true
		? unknown
		: T
	: never;

/**
 * The values of a model by field name (dot notation), as setFieldValue and getFieldValue see them
 */
export type ModelFieldValues<M extends ModelLike> =
	string extends keyof M["fields"]
		? Record<string, unknown>
		: {
				[K in ModelFieldNames<M>]: ModelFieldValue<M["fields"][K]>;
			};

type DotHead<K extends string> = K extends `${infer H}.${string}` ? H : K;

/**
 * A parent field's value merged with its child fields' object
 * @remarks a parent that may be null (or undefined) stays so: deserializing assigns it over the
 * child fields when it comes after them in the model
 */
type MergeParent<P, C> = unknown extends C
	? P
	: (NonNullable<P> & C) | Extract<P, null | undefined>;

/**
 * Turns dot notation keys into nested objects, the way Model and Form build records
 */
type DotsToNested<T> = {
	[H in DotHead<keyof T & string>]: MergeParent<
		H extends keyof T ? T[H] : unknown,
		[Extract<keyof T, `${H}.${string}`>] extends [never]
			? unknown
			: DotsToNested<{
					[
						P in keyof T & string as P extends `${H}.${infer R}` ? R : never
					]: T[P];
				}>
	>;
};

type Flatten<T> = T extends Date | Blob | readonly unknown[]
	? T
	: T extends object
		? { [K in keyof T]: Flatten<T[K]> }
		: T;

type DeepPartial<T> = T extends Date | Blob | readonly unknown[]
	? T
	: T extends object
		? { [K in keyof T]?: DeepPartial<T[K]> }
		: T;

/**
 * A record of a model: the deserialized data and the form values, fields in dot notation nested
 * @remarks a parent field (`a`) and its child fields (`a.b`) are merged into one object
 */
export type ModelRecord<M extends ModelLike> = string extends keyof M["fields"]
	? Record<string, unknown>
	: Flatten<DotsToNested<ModelFieldValues<M>>>;

/**
 * Some fields of a record of a model, as saving takes them: fields left out are not sent, and
 * an id of null (or none) creates a new record
 */
export type ModelRecordPartial<M extends ModelLike> = Omit<
	DeepPartial<ModelRecord<M>>,
	"id"
> & { id?: string | null };

/**
 * The custom data of a model's fields, a union over all fields
 */
export type ModelCustomData<M extends ModelLike> =
	M["fields"][keyof M["fields"]]["customData"];

/**
 * Any model whose fields all carry custom data of type CustomT
 */
export type ModelWithCustomData<CustomT> = Model<
	Record<
		ModelFieldName,
		ModelFieldDefinition<
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			any,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			any,
			PageVisibility,
			CustomT
		>
	>
>;

/**
 * The related records of a record, by field name (records of the related models)
 */
export type ModelGetResponseRelations<M extends ModelLike> = Partial<
	Record<ModelFieldNames<M>, Record<ModelFieldName, unknown>[]>
>;

/**
 * Response for GET single data entry
 * @remarks Connectors return it for ModelUnknown: their data is not deserialized yet
 */
export type ModelGetResponse<M extends ModelLike> = [
	ModelRecord<M>, // the main data entry
	ModelGetResponseRelations<M>, // data in relations
	unknown?, // optional user-defined data
];

/**
 * Response for an index request
 * @remarks The records only hold the fields visible in the overview
 */
export type ModelIndexResponse<M extends ModelLike> = [
	records: ModelRecord<M>[],
	meta: ResponseMeta,
	userMeta?: unknown,
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
	filter?: DataGridFilterParameters,
];

export interface CacheOptions {
	/**
	 * Time to consider data valid in milliseconds
	 * @default 30s
	 */
	staleTime?: number;
	/**
	 * Time to keep data cached after it's no longer in use in milliseconds
	 * (react-query's gcTime), 0 to drop it at once
	 * @default 5m
	 */
	gcTime?: number;
}

export interface ModelGetOptions {
	/**
	 * Use batched requests
	 * @see ModelOptions.enableRequestBatching
	 */
	batch?: boolean;
	/**
	 * Dont report RequestBatchingError errors
	 */
	dontReportNotFoundInBatch?: boolean;
}

/**
 * React-Query's useQuery for the given model and record ID
 * @param model The model ID to load
 * @param id The record ID (or null to get default values on create)
 * @param options Extra options to pass to useQuery (defaults are provided for retry, staleTime and gcTime (last two only if configured in model))
 */
export const useModelGet = <M extends ModelUnknown>(
	model: M,
	id: string | null,
	options?: Omit<
		UseQueryOptions<ModelGetResponse<M>, Error, ModelGetResponse<M>>,
		"queryKey" | "queryFn"
	> &
		ModelGetOptions,
): UseQueryResult<ModelGetResponse<M>, Error> => {
	return useQuery({
		queryKey: model.getReactQueryKey(
			id,
			options?.batch ?? model.requestBatchingEnabled,
		),
		queryFn: () => model.getRaw(id, options),
		// 3 retries if we get network error
		retry: (count, err: Error) => err.name === "NetworkError" && count < 3,
		...model.cacheOptions,
		...options,
	});
};

/**
 * React-Query's useQuery for the given model and index params
 * @param model The model ID to load
 * @param params The params to pass to fetchAll/index
 * @param options The useQuery options
 * @returns ModelIndexResponse where userMeta and meta is taken from the last call
 * @see Model.fetchAll
 */
export const useModelFetchAll = <M extends ModelUnknown>(
	model: M,
	params?: ModelFetchAllParams,
	options?: Omit<
		UseQueryOptions<ModelIndexResponse<M>, Error, ModelIndexResponse<M>>,
		"queryFn" | "queryKey"
	>,
): UseQueryResult<ModelIndexResponse<M>, Error> => {
	return useQuery({
		queryKey: model.getReactQueryKeyFetchAll(params),
		queryFn: () => model.fetchAll(params),
		// 3 retries if we get network error
		retry: (count, err: Error) => err.name === "NetworkError" && count < 3,
		...model.cacheOptions,
		...options,
	});
};

/**
 * React-Query's useQuery for one page of the given model's index
 * @param model The model to load
 * @param params The params to pass to index, rows: 0 to only count the records (if the connector supports it)
 * @param options The useQuery options
 * @returns ModelIndexResponse of that page
 * @remarks Mutations don't invalidate it (as with useModelFetchAll), Model.invalidateIndexQueries does for every page of the model
 * @see Model.index
 * @see Model.getReactQueryKeyIndex
 * @see Model.invalidateIndexQueries
 */
export const useModelIndex = <M extends ModelUnknown>(
	model: M,
	params?: Partial<IDataGridLoadDataParameters>,
	options?: Omit<
		UseQueryOptions<ModelIndexResponse<M>, Error, ModelIndexResponse<M>>,
		"queryFn" | "queryKey"
	>,
): UseQueryResult<ModelIndexResponse<M>, Error> => {
	return useQuery({
		queryKey: model.getReactQueryKeyIndex(params),
		queryFn: () => model.index(params),
		// 3 retries if we get network error
		retry: (count, err: Error) => err.name === "NetworkError" && count < 3,
		...model.cacheOptions,
		...options,
	});
};

/**
 * React-Query's useQuery for a range of the given model's index (by offset)
 * @param model The model to load
 * @param params The params to pass to index2
 * @param options The useQuery options
 * @returns ModelIndexResponse of that range
 * @remarks Mutations don't invalidate it (as with useModelFetchAll), Model.invalidateIndex2Queries does for every range of the model
 * @see Model.index2
 * @see Model.getReactQueryKeyIndex2
 * @see Model.invalidateIndex2Queries
 */
export const useModelIndex2 = <M extends ModelUnknown>(
	model: M,
	params: ConnectorIndex2Params,
	options?: Omit<
		UseQueryOptions<ModelIndexResponse<M>, Error, ModelIndexResponse<M>>,
		"queryFn" | "queryKey"
	>,
): UseQueryResult<ModelIndexResponse<M>, Error> => {
	return useQuery({
		queryKey: model.getReactQueryKeyIndex2(params),
		queryFn: () => model.index2(params),
		// 3 retries if we get network error
		retry: (count, err: Error) => err.name === "NetworkError" && count < 3,
		...model.cacheOptions,
		...options,
	});
};

/**
 * React-Query's useMutation to update/create a new record on backend
 * @param model The model
 * @see model.createOrUpdateRecordRaw
 */
export const useModelMutation = <M extends ModelUnknown, TContext = unknown>(
	model: M,
): UseMutationResult<
	ModelGetResponse<M>,
	Error,
	ModelRecordPartial<M>,
	TContext
> => {
	return useMutation({
		mutationKey: [model.modelId, "create-or-update"],
		mutationFn: model.createOrUpdateRecordRaw.bind(model),
		onSuccess: (responseData: ModelGetResponse<M>, inputData) => {
			const inputId = (inputData as { id: string | null }).id;
			const id = (responseData[0] as Record<"id", string>).id;
			if (!id) {
				throw new Error("Can't update null ID");
			}
			if (model.hooks.onCreateOrUpdate) {
				model.hooks.onCreateOrUpdate(responseData);
			}
			const updateForId = (id: string) => {
				ModelDataStore.setQueryData(
					model.getReactQueryKey(id, false),
					responseData,
				);
				if (model.requestBatchingEnabled) {
					ModelDataStore.setQueryData(
						model.getReactQueryKey(id, true),
						responseData,
					);
				} else {
					ModelDataStore.removeQueries({
						queryKey: model.getReactQueryKey(id, true),
					});
				}
			};
			updateForId(id);
			if (inputId) {
				if (inputId === "singleton") {
					updateForId(inputId);
				}
			}
			model.triggerMutationEvent(!inputId, responseData);
		},
	});
};

/**
 * React-Query's useMutation to delete a single record on backend
 * @param model The model
 */
export const useModelDelete = <TContext = unknown>(
	model: ModelUnknown,
): UseMutationResult<void, Error, string, TContext> => {
	return useMutation({
		mutationKey: [model.modelId, "delete"],
		mutationFn: model.deleteRaw.bind(model),
		onSuccess: (data: void, id: string) => model.invalidateCacheForId(id),
	});
};

/**
 * React-Query's useMutation to delete multiple records by ID on backend
 * @param model The model
 */
export const useModelDeleteMultiple = <TContext = unknown>(
	model: ModelUnknown,
): UseMutationResult<void, Error, string[], TContext> => {
	return useMutation({
		mutationKey: [model.modelId, "delete-multi"],
		mutationFn: model.deleteMultipleRaw.bind(model),
		onSuccess: (data: void, ids: string[]) => {
			ids.forEach((id) => model.invalidateCacheForId(id));
		},
	});
};

/**
 * React-Query's useMutation to delete records using advanced filters on backend
 * @param model The model
 * @see model.deleteAdvancedRaw
 */
export const useModelDeleteAdvanced = <TContext = unknown>(
	model: ModelUnknown,
): UseMutationResult<void, Error, AdvancedDeleteRequest, TContext> => {
	return useMutation({
		mutationKey: [model.modelId, "delete-adv"],
		mutationFn: model.deleteAdvancedRaw.bind(model),
		onSuccess: (data: void, req: AdvancedDeleteRequest) => {
			// this function is likely to flush more than actually deleted
			const [invert, ids] = req;
			if (!invert) {
				ids.forEach((id) => model.invalidateCacheForId(id));
			} else {
				// delete everything from this model, unless ID matches
				ModelDataStore.removeQueries({
					predicate: (query): boolean => {
						// only record keys hold an id there, lists hold their params (maybe none)
						const id = (query.queryKey[1] as { id?: string } | undefined)?.id;
						return (
							query.queryKey[0] === model.modelId &&
							(id === undefined || !ids.includes(id))
						);
					},
				});
			}
		},
	});
};

/**
 * Mutation event handler
 * @param data The response data
 */
export type ModelEventMutation<M extends ModelLike> = (
	data: ModelGetResponse<M>,
) => void;

export interface ModelHooks {
	/**
	 * Hook fired on useModelMutation success
	 * @param data The updated record
	 */
	onCreateOrUpdate?: (data: ModelGetResponse<ModelUnknown>) => void;
}

export interface ModelOptions {
	/**
	 * Cache options
	 */
	cacheOptions?: CacheOptions;
	/**
	 * Hooks
	 */
	hooks?: ModelHooks;
	/**
	 * Enable request batching: uses index requests instead of show requests using field filter for ID inSet to reduce the number of GET requests
	 * Uses overview visibility settings, can be toggled for single requests using options there. This is the default value if not specified there
	 * @remarks configure RequestBatching class for performance tweaking
	 * @see RequestBatching
	 */
	enableRequestBatching?: boolean;
	/**
	 * Optional additional cache keys for index/fetchAll action
	 */
	cacheKeysIndex?: unknown;
}

/**
 * A data model: its fields and the connector to load and save them
 * @typeParam FieldsT The field definitions, inferred by the constructor
 * @typeParam KeyT The field names, follow from FieldsT
 */
class Model<
	FieldsT extends ModelFields = ModelFields,
	KeyT extends ModelFieldName = keyof FieldsT & string,
> {
	/**
	 * A unique model identifier, used for caching
	 */
	public readonly modelId: string;
	/**
	 * The actual model definition
	 */
	public readonly fields: FieldsT;
	/**
	 * The backend connector providing a CRUD interface for the model
	 */
	public connector: Connector;
	/**
	 * Optional additional cache keys
	 */
	public readonly cacheKeys?: unknown;
	/**
	 * Optional additional cache keys for index/fetchAll action
	 */
	public readonly cacheKeysIndex?: unknown;
	/**
	 * Caching options
	 */
	public cacheOptions?: CacheOptions;
	/**
	 * Hooks
	 */
	public readonly hooks: ModelHooks;
	/**
	 * @see ModelOptions.enableRequestBatching
	 */
	public readonly requestBatchingEnabled: boolean;
	/**
	 * The options passed in the constructor
	 * @readonly
	 */
	public readonly options?: Readonly<ModelOptions>;

	/**
	 * Global toggle to trigger auto validation of UX when constructor is called
	 */
	public static autoValidateUX = false;
	/**
	 * Throw errors when UX auto validation fails, only used when autoValidateUX is true
	 */
	public static autoValidateUXThrow = false;
	/**
	 * Print developer warnings?
	 */
	public static printDevWarnings = process.env.NODE_ENV === "development";

	/**
	 * The fields, by any field name
	 */
	private get fieldsByName(): ModelFields {
		return this.fields;
	}

	/**
	 * This model, as connectors and the event handlers of every model take it
	 */
	private get asModelUnknown(): ModelUnknown {
		return this as unknown as ModelUnknown;
	}

	/**
	 * Types deserialized data as records of this model: applySerialization and getDefaultValues
	 * build them from the field definitions
	 */
	private asRecords(data: Record<string, unknown>[]): ModelRecord<this>[] {
		return data as ModelRecord<this>[];
	}

	/**
	 * @see asRecords
	 */
	private asRecord(data: Record<string, unknown>): ModelRecord<this> {
		return data as ModelRecord<this>;
	}

	/**
	 * Creates a new model
	 * @param name A unique name for the model (modelId)
	 * @param model The actual model definition
	 * @param connector A backend connector
	 * @param cacheKeys The cache keys
	 * @param options Model options
	 */
	constructor(
		name: string,
		// KeyT comes from the keys alone: the onChange callbacks are typed with it before FieldsT is known
		model: FieldsT &
			Record<
				KeyT,
				ModelFieldDefinition<
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					any,
					NoInfer<KeyT>,
					PageVisibility,
					unknown
				>
			> &
			ModelFieldsNoExtraKeys<NoInfer<FieldsT>> &
			ModelFieldsDefaultsMatchType<NoInfer<FieldsT>>,
		connector: Connector,
		cacheKeys?: unknown,
		options?: ModelOptions,
	) {
		this.modelId = name;
		this.fields = model;
		this.connector = connector;
		this.options = options;
		this.cacheKeys = cacheKeys;
		this.cacheOptions = options?.cacheOptions ?? {
			staleTime: 30000,
		};
		this.hooks = options?.hooks ?? {};
		this.requestBatchingEnabled = options?.enableRequestBatching ?? false;
		this.cacheKeysIndex = options?.cacheKeysIndex;
		if (Model.autoValidateUX) this.validateUX(Model.autoValidateUXThrow);
		if (this.requestBatchingEnabled)
			this.canRequestsBeBatched(Model.printDevWarnings);
	}

	/**
	 * Loads a list of data entries by the given search params
	 * @param params The search params, the connector gets a copy of them
	 */
	public async index(
		params: Partial<IDataGridLoadDataParameters> | undefined,
	): Promise<ModelIndexResponse<this>> {
		try {
			// a copy, so what the connector changes doesn't reach the caller's params (or the cache keys holding them)
			const [rawData, meta, userData] = await this.connector.index(
				deepClone(params),
				this.asModelUnknown,
			);
			return [
				this.cacheIndexRecords(
					await Promise.all(
						rawData.map((data) =>
							this.applySerialization(data, "deserialize", "overview"),
						),
					),
				),
				meta,
				userData,
			];
		} catch (err) {
			if (
				captureException &&
				err instanceof Error &&
				!["NetworkError", "BackendError"].includes(err.name)
			) {
				captureException(err);
			}
			throw err;
		}
	}

	/**
	 * Loads a list of data entries by the given search params. Works with offsets rather than pages
	 * @param params The search params, the connector gets a copy of them
	 * @see index
	 */
	public async index2(
		params: ConnectorIndex2Params,
	): Promise<ModelIndexResponse<this>> {
		const [rawData, meta, userData] = await this.connector.index2(
			deepClone(params),
			this.asModelUnknown,
		);
		return [
			this.cacheIndexRecords(
				await Promise.all(
					rawData.map((data) =>
						this.applySerialization(data, "deserialize", "overview"),
					),
				),
			),
			meta,
			userData,
		];
	}

	/**
	 * Cache index records for batched requests
	 * @param records The records to cache (from index response)
	 * @returns records Same as input
	 * @private
	 */
	private cacheIndexRecords(
		records: Record<string, unknown>[],
	): ModelRecord<this>[] {
		// cache records for batching
		records.forEach((record) => {
			ModelDataStore.setQueryData(
				this.getReactQueryKey(record.id as string, true),
				[record, {}],
			);
		});

		return this.asRecords(records);
	}

	/**
	 * Fetches all records using index calls
	 * @param params The params to pass to index
	 * @returns ModelIndexResponse where userMeta and meta is taken from the last call
	 */
	public async fetchAll(
		params?: ModelFetchAllParams,
	): Promise<ModelIndexResponse<this>> {
		let page = 1;
		let perPage = 1000;
		let perPageDefault = true;
		let meta: ResponseMeta;
		let userMeta: unknown;
		const records: Record<string, unknown>[] = [];

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

		return [this.asRecords(records), meta, userMeta];
	}

	/**
	 * Fetches all records using index calls and caches the result
	 * @param params The params to pass to index
	 * @returns ModelIndexResponse where userMeta and meta is taken from the last call
	 * @see fetchAll
	 */
	public async fetchAllCached(
		params?: ModelFetchAllParams,
	): Promise<ModelIndexResponse<this>> {
		return ModelDataStore.fetchQuery({
			queryKey: this.getReactQueryKeyFetchAll(params),
			queryFn: () => this.fetchAll(params),
			...this.cacheOptions,
		});
	}

	/**
	 * Gets the react-query cache key for this model
	 * @param id The record id
	 * @param batch Is request batched (uses index action)?
	 */
	public getReactQueryKey(id: string | null, batch: boolean): QueryKey {
		return [
			this.modelId,
			{ id: id },
			batch ? (this.cacheKeysIndex ?? []) : null,
			this.cacheKeys,
		];
	}

	/**
	 * Gets the react-query cache key for this model (for fetch all)
	 * @param params The fetch all params
	 */
	public getReactQueryKeyFetchAll(params?: ModelFetchAllParams): QueryKey {
		return [this.modelId, params, this.cacheKeys, this.cacheKeysIndex];
	}

	/**
	 * Gets the react-query cache key for this model (for one index page)
	 * @param params The index params
	 * @see useModelIndex
	 */
	public getReactQueryKeyIndex(
		params?: Partial<IDataGridLoadDataParameters>,
	): QueryKey {
		// the marker keeps a page apart from a fetch all with the same filters
		return [this.modelId, "index", params, this.cacheKeys, this.cacheKeysIndex];
	}

	/**
	 * Gets the react-query cache key for this model (for an index2 range)
	 * @param params The index2 params
	 * @see useModelIndex2
	 */
	public getReactQueryKeyIndex2(params: ConnectorIndex2Params): QueryKey {
		return [
			this.modelId,
			"index2",
			params,
			this.cacheKeys,
			this.cacheKeysIndex,
		];
	}

	/**
	 * Invalidates the cached data for record ID
	 * @param id The record ID
	 */
	public invalidateCacheForId(id: string) {
		// prefix match: wipe all queries for this model + id regardless of cacheKeys/cacheKeysIndex
		void ModelDataStore.invalidateQueries({
			queryKey: [this.modelId, { id: id }],
			exact: false,
		});
	}

	/**
	 * Invalidates all of this model's queries (records, batched or not, fetch all, index pages and
	 * index2 ranges): any params and cacheKeysIndex, this model's cacheKeys
	 * @see invalidateCacheForId
	 */
	public invalidateQueries(): Promise<void> {
		return this.invalidateQueriesUnder([this.modelId]);
	}

	/**
	 * Invalidates every page of this model's index (useModelIndex): any params and cacheKeysIndex,
	 * this model's cacheKeys
	 * @see getReactQueryKeyIndex
	 */
	public invalidateIndexQueries(): Promise<void> {
		return this.invalidateQueriesUnder([this.modelId, "index"]);
	}

	/**
	 * Invalidates every range of this model's index2 (useModelIndex2): any params and
	 * cacheKeysIndex, this model's cacheKeys
	 * @see getReactQueryKeyIndex2
	 */
	public invalidateIndex2Queries(): Promise<void> {
		return this.invalidateQueriesUnder([this.modelId, "index2"]);
	}

	/**
	 * Invalidates this model's queries under the key prefix which have this model's cacheKeys
	 * @param prefix The query key prefix, starting with the modelId
	 */
	private invalidateQueriesUnder(prefix: QueryKey): Promise<void> {
		const cacheKeys = hashKey([this.cacheKeys]);
		return ModelDataStore.invalidateQueries({
			queryKey: prefix,
			// the params or the record id come before the cacheKeys, so the prefix can't hold them
			predicate: ({ queryKey }) =>
				hashKey([Model.getCacheKeysOf(queryKey)]) === cacheKeys,
		});
	}

	/**
	 * Gets the cacheKeys out of a query key of a model
	 * @param queryKey The query key, as getReactQueryKey* build them
	 */
	private static getCacheKeysOf(queryKey: QueryKey): unknown {
		const marker = queryKey[1];
		// a fetch all key has its params (no id) where the others have their marker or record id
		const fetchAll = !(
			marker === "index" ||
			marker === "index2" ||
			(isPlainObject(marker) && "id" in marker)
		);
		return queryKey[fetchAll ? 2 : 3];
	}

	/**
	 * Provides a react-query useQuery hook for the given data id
	 * @param id The data record id
	 * @deprecated Use useModelGet(model, id) instead
	 */
	public get(id: string | null): UseQueryResult<ModelGetResponse<this>, Error> {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useModelGet(this, id);
	}

	/**
	 * Provides cached access for the given data id
	 * @param id The data record id or null to obtain the default values
	 * @param options Request options
	 */
	public getCached(
		id: string | null,
		options?: ModelGetOptions,
	): Promise<ModelGetResponse<this>> {
		return ModelDataStore.fetchQuery({
			queryKey: this.getReactQueryKey(
				id,
				options?.batch ?? this.requestBatchingEnabled,
			),
			queryFn: () => this.getRaw(id, options),
			...this.cacheOptions,
		});
	}

	/**
	 * Provides uncached access for the given data id
	 * @param id The data record id or null to obtain the default values
	 * @param options Request options
	 */
	public async getRaw(
		id: string | null,
		options?: ModelGetOptions,
	): Promise<ModelGetResponse<this>> {
		try {
			if (!id) return [this.asRecord(await this.getDefaultValues()), {}];

			const batch = options?.batch ?? this.requestBatchingEnabled;

			if (batch) {
				const rawData = await RequestBatching.get(id, this.asModelUnknown);
				return [this.asRecord(rawData), {}];
			} else {
				const rawData = await this.connector.read(id, this.asModelUnknown);
				return this.deserializeResponse(rawData);
			}
		} catch (err) {
			if (
				captureException &&
				err instanceof Error &&
				!["NetworkError", "BackendError"].includes(err.name) &&
				!(
					options?.dontReportNotFoundInBatch &&
					err.name === "RequestBatchingError"
				)
			) {
				captureException(err);
			}
			throw err;
		}
	}

	/**
	 * Deserializes the given ModelGetResponse
	 * @param rawData The data to deserialize
	 * @private
	 */
	private async deserializeResponse(
		rawData: ModelGetResponse<ModelUnknown>,
	): Promise<ModelGetResponse<this>> {
		const deserialized = await this.applySerialization(
			rawData[0],
			"deserialize",
			"edit",
		);
		return [
			this.asRecord(deserialized),
			Object.fromEntries(
				await Promise.all(
					Object.entries(rawData[1]).map(async (keyValue) => {
						const fieldName = keyValue[0];
						const values = keyValue[1] as Record<string, unknown>[];
						const refModel = this.fieldsByName[fieldName]?.getRelationModel;

						if (!refModel) {
							// eslint-disable-next-line no-console
							console.warn(
								"[Components-Care] [Model] Backend connector supplied related data, but no model is defined for this relationship (relationship name = " +
									fieldName +
									"). Data will be ignored.",
							);
						}

						return [
							fieldName,
							refModel
								? await Promise.all(
										values.map((value) =>
											refModel(
												deserialized.id as string | null,
												deserialized,
											).applySerialization(value, "deserialize", "edit"),
										),
									)
								: null,
						];
					}),
				),
			),
		];
	}

	/**
	 * Provides a react-query useMutation hook for creation or updates to an data entry
	 * @deprecated Use useModelMutation(model) instead
	 */
	public createOrUpdate<TContext = unknown>(): UseMutationResult<
		ModelGetResponse<this>,
		Error,
		ModelRecordPartial<this>,
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
		values: ModelRecordPartial<this>,
	): Promise<ModelGetResponse<this>> {
		const update = !!("id" in values && values.id);
		const serializedValues = await this.applySerialization(
			values,
			"serialize",
			update ? "edit" : "create",
		);
		if (update) {
			return this.deserializeResponse(
				await this.connector.update(serializedValues, this.asModelUnknown),
			);
		} else {
			delete serializedValues.id;
			return this.deserializeResponse(
				await this.connector.create(serializedValues, this.asModelUnknown),
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
		return useModelDelete(this.asModelUnknown);
	}

	/**
	 * Delete a single record in backend (does not affect local cache)
	 * @param id The ID to delete
	 */
	public async deleteRaw(id: string): Promise<void> {
		return this.connector.delete(id, this.asModelUnknown);
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
		return useModelDeleteMultiple(this.asModelUnknown);
	}

	/**
	 * Deletes multiple record at once (does not affect local cache)
	 * @param ids The IDs to delete
	 */
	public async deleteMultipleRaw(ids: string[]): Promise<void> {
		return this.connector.deleteMultiple(ids, this.asModelUnknown);
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
		return useModelDeleteAdvanced(this.asModelUnknown);
	}

	/**
	 * Raw request to mass-delete data (does not affect local cache)
	 * @param req The deletion request
	 */
	public async deleteAdvancedRaw(req: AdvancedDeleteRequest): Promise<void> {
		if (!this.connector.deleteAdvanced) {
			throw new Error("Connector doesn't support advanced deletion");
		}
		return this.connector.deleteAdvanced(req, this.asModelUnknown);
	}

	/**
	 * Updates stored data (not relations)
	 * @param id The id of the record to edit
	 * @param batch Data from index response?
	 * @param updater The function which updates the data
	 */
	public updateStoredData(
		id: string,
		batch: boolean,
		updater: (old: ModelRecord<this>) => ModelRecord<this>,
	): void {
		ModelDataStore.setQueryData(
			this.getReactQueryKey(id, batch),
			(data: ModelGetResponse<this> | undefined): ModelGetResponse<this> => {
				if (!data) throw new Error("Data not set");
				const [record, ...other] = data;
				return [updater(record), ...other];
			},
		);
	}

	/**
	 * Returns a data grid compatible column definition
	 */
	public toDataGridColumnDefinition(
		includeHidden = false,
	): IDataGridColumnDef[] {
		return (
			!includeHidden
				? Object.entries(this.fields).filter(
						(entry) => !entry[1].visibility.overview.disabled,
					)
				: Object.entries(this.fields)
		).map((entry) => {
			const key = entry[0];
			const value = entry[1];

			let filterData: IDataGridColumnDef["filterData"] = undefined;
			if (value.type.getFilterType() === "enum") {
				if (!value.type.getEnumValues)
					throw new Error(
						`Field ${key} Model Type Filter Type is enum, but getEnumValues not set`,
					);
				filterData = value.type
					.getEnumValues()
					.filter((value) => !(value.invisibleInGridFilter ?? value.invisible))
					.map((value) => ({
						getLabelText: value.getLabel,
						value: value.value,
						disabled: value.disabled,
						isDivider: value.isDivider,
					}));
			} else if (value.type.getFilterType() === "boolean") {
				filterData = [true, false].map((boolVal) => ({
					getLabelText: value.type.stringify.bind(value.type, boolVal),
					value: boolVal ? "true" : "false",
				}));
			} else if (
				value.type.getFilterType() === "id" &&
				value.filterable &&
				// idFilter null opts into manual ID entry: leaving filterData undefined makes
				// the grid render a plain text input instead of the ID selector
				value.type.idFilter !== null
			) {
				if (value.getRelationModelValues)
					throw new Error(
						`Unsupported grid column filter ID for field ${key} with relation model values`,
					);
				if (!value.getRelationModel)
					throw new Error(
						`Unsupported grid column filter ID for field ${key} without relation model`,
					);
				if (!value.type.idFilter)
					throw new Error(
						`Field ${key} with grid column filter of type ID has no idFilter props`,
					);
				filterData = {
					model: value.getRelationModel(null, {}),
					...value.type.idFilter,
				};
			} else if (value.type.getFilterType() === "custom" && value.filterable) {
				if (!value.type.customFilter)
					throw new Error(
						`Field ${key} with grid column filter of type CUSTOM has no customFilter props`,
					);
				filterData = {
					...value.type.customFilter,
				};
			}

			return {
				field: key,
				headerName: value.getHeaderName
					? value.getHeaderName()
					: value.getLabel(),
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
		type: "normal" | "hint" = "normal",
	): Promise<Record<string, string>> {
		const errors: Record<string, string> = {};
		const validationFunction = type === "normal" ? "validate" : "validateHint";

		await Promise.all(
			Object.keys(this.fields).map(async (field) => {
				// skip validations for fields which aren't defined in the model or which are disabled in the current view or aren't currently mounted
				const value = getValueByDot(field, values);
				if (value === undefined) return;

				try {
					const fieldDef = this.fieldsByName[field];
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
							fieldDef.type,
						);
						error = validate
							? // a field's type takes the definition of that field

								await validate(value, fieldDef)
							: null;
					} catch (e) {
						// eslint-disable-next-line
						console.error(
							"[Components-Care] [Model.validate] Error during validation:",
							e,
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
								e,
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
						e,
					);
					if (captureException) captureException(e as Error);
				}
			}),
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
						this.fieldsByName[field].visibility.create,
						{},
						{},
					).disabled;
				} catch {
					return true;
				}
			})
			.map(async (entry) => {
				const [field, def] = entry as [KeyT, ModelFieldDefinitionUnknown];
				let defaultValue: unknown;
				if (def.getDefaultValue) {
					defaultValue = await def.getDefaultValue();
				}
				// handle cases where getDefaultValue: () => params.optionalValue. We can't set undefined here or it will skip validation
				if (defaultValue === undefined) {
					defaultValue = def.type.getDefaultValue();
				}
				if (defaultValue === undefined) {
					// leads to broken validations
					throw new Error(
						"defaultValue is undefined: " + this.modelId + ":" + field,
					);
				}
				// the fields inside an object field are merged into the object assigned for it (see applySerialization),
				// so each record needs its own and not the one getDefaultValue may hand out every time
				deepAssign(
					data,
					dotToObject(
						field,
						isPlainObject(defaultValue)
							? deepClone(defaultValue)
							: defaultValue,
					),
				);
			});
		await Promise.all(promises);
		return data;
	}

	/**
	 * Serializes the given values into a JSON string
	 * @param values The values to serialize
	 * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
	 * @remarks A file (Blob) is written as data URI, as JSON cannot carry it
	 */
	public async serialize(
		values: Record<string, unknown>,
		visibility: keyof PageVisibility,
	): Promise<string> {
		const serializable = await this.applySerialization(
			values,
			"serialize",
			visibility,
		);
		return JSON.stringify(await blobsToDataUris(serializable));
	}

	/**
	 * Deserializes the given JSON data back into a data record
	 * @param data The JSON string
	 * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
	 */
	public async deserialize(
		data: string,
		visibility: keyof PageVisibility,
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
		visibility: keyof PageVisibility,
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
				values,
			);
			if (
				visValue.disabled &&
				(func === "serialize" || !visValue.readOnly) &&
				key !== "id"
			) {
				continue;
			}

			if (
				Model.printDevWarnings &&
				value === undefined &&
				func === "deserialize"
			) {
				// eslint-disable-next-line no-console
				console.log(
					`[Components-Care] [Model(id = ${this.modelId}).applySerialization(..., 'deserialize', '${visibility}')] Field ${key} cannot be found in values`,
					values,
				);
			}

			const serializeFunc = field.type[func];

			let result: unknown;
			if (serializeFunc) {
				result = (await serializeFunc(value)) as unknown;
			} else {
				result = value;
			}
			// deepAssign merges the fields inside an object field (result.found_at) into the object it
			// assigned for it, so that object has to be the copy's own and not the one in values
			deepAssign(
				copy,
				dotToObject(key, isPlainObject(result) ? deepClone(result) : result),
			);
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
			const def = kv[1];

			// fields that are visibile in grid
			if (def.visibility.overview.grid) {
				// check if they have a label
				if (!def.getLabel().trim())
					report(
						`[Components-Care] [Model.validateUX] ${this.modelId}.${field} is visible in Grid but doesn't have label`,
					);
			}
		});
	}

	/**
	 * dev util to check if requests can be batched
	 * @param printWarnings output warnings, default false
	 */
	public canRequestsBeBatched(printWarnings = false): boolean {
		const fieldsNotInOverview = Object.entries(this.fields)
			.filter(([field, def]) => {
				if (field === "id") return false;
				const fieldDef = def;
				const edit = getVisibility(fieldDef.visibility.edit, {}, {});
				const overview = getVisibility(fieldDef.visibility.overview, {}, {});
				const enabled = (vis: Visibility) => !vis.disabled || vis.readOnly;
				return enabled(edit) && !enabled(overview);
			})
			.map(([field]) => field);
		if (printWarnings && fieldsNotInOverview.length > 0) {
			// eslint-disable-next-line no-console
			console.log(
				`[Components-Care] [Model(id = ${this.modelId}).canRequestsBeBatched] Fields enabled in edit, but not in overview:`,
				fieldsNotInOverview,
			);
		}
		return fieldsNotInOverview.length === 0;
	}

	// EVENT HANDLERS

	/**
	 * static event handler registry
	 * @private
	 */
	private static eventHandlers: {
		mutate: Record<string, ModelEventMutation<ModelUnknown>[]>;
	} = {
		mutate: {},
	};

	/**
	 * Adds an event handler
	 * @param evt The event to listen to
	 * @param handler The handler
	 * @param idFilter optional: id filter, undefined for any, null for newly created
	 * @remarks Remove handler with removeEventHandler when done
	 * @see removeEventHandler
	 */
	public addEventHandler(
		evt: "mutate",
		handler: ModelEventMutation<this>,
		idFilter?: string | null,
	) {
		const handlerKey = JSON.stringify(
			this.getReactQueryKey(idFilter === undefined ? "any" : idFilter, false),
		);
		// the registry holds the handlers of every model, each only gets this model's records
		const anyHandler = handler as ModelEventMutation<ModelUnknown>;
		if (!(handlerKey in Model.eventHandlers[evt])) {
			Model.eventHandlers[evt][handlerKey] = [anyHandler];
		} else {
			Model.eventHandlers[evt][handlerKey].push(anyHandler);
		}
	}

	/**
	 * Removes an event handler
	 * @param evt The event to unsubscribe from
	 * @param handler The handler that was passed to addEventHandler (exact reference!)
	 * @param idFilter optional: id filter, undefined for any, null for newly created. needs to be the same as in addEventHandler
	 * @remarks Removes handler added by addEventHandler
	 * @see addEventHandler
	 */
	public removeEventHandler(
		evt: "mutate",
		handler: ModelEventMutation<this>,
		idFilter?: string | null,
	) {
		const handlerKey = JSON.stringify(
			this.getReactQueryKey(idFilter === undefined ? "any" : idFilter, false),
		);
		if (!(handlerKey in Model.eventHandlers[evt])) {
			return;
		}
		const handlers = Model.eventHandlers[evt][handlerKey];
		Model.eventHandlers[evt][handlerKey] = handlers.filter(
			(h) => h !== handler,
		);
		if (Model.eventHandlers[evt][handlerKey].length === handlers.length) {
			throw new Error("Handler not unregistered as was not registered");
		}
		if (Model.eventHandlers[evt][handlerKey].length === 0)
			delete Model.eventHandlers[evt][handlerKey];
	}

	/**
	 * Trigger the mutation event and call event listeners
	 * @param isCreate Is the record just created
	 * @param data The response data
	 * @remarks used internally, usually not called by library using code
	 */
	public triggerMutationEvent(isCreate: boolean, data: ModelGetResponse<this>) {
		const handlers = Model.eventHandlers.mutate;
		const id = (data[0] as Record<"id", string>).id;

		const keys: (string | null)[] = ["any", id];
		if (isCreate) keys.push(null);

		keys.forEach((key) => {
			const handlerKey = JSON.stringify(this.getReactQueryKey(key, false));
			if (handlerKey in handlers) {
				handlers[handlerKey].forEach((handler) => handler(data));
			}
		});
	}
}

export default Model;

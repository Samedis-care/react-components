import Type from "./Type";
import Visibility, { VisibilityCallback } from "./Visibility";
import Connector, { ConnectorIndex2Params, ResponseMeta } from "../Connector/Connector";
import { QueryKey, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { DataGridCustomFilterData, DataGridIdFilterData, IDataGridColumnDef, DataGridFilterParameters, IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
export interface PageVisibility {
    overview: Visibility;
    edit: VisibilityCallback;
    create: VisibilityCallback;
}
export type ModelIdFilterData = Omit<DataGridIdFilterData, "model">;
export type ModelCustomFilterData = DataGridCustomFilterData;
export interface ModelFieldDefinition<TypeT, KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> {
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
    columnWidth?: IDataGridColumnDef["width"] | (() => IDataGridColumnDef["width"]);
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
    validate?(value: TypeT, values: Record<string, unknown>, field: ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>): Promise<string | null> | string | null;
    /**
     * Callback to validate field to provide optional hints
     * @see validate
     */
    validateHint?(value: TypeT, values: Record<string, unknown>, field: ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>): Promise<string | null> | string | null;
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
    onChange?(value: TypeT, model: ModelUnknown, setFieldValue: ModelSetFieldValue<KeyT>, getFieldValue: ModelGetFieldValue<KeyT>): TypeT;
    /**
     * The referenced model for backend connected data types.
     * @param id The current record ID
     * @param values Subset of the current record (select relevant data with getRelationModelValues)
     */
    getRelationModel?: (id: string | null, values: Record<string, unknown>) => ModelUnknown;
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
    set(field: KeyT, value: unknown, shouldValidate?: boolean, triggerOnChange?: boolean): void;
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
export type ModelFieldDefinitionUnknown = ModelFieldDefinition<any, ModelFieldName, PageVisibility, unknown>;
/**
 * The field definitions of a model, by field name
 */
export type ModelFields = Record<ModelFieldName, ModelFieldDefinitionUnknown>;
/**
 * Rejects keys a field definition doesn't know (typos), which inferring the field definitions
 * would accept
 */
export type ModelFieldsNoExtraKeys<FieldsT> = {
    [K in keyof FieldsT]: string extends keyof FieldsT[K] ? unknown : {
        [P in Exclude<keyof FieldsT[K], keyof ModelFieldDefinitionUnknown>]: never;
    };
};
/**
 * Requires a field's getDefaultValue to return what its type holds, which the field definitions'
 * inference doesn't check. undefined falls back to the type's default value.
 */
export type ModelFieldsDefaultsMatchType<FieldsT> = {
    [K in keyof FieldsT]: {
        getDefaultValue?: () => Promise<ModelFieldValue<FieldsT[K]> | undefined> | ModelFieldValue<FieldsT[K]> | undefined;
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
} ? IsAny<T> extends true ? unknown : T : never;
/**
 * The values of a model by field name (dot notation), as setFieldValue and getFieldValue see them
 */
export type ModelFieldValues<M extends ModelLike> = string extends keyof M["fields"] ? Record<string, unknown> : {
    [K in ModelFieldNames<M>]: ModelFieldValue<M["fields"][K]>;
};
type DotHead<K extends string> = K extends `${infer H}.${string}` ? H : K;
/**
 * A parent field's value merged with its child fields' object
 * @remarks a parent that may be null (or undefined) stays so: deserializing assigns it over the
 * child fields when it comes after them in the model
 */
type MergeParent<P, C> = unknown extends C ? P : (NonNullable<P> & C) | Extract<P, null | undefined>;
/**
 * Turns dot notation keys into nested objects, the way Model and Form build records
 */
type DotsToNested<T> = {
    [H in DotHead<keyof T & string>]: MergeParent<H extends keyof T ? T[H] : unknown, [
        Extract<keyof T, `${H}.${string}`>
    ] extends [never] ? unknown : DotsToNested<{
        [P in keyof T & string as P extends `${H}.${infer R}` ? R : never]: T[P];
    }>>;
};
type Flatten<T> = T extends Date | Blob | readonly unknown[] ? T : T extends object ? {
    [K in keyof T]: Flatten<T[K]>;
} : T;
type DeepPartial<T> = T extends Date | Blob | readonly unknown[] ? T : T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T;
/**
 * A record of a model: the deserialized data and the form values, fields in dot notation nested
 * @remarks a parent field (`a`) and its child fields (`a.b`) are merged into one object
 */
export type ModelRecord<M extends ModelLike> = string extends keyof M["fields"] ? Record<string, unknown> : Flatten<DotsToNested<ModelFieldValues<M>>>;
/**
 * Some fields of a record of a model, as saving takes them: fields left out are not sent, and
 * an id of null (or none) creates a new record
 */
export type ModelRecordPartial<M extends ModelLike> = Omit<DeepPartial<ModelRecord<M>>, "id"> & {
    id?: string | null;
};
/**
 * The custom data of a model's fields, a union over all fields
 */
export type ModelCustomData<M extends ModelLike> = M["fields"][keyof M["fields"]]["customData"];
/**
 * Any model whose fields all carry custom data of type CustomT
 */
export type ModelWithCustomData<CustomT> = Model<Record<ModelFieldName, ModelFieldDefinition<any, any, PageVisibility, CustomT>>>;
/**
 * The related records of a record, by field name (records of the related models)
 */
export type ModelGetResponseRelations<M extends ModelLike> = Partial<Record<ModelFieldNames<M>, Record<ModelFieldName, unknown>[]>>;
/**
 * Response for GET single data entry
 * @remarks Connectors return it for ModelUnknown: their data is not deserialized yet
 */
export type ModelGetResponse<M extends ModelLike> = [
    ModelRecord<M>,
    ModelGetResponseRelations<M>,
    unknown?
];
/**
 * Response for an index request
 * @remarks The records only hold the fields visible in the overview
 */
export type ModelIndexResponse<M extends ModelLike> = [
    records: ModelRecord<M>[],
    meta: ResponseMeta,
    userMeta?: unknown
];
export type ModelFetchAllParams = Partial<Omit<IDataGridLoadDataParameters, "rows" | "page">>;
/**
 * Deletion request. If invert is false only delete ids array. If invert is true delete everything except the given ids
 * @param invert Invert the selection
 * @param ids The selection
 */
export type AdvancedDeleteRequest = [
    invert: boolean,
    ids: string[],
    filter?: DataGridFilterParameters
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
export declare const useModelGet: <M extends ModelUnknown>(model: M, id: string | null, options?: Omit<UseQueryOptions<ModelGetResponse<M>, Error, ModelGetResponse<M>>, "queryKey" | "queryFn"> & ModelGetOptions) => UseQueryResult<ModelGetResponse<M>, Error>;
/**
 * React-Query's useQuery for the given model and index params
 * @param model The model ID to load
 * @param params The params to pass to fetchAll/index
 * @param options The useQuery options
 * @returns ModelIndexResponse where userMeta and meta is taken from the last call
 * @see Model.fetchAll
 */
export declare const useModelFetchAll: <M extends ModelUnknown>(model: M, params?: ModelFetchAllParams, options?: Omit<UseQueryOptions<ModelIndexResponse<M>, Error, ModelIndexResponse<M>>, "queryFn" | "queryKey">) => UseQueryResult<ModelIndexResponse<M>, Error>;
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
export declare const useModelIndex: <M extends ModelUnknown>(model: M, params?: Partial<IDataGridLoadDataParameters>, options?: Omit<UseQueryOptions<ModelIndexResponse<M>, Error, ModelIndexResponse<M>>, "queryFn" | "queryKey">) => UseQueryResult<ModelIndexResponse<M>, Error>;
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
export declare const useModelIndex2: <M extends ModelUnknown>(model: M, params: ConnectorIndex2Params, options?: Omit<UseQueryOptions<ModelIndexResponse<M>, Error, ModelIndexResponse<M>>, "queryFn" | "queryKey">) => UseQueryResult<ModelIndexResponse<M>, Error>;
/**
 * React-Query's useMutation to update/create a new record on backend
 * @param model The model
 * @see model.createOrUpdateRecordRaw
 */
export declare const useModelMutation: <M extends ModelUnknown, TContext = unknown>(model: M) => UseMutationResult<ModelGetResponse<M>, Error, ModelRecordPartial<M>, TContext>;
/**
 * React-Query's useMutation to delete a single record on backend
 * @param model The model
 */
export declare const useModelDelete: <TContext = unknown>(model: ModelUnknown) => UseMutationResult<void, Error, string, TContext>;
/**
 * React-Query's useMutation to delete multiple records by ID on backend
 * @param model The model
 */
export declare const useModelDeleteMultiple: <TContext = unknown>(model: ModelUnknown) => UseMutationResult<void, Error, string[], TContext>;
/**
 * React-Query's useMutation to delete records using advanced filters on backend
 * @param model The model
 * @see model.deleteAdvancedRaw
 */
export declare const useModelDeleteAdvanced: <TContext = unknown>(model: ModelUnknown) => UseMutationResult<void, Error, AdvancedDeleteRequest, TContext>;
/**
 * Mutation event handler
 * @param data The response data
 */
export type ModelEventMutation<M extends ModelLike> = (data: ModelGetResponse<M>) => void;
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
declare class Model<FieldsT extends ModelFields = ModelFields, KeyT extends ModelFieldName = keyof FieldsT & string> {
    /**
     * A unique model identifier, used for caching
     */
    readonly modelId: string;
    /**
     * The actual model definition
     */
    readonly fields: FieldsT;
    /**
     * The backend connector providing a CRUD interface for the model
     */
    connector: Connector;
    /**
     * Optional additional cache keys
     */
    readonly cacheKeys?: unknown;
    /**
     * Optional additional cache keys for index/fetchAll action
     */
    readonly cacheKeysIndex?: unknown;
    /**
     * Caching options
     */
    cacheOptions?: CacheOptions;
    /**
     * Hooks
     */
    readonly hooks: ModelHooks;
    /**
     * @see ModelOptions.enableRequestBatching
     */
    readonly requestBatchingEnabled: boolean;
    /**
     * The options passed in the constructor
     * @readonly
     */
    readonly options?: Readonly<ModelOptions>;
    /**
     * Global toggle to trigger auto validation of UX when constructor is called
     */
    static autoValidateUX: boolean;
    /**
     * Throw errors when UX auto validation fails, only used when autoValidateUX is true
     */
    static autoValidateUXThrow: boolean;
    /**
     * Print developer warnings?
     */
    static printDevWarnings: boolean;
    /**
     * The fields, by any field name
     */
    private get fieldsByName();
    /**
     * This model, as connectors and the event handlers of every model take it
     */
    private get asModelUnknown();
    /**
     * Types deserialized data as records of this model: applySerialization and getDefaultValues
     * build them from the field definitions
     */
    private asRecords;
    /**
     * @see asRecords
     */
    private asRecord;
    /**
     * Creates a new model
     * @param name A unique name for the model (modelId)
     * @param model The actual model definition
     * @param connector A backend connector
     * @param cacheKeys The cache keys
     * @param options Model options
     */
    constructor(name: string, model: FieldsT & Record<KeyT, ModelFieldDefinition<any, NoInfer<KeyT>, PageVisibility, unknown>> & ModelFieldsNoExtraKeys<NoInfer<FieldsT>> & ModelFieldsDefaultsMatchType<NoInfer<FieldsT>>, connector: Connector, cacheKeys?: unknown, options?: ModelOptions);
    /**
     * Loads a list of data entries by the given search params
     * @param params The search params, the connector gets a copy of them
     */
    index(params: Partial<IDataGridLoadDataParameters> | undefined): Promise<ModelIndexResponse<this>>;
    /**
     * Loads a list of data entries by the given search params. Works with offsets rather than pages
     * @param params The search params, the connector gets a copy of them
     * @see index
     */
    index2(params: ConnectorIndex2Params): Promise<ModelIndexResponse<this>>;
    /**
     * Cache index records for batched requests
     * @param records The records to cache (from index response)
     * @returns records Same as input
     * @private
     */
    private cacheIndexRecords;
    /**
     * Fetches all records using index calls
     * @param params The params to pass to index
     * @returns ModelIndexResponse where userMeta and meta is taken from the last call
     */
    fetchAll(params?: ModelFetchAllParams): Promise<ModelIndexResponse<this>>;
    /**
     * Fetches all records using index calls and caches the result
     * @param params The params to pass to index
     * @returns ModelIndexResponse where userMeta and meta is taken from the last call
     * @see fetchAll
     */
    fetchAllCached(params?: ModelFetchAllParams): Promise<ModelIndexResponse<this>>;
    /**
     * Gets the react-query cache key for this model
     * @param id The record id
     * @param batch Is request batched (uses index action)?
     */
    getReactQueryKey(id: string | null, batch: boolean): QueryKey;
    /**
     * Gets the react-query cache key for this model (for fetch all)
     * @param params The fetch all params
     */
    getReactQueryKeyFetchAll(params?: ModelFetchAllParams): QueryKey;
    /**
     * Gets the react-query cache key for this model (for one index page)
     * @param params The index params
     * @see useModelIndex
     */
    getReactQueryKeyIndex(params?: Partial<IDataGridLoadDataParameters>): QueryKey;
    /**
     * Gets the react-query cache key for this model (for an index2 range)
     * @param params The index2 params
     * @see useModelIndex2
     */
    getReactQueryKeyIndex2(params: ConnectorIndex2Params): QueryKey;
    /**
     * Invalidates the cached data for record ID
     * @param id The record ID
     */
    invalidateCacheForId(id: string): void;
    /**
     * Invalidates all of this model's queries (records, batched or not, fetch all, index pages and
     * index2 ranges): any params and cacheKeysIndex, this model's cacheKeys
     * @see invalidateCacheForId
     */
    invalidateQueries(): Promise<void>;
    /**
     * Invalidates every page of this model's index (useModelIndex): any params and cacheKeysIndex,
     * this model's cacheKeys
     * @see getReactQueryKeyIndex
     */
    invalidateIndexQueries(): Promise<void>;
    /**
     * Invalidates every range of this model's index2 (useModelIndex2): any params and
     * cacheKeysIndex, this model's cacheKeys
     * @see getReactQueryKeyIndex2
     */
    invalidateIndex2Queries(): Promise<void>;
    /**
     * Invalidates this model's queries under the key prefix which have this model's cacheKeys
     * @param prefix The query key prefix, starting with the modelId
     */
    private invalidateQueriesUnder;
    /**
     * Gets the cacheKeys out of a query key of a model
     * @param queryKey The query key, as getReactQueryKey* build them
     */
    private static getCacheKeysOf;
    /**
     * Provides a react-query useQuery hook for the given data id
     * @param id The data record id
     * @deprecated Use useModelGet(model, id) instead
     */
    get(id: string | null): UseQueryResult<ModelGetResponse<this>, Error>;
    /**
     * Provides cached access for the given data id
     * @param id The data record id or null to obtain the default values
     * @param options Request options
     */
    getCached(id: string | null, options?: ModelGetOptions): Promise<ModelGetResponse<this>>;
    /**
     * Provides uncached access for the given data id
     * @param id The data record id or null to obtain the default values
     * @param options Request options
     */
    getRaw(id: string | null, options?: ModelGetOptions): Promise<ModelGetResponse<this>>;
    /**
     * Deserializes the given ModelGetResponse
     * @param rawData The data to deserialize
     * @private
     */
    private deserializeResponse;
    /**
     * Provides a react-query useMutation hook for creation or updates to an data entry
     * @deprecated Use useModelMutation(model) instead
     */
    createOrUpdate<TContext = unknown>(): UseMutationResult<ModelGetResponse<this>, Error, ModelRecordPartial<this>, TContext>;
    /**
     * Updates a single record on backend (doesn't update local cache)
     * @param values The new values (set id field to update)
     */
    createOrUpdateRecordRaw(values: ModelRecordPartial<this>): Promise<ModelGetResponse<this>>;
    /**
     * Provides a react hook to delete a given record id
     * @deprecated Use useModelDelete(model)
     */
    delete<TContext = unknown>(): UseMutationResult<void, Error, string, TContext>;
    /**
     * Delete a single record in backend (does not affect local cache)
     * @param id The ID to delete
     */
    deleteRaw(id: string): Promise<void>;
    /**
     * Provides a react hook to delete multiple records at once
     * @deprecated Use useModelDeleteMultiple(model)
     */
    deleteMultiple<TContext = unknown>(): UseMutationResult<void, Error, string[], TContext>;
    /**
     * Deletes multiple record at once (does not affect local cache)
     * @param ids The IDs to delete
     */
    deleteMultipleRaw(ids: string[]): Promise<void>;
    /**
     * Does the connector support delete all functionality?
     */
    doesSupportAdvancedDeletion(): boolean;
    /**
     * Provides a react hook to mass delete data
     * @deprecated Use useModelDeleteAdvanced(model)
     */
    deleteAdvanced<TContext = unknown>(): UseMutationResult<void, Error, AdvancedDeleteRequest, TContext>;
    /**
     * Raw request to mass-delete data (does not affect local cache)
     * @param req The deletion request
     */
    deleteAdvancedRaw(req: AdvancedDeleteRequest): Promise<void>;
    /**
     * Updates stored data (not relations)
     * @param id The id of the record to edit
     * @param batch Data from index response?
     * @param updater The function which updates the data
     */
    updateStoredData(id: string, batch: boolean, updater: (old: ModelRecord<this>) => ModelRecord<this>): void;
    /**
     * Returns a data grid compatible column definition
     */
    toDataGridColumnDefinition(includeHidden?: boolean): IDataGridColumnDef[];
    /**
     * Validates the given values against the field defined validation rules
     * @param values The values to validate
     * @param view Optional view filter (only applies validations on fields present in given view)
     * @param fieldsToValidate List of fields to validate
     * @param type The validation type (normal = validate, hint = validateHint]
     */
    validate(values: Record<string, unknown>, view?: "edit" | "create", fieldsToValidate?: KeyT[], type?: "normal" | "hint"): Promise<Record<string, string>>;
    /**
     * Gets an empty/default model data entry
     */
    protected getDefaultValues(): Promise<Record<string, unknown>>;
    /**
     * Serializes the given values into a JSON string
     * @param values The values to serialize
     * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
     * @remarks A file (Blob) is written as data URI, as JSON cannot carry it
     */
    serialize(values: Record<string, unknown>, visibility: keyof PageVisibility): Promise<string>;
    /**
     * Deserializes the given JSON data back into a data record
     * @param data The JSON string
     * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
     */
    deserialize(data: string, visibility: keyof PageVisibility): Promise<Record<string, unknown>>;
    /**
     * Applies the given serialization function to the data
     * @param values The data
     * @param func The function to apply
     * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
     * @returns A copy of the data
     */
    applySerialization(values: Record<string, unknown>, func: "serialize" | "deserialize", visibility: keyof PageVisibility): Promise<Record<string, unknown>>;
    /**
     * Find UX issues (dev util)
     * @param throwErr If true throws an error, otherwise logs it to console as warning
     * @remarks To enable this automatically set `Model.autoValidateUX = true; Model.autoValidateUXThrow = false/true;`
     */
    validateUX(throwErr?: boolean): void;
    /**
     * dev util to check if requests can be batched
     * @param printWarnings output warnings, default false
     */
    canRequestsBeBatched(printWarnings?: boolean): boolean;
    /**
     * static event handler registry
     * @private
     */
    private static eventHandlers;
    /**
     * Adds an event handler
     * @param evt The event to listen to
     * @param handler The handler
     * @param idFilter optional: id filter, undefined for any, null for newly created
     * @remarks Remove handler with removeEventHandler when done
     * @see removeEventHandler
     */
    addEventHandler(evt: "mutate", handler: ModelEventMutation<this>, idFilter?: string | null): void;
    /**
     * Removes an event handler
     * @param evt The event to unsubscribe from
     * @param handler The handler that was passed to addEventHandler (exact reference!)
     * @param idFilter optional: id filter, undefined for any, null for newly created. needs to be the same as in addEventHandler
     * @remarks Removes handler added by addEventHandler
     * @see addEventHandler
     */
    removeEventHandler(evt: "mutate", handler: ModelEventMutation<this>, idFilter?: string | null): void;
    /**
     * Trigger the mutation event and call event listeners
     * @param isCreate Is the record just created
     * @param data The response data
     * @remarks used internally, usually not called by library using code
     */
    triggerMutationEvent(isCreate: boolean, data: ModelGetResponse<this>): void;
}
export default Model;

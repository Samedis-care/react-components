import Type from "./Type";
import Visibility, { VisibilityCallback } from "./Visibility";
import Connector, { ConnectorIndex2Params, ResponseMeta } from "../Connector/Connector";
import { IDataGridColumnDef, IDataGridLoadDataParameters } from "../../standalone/DataGrid/DataGrid";
import { UseMutationResult, UseQueryOptions, UseQueryResult } from "react-query/types/react/types";
import { QueryKey } from "react-query/types/core/types";
export interface PageVisibility {
    overview: Visibility;
    edit: VisibilityCallback;
    create: VisibilityCallback;
}
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
    validate?: (value: TypeT, values: Record<string, unknown>, field: ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>) => Promise<string | null> | string | null;
    /**
     * Callback to validate field to provide optional hints
     */
    validateHint?: ModelFieldDefinition<TypeT, KeyT, VisibilityT, CustomT>["validate"];
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
    onChange?: (value: TypeT, model: Model<KeyT, VisibilityT, CustomT>, setFieldValue: (field: KeyT, value: unknown, shouldValidate?: boolean, triggerOnChange?: boolean) => void, getFieldValue: (field: KeyT) => unknown) => TypeT;
    /**
     * The referenced model for backend connected data types.
     * If TypeScript complains cast the return value to `Model<ModelFieldName, PageVisibility, unknown>`
     * @param id The current record ID
     * @param values Subset of the current record (select relevant data with getRelationModelValues)
     */
    getRelationModel?: (id: string | null, values: Record<string, unknown>) => Model<ModelFieldName, PageVisibility, unknown>;
    getRelationModelValues?: string[];
}
export declare type ModelField<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> = Record<KeyT, ModelFieldDefinition<any, KeyT, VisibilityT, CustomT>>;
export declare type ModelFieldName = "id" | string;
export declare type ModelGetResponseRelations<KeyT extends ModelFieldName> = Partial<Record<KeyT, Record<ModelFieldName, unknown>[]>>;
export declare type ModelData<KeyT extends ModelFieldName> = Record<string, unknown>;
/**
 * Response for GET single data entry
 */
export declare type ModelGetResponse<KeyT extends ModelFieldName> = [
    ModelData<KeyT>,
    ModelGetResponseRelations<KeyT>,
    unknown?
];
export declare type ModelIndexResponse = [
    records: Record<string, unknown>[],
    meta: ResponseMeta,
    userMeta?: unknown
];
export declare type ModelFetchAllParams = Partial<Omit<IDataGridLoadDataParameters, "rows" | "page">>;
/**
 * Deletion request. If invert is false only delete ids array. If invert is true delete everything except the given ids
 * @param invert Invert the selection
 * @param ids The selection
 */
export declare type AdvancedDeleteRequest = [
    invert: boolean,
    ids: string[],
    filter?: Pick<IDataGridLoadDataParameters, "quickFilter" | "additionalFilters" | "fieldFilter">
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
 * @param options Extra options to pass to useQuery (defaults are provided for retry, staleTime and cacheTime (last two only if configured in model))
 */
export declare const useModelGet: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(model: Model<KeyT, VisibilityT, CustomT>, id: string | null, options?: UseQueryOptions<ModelGetResponse<KeyT>, Error, ModelGetResponse<KeyT>> | undefined) => UseQueryResult<ModelGetResponse<KeyT>, Error>;
/**
 * React-Query's useQuery for the given model and index params
 * @param model The model ID to load
 * @param params The params to pass to fetchAll/index
 * @returns ModelIndexResponse where userMeta and meta is taken from the last call
 * @see Model.fetchAll
 */
export declare const useModelFetchAll: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(model: Model<KeyT, VisibilityT, CustomT>, params?: Partial<Omit<IDataGridLoadDataParameters, "rows" | "page">> | undefined) => UseQueryResult<ModelIndexResponse, Error>;
/**
 * React-Query's useMutation to update/create a new record on backend
 * @param model The model
 * @see model.createOrUpdateRecordRaw
 */
export declare const useModelMutation: <KeyT extends string, VisibilityT extends PageVisibility, CustomT, TContext = unknown>(model: Model<KeyT, VisibilityT, CustomT>) => UseMutationResult<ModelGetResponse<KeyT>, Error, Record<string, unknown>, TContext>;
/**
 * React-Query's useMutation to delete a single record on backend
 * @param model The model
 */
export declare const useModelDelete: <KeyT extends string, VisibilityT extends PageVisibility, CustomT, TContext = unknown>(model: Model<KeyT, VisibilityT, CustomT>) => UseMutationResult<void, Error, string, TContext>;
/**
 * React-Query's useMutation to delete multiple records by ID on backend
 * @param model The model
 */
export declare const useModelDeleteMultiple: <KeyT extends string, VisibilityT extends PageVisibility, CustomT, TContext = unknown>(model: Model<KeyT, VisibilityT, CustomT>) => UseMutationResult<void, Error, string[], TContext>;
/**
 * React-Query's useMutation to delete records using advanced filters on backend
 * @param model The model
 * @see model.deleteAdvancedRaw
 */
export declare const useModelDeleteAdvanced: <KeyT extends string, VisibilityT extends PageVisibility, CustomT, TContext = unknown>(model: Model<KeyT, VisibilityT, CustomT>) => UseMutationResult<void, Error, AdvancedDeleteRequest, TContext>;
export interface ModelHooks<KeyT extends ModelFieldName> {
    /**
     * Hook fired on useModelMutation success
     * @param data The updated record
     */
    onCreateOrUpdate?: (data: ModelGetResponse<KeyT>) => void;
}
declare class Model<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> {
    /**
     * A unique model identifier, used for caching
     */
    readonly modelId: string;
    /**
     * The actual model definition
     */
    readonly fields: ModelField<KeyT, VisibilityT, CustomT>;
    /**
     * The backend connector providing a CRUD interface for the model
     */
    connector: Connector<KeyT, VisibilityT, CustomT>;
    /**
     * Optional additional cache keys
     */
    readonly cacheKeys?: unknown;
    /**
     * Caching options
     */
    cacheOptions?: CacheOptions;
    /**
     * Hooks
     */
    readonly hooks: ModelHooks<KeyT>;
    /**
     * Global toggle to trigger auto validation of UX when constructor is called
     */
    static autoValidateUX: boolean;
    /**
     * Throw errors when UX auto validation fails, only used when autoValidateUX is true
     */
    static autoValidateUXThrow: boolean;
    /**
     * Creates a new model
     * @param name A unique name for the model (modelId)
     * @param model The actual model definition
     * @param connector A backend connector
     * @param cacheKeys Optional cache keys
     * @param cacheOptions Optional cache options
     * @param hooks Optional: Model hooks
     */
    constructor(name: string, model: ModelField<KeyT, VisibilityT, CustomT>, connector: Connector<KeyT, VisibilityT, CustomT>, cacheKeys?: unknown, cacheOptions?: CacheOptions, hooks?: ModelHooks<KeyT>);
    /**
     * Loads a list of data entries by the given search params
     * @param params The search params
     */
    index(params: Partial<IDataGridLoadDataParameters> | undefined): Promise<ModelIndexResponse>;
    /**
     * Loads a list of data entries by the given search params. Works with offsets rather than pages
     * @param params The search params
     */
    index2(params: ConnectorIndex2Params): Promise<ModelIndexResponse>;
    /**
     * Fetches all records using index calls
     * @param params The params to pass to index
     * @returns ModelIndexResponse where userMeta and meta is taken from the last call
     */
    fetchAll(params?: ModelFetchAllParams): Promise<ModelIndexResponse>;
    /**
     * Fetches all records using index calls and caches the result
     * @param params The params to pass to index
     * @returns ModelIndexResponse where userMeta and meta is taken from the last call
     * @see fetchAll
     */
    fetchAllCached(params?: ModelFetchAllParams): Promise<ModelIndexResponse>;
    /**
     * Gets the react-query cache key for this model
     * @param id The record id
     */
    getReactQueryKey(id: string | null): QueryKey;
    /**
     * Gets the react-query cache key for this model (for fetch all)
     * @param params The fetch all params
     */
    getReactQueryKeyFetchAll(params?: ModelFetchAllParams): QueryKey;
    /**
     * Provides a react-query useQuery hook for the given data id
     * @param id The data record id
     * @deprecated Use useModelGet(model, id) instead
     */
    get(id: string | null): UseQueryResult<ModelGetResponse<KeyT>, Error>;
    /**
     * Provides cached access for the given data id
     * @param id The data record id or null to obtain the default values
     */
    getCached(id: string | null): Promise<ModelGetResponse<KeyT>>;
    /**
     * Provides uncached access for the given data id
     * @param id The data record id or null to obtain the default values
     */
    getRaw(id: string | null): Promise<ModelGetResponse<KeyT>>;
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
    createOrUpdate<TContext = unknown>(): UseMutationResult<ModelGetResponse<KeyT>, Error, Record<string, unknown>, TContext>;
    /**
     * Updates a single record on backend (doesn't update local cache)
     * @param values The new values (set id field to update)
     */
    createOrUpdateRecordRaw(values: Record<string, unknown>): Promise<ModelGetResponse<KeyT>>;
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
     * @param updater The function which updates the data
     */
    updateStoredData(id: string, updater: (old: Record<string, unknown>) => Record<string, unknown>): void;
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
}
export default Model;

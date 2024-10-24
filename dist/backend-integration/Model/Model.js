import { getVisibility } from "./Visibility";
import { useMutation, useQuery, } from "@tanstack/react-query";
import ModelDataStore from "../Store";
import { dotToObject, getValueByDot } from "../../utils/dotUtils";
import deepAssign from "../../utils/deepAssign";
import throwError from "../../utils/throwError";
import RequestBatching from "./RequestBatching";
// optional import
let captureException = null;
import("@sentry/react")
    .then((Sentry) => (captureException = Sentry.captureException))
    .catch(() => { }); // ignore
/**
 * React-Query's useQuery for the given model and record ID
 * @param model The model ID to load
 * @param id The record ID (or null to get default values on create)
 * @param options Extra options to pass to useQuery (defaults are provided for retry, staleTime and cacheTime (last two only if configured in model))
 */
export const useModelGet = (model, id, options) => {
    return useQuery({
        queryKey: model.getReactQueryKey(id, options?.batch ?? model.requestBatchingEnabled),
        queryFn: () => model.getRaw(id, options),
        // 3 retries if we get network error
        retry: (count, err) => err.name === "NetworkError" && count < 3,
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
export const useModelFetchAll = (model, params, options) => {
    return useQuery({
        queryKey: model.getReactQueryKeyFetchAll(params),
        queryFn: () => model.fetchAll(params),
        // 3 retries if we get network error
        retry: (count, err) => err.name === "NetworkError" && count < 3,
        ...model.cacheOptions,
        ...options,
    });
};
/**
 * React-Query's useMutation to update/create a new record on backend
 * @param model The model
 * @see model.createOrUpdateRecordRaw
 */
export const useModelMutation = (model) => {
    return useMutation({
        mutationKey: [model.modelId, "create-or-update"],
        mutationFn: model.createOrUpdateRecordRaw.bind(model),
        onSuccess: (responseData, inputData) => {
            const inputId = inputData.id;
            const id = responseData[0].id;
            if (!id) {
                throw new Error("Can't update null ID");
            }
            if (model.hooks.onCreateOrUpdate) {
                model.hooks.onCreateOrUpdate(responseData);
            }
            const updateForId = (id) => {
                ModelDataStore.setQueryData(model.getReactQueryKey(id, false), responseData);
                if (model.requestBatchingEnabled) {
                    ModelDataStore.setQueryData(model.getReactQueryKey(id, true), responseData);
                }
                else {
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
                else {
                    model.invalidateCacheForId(inputId);
                }
            }
            model.triggerMutationEvent(!inputData.id, responseData);
        },
    });
};
/**
 * React-Query's useMutation to delete a single record on backend
 * @param model The model
 */
export const useModelDelete = (model) => {
    return useMutation({
        mutationKey: [model.modelId, "delete"],
        mutationFn: model.deleteRaw.bind(model),
        onSuccess: (data, id) => model.invalidateCacheForId(id),
    });
};
/**
 * React-Query's useMutation to delete multiple records by ID on backend
 * @param model The model
 */
export const useModelDeleteMultiple = (model) => {
    return useMutation({
        mutationKey: [model.modelId, "delete-multi"],
        mutationFn: model.deleteMultipleRaw.bind(model),
        onSuccess: (data, ids) => {
            ids.forEach((id) => model.invalidateCacheForId(id));
        },
    });
};
/**
 * React-Query's useMutation to delete records using advanced filters on backend
 * @param model The model
 * @see model.deleteAdvancedRaw
 */
export const useModelDeleteAdvanced = (model) => {
    return useMutation({
        mutationKey: [model.modelId, "delete-adv"],
        mutationFn: model.deleteAdvancedRaw.bind(model),
        onSuccess: (data, req) => {
            // this function is likely to flush more than actually deleted
            const [invert, ids] = req;
            if (!invert) {
                ids.forEach((id) => model.invalidateCacheForId(id));
            }
            else {
                // delete everything from this model, unless ID matches
                ModelDataStore.removeQueries({
                    predicate: (query) => {
                        return (query.queryKey[0] === model.modelId &&
                            !ids.includes(query.queryKey[1].id));
                    },
                });
            }
        },
    });
};
class Model {
    /**
     * A unique model identifier, used for caching
     */
    modelId;
    /**
     * The actual model definition
     */
    fields;
    /**
     * The backend connector providing a CRUD interface for the model
     */
    connector;
    /**
     * Optional additional cache keys
     */
    cacheKeys;
    /**
     * Optional additional cache keys for index/fetchAll action
     */
    cacheKeysIndex;
    /**
     * Caching options
     */
    cacheOptions;
    /**
     * Hooks
     */
    hooks;
    /**
     * @see ModelOptions.enableRequestBatching
     */
    requestBatchingEnabled;
    /**
     * The options passed in the constructor
     * @readonly
     */
    options;
    /**
     * Global toggle to trigger auto validation of UX when constructor is called
     */
    static autoValidateUX = false;
    /**
     * Throw errors when UX auto validation fails, only used when autoValidateUX is true
     */
    static autoValidateUXThrow = false;
    /**
     * Print developer warnings?
     */
    static printDevWarnings = process.env.NODE_ENV === "development";
    /**
     * Creates a new model
     * @param name A unique name for the model (modelId)
     * @param model The actual model definition
     * @param connector A backend connector
     * @param cacheKeys The cache keys
     * @param options Model options
     */
    constructor(name, model, connector, cacheKeys, options) {
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
        if (Model.autoValidateUX)
            this.validateUX(Model.autoValidateUXThrow);
        if (this.requestBatchingEnabled)
            this.canRequestsBeBatched(Model.printDevWarnings);
    }
    /**
     * Loads a list of data entries by the given search params
     * @param params The search params
     */
    async index(params) {
        try {
            const [rawData, meta, userData] = await this.connector.index(params, this);
            return [
                this.cacheIndexRecords(await Promise.all(rawData.map((data) => this.applySerialization(data, "deserialize", "overview")))),
                meta,
                userData,
            ];
        }
        catch (err) {
            if (captureException &&
                err instanceof Error &&
                !["NetworkError", "BackendError"].includes(err.name)) {
                captureException(err);
            }
            throw err;
        }
    }
    /**
     * Loads a list of data entries by the given search params. Works with offsets rather than pages
     * @param params The search params
     */
    async index2(params) {
        const [rawData, meta, userData] = await this.connector.index2(params, this);
        return [
            this.cacheIndexRecords(await Promise.all(rawData.map((data) => this.applySerialization(data, "deserialize", "overview")))),
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
    cacheIndexRecords(records) {
        // cache records for batching
        records.forEach((record) => {
            ModelDataStore.setQueryData(this.getReactQueryKey(record.id, true), [record, {}]);
        });
        return records;
    }
    /**
     * Fetches all records using index calls
     * @param params The params to pass to index
     * @returns ModelIndexResponse where userMeta and meta is taken from the last call
     */
    async fetchAll(params) {
        let page = 1;
        let perPage = 1000;
        let perPageDefault = true;
        let meta;
        let userMeta;
        const records = [];
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
            if (records.length >= totalRows || tRecords.length === 0)
                break;
        }
        return [records, meta, userMeta];
    }
    /**
     * Fetches all records using index calls and caches the result
     * @param params The params to pass to index
     * @returns ModelIndexResponse where userMeta and meta is taken from the last call
     * @see fetchAll
     */
    async fetchAllCached(params) {
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
    getReactQueryKey(id, batch) {
        return [this.modelId, { id: id }, batch, this.cacheKeys];
    }
    /**
     * Gets the react-query cache key for this model (for fetch all)
     * @param params The fetch all params
     */
    getReactQueryKeyFetchAll(params) {
        return [this.modelId, params, this.cacheKeys, this.cacheKeysIndex];
    }
    /**
     * Invalidates the cached data for record ID
     * @param id The record ID
     */
    invalidateCacheForId(id) {
        void ModelDataStore.invalidateQueries({
            queryKey: this.getReactQueryKey(id, false),
        });
        void ModelDataStore.invalidateQueries({
            queryKey: this.getReactQueryKey(id, true),
        });
    }
    /**
     * Provides a react-query useQuery hook for the given data id
     * @param id The data record id
     * @deprecated Use useModelGet(model, id) instead
     */
    get(id) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelGet(this, id);
    }
    /**
     * Provides cached access for the given data id
     * @param id The data record id or null to obtain the default values
     * @param options Request options
     */
    getCached(id, options) {
        return ModelDataStore.fetchQuery({
            queryKey: this.getReactQueryKey(id, options?.batch ?? this.requestBatchingEnabled),
            queryFn: () => this.getRaw(id, options),
            ...this.cacheOptions,
        });
    }
    /**
     * Provides uncached access for the given data id
     * @param id The data record id or null to obtain the default values
     * @param options Request options
     */
    async getRaw(id, options) {
        try {
            if (!id)
                return [await this.getDefaultValues(), {}];
            const batch = options?.batch ?? this.requestBatchingEnabled;
            if (batch) {
                const rawData = await RequestBatching.get(id, this);
                return [rawData, {}];
            }
            else {
                const rawData = await this.connector.read(id, this);
                return this.deserializeResponse(rawData);
            }
        }
        catch (err) {
            if (captureException &&
                err instanceof Error &&
                !["NetworkError", "BackendError"].includes(err.name) &&
                !(options?.dontReportNotFoundInBatch &&
                    err.name === "RequestBatchingError")) {
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
    async deserializeResponse(rawData) {
        const deserialized = await this.applySerialization(rawData[0], "deserialize", "edit");
        return [
            deserialized,
            Object.fromEntries(await Promise.all(Object.entries(rawData[1]).map(async (keyValue) => {
                const fieldName = keyValue[0];
                const values = keyValue[1];
                const refModel = this.fields[fieldName]?.getRelationModel;
                if (!refModel) {
                    // eslint-disable-next-line no-console
                    console.warn("[Components-Care] [Model] Backend connector supplied related data, but no model is defined for this relationship (relationship name = " +
                        fieldName +
                        "). Data will be ignored.");
                }
                return [
                    fieldName,
                    refModel
                        ? await Promise.all(values.map((value) => refModel(deserialized.id, deserialized).applySerialization(value, "deserialize", "edit")))
                        : null,
                ];
            }))),
        ];
    }
    /**
     * Provides a react-query useMutation hook for creation or updates to an data entry
     * @deprecated Use useModelMutation(model) instead
     */
    createOrUpdate() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelMutation(this);
    }
    /**
     * Updates a single record on backend (doesn't update local cache)
     * @param values The new values (set id field to update)
     */
    async createOrUpdateRecordRaw(values) {
        const update = !!("id" in values && values.id);
        const serializedValues = await this.applySerialization(values, "serialize", update ? "edit" : "create");
        if (update) {
            return this.deserializeResponse(await this.connector.update(serializedValues, this));
        }
        else {
            delete serializedValues["id"];
            return this.deserializeResponse(await this.connector.create(serializedValues, this));
        }
    }
    /**
     * Provides a react hook to delete a given record id
     * @deprecated Use useModelDelete(model)
     */
    delete() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelDelete(this);
    }
    /**
     * Delete a single record in backend (does not affect local cache)
     * @param id The ID to delete
     */
    async deleteRaw(id) {
        return this.connector.delete(id, this);
    }
    /**
     * Provides a react hook to delete multiple records at once
     * @deprecated Use useModelDeleteMultiple(model)
     */
    deleteMultiple() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelDeleteMultiple(this);
    }
    /**
     * Deletes multiple record at once (does not affect local cache)
     * @param ids The IDs to delete
     */
    async deleteMultipleRaw(ids) {
        return this.connector.deleteMultiple(ids, this);
    }
    /**
     * Does the connector support delete all functionality?
     */
    doesSupportAdvancedDeletion() {
        return !!this.connector.deleteAdvanced;
    }
    /**
     * Provides a react hook to mass delete data
     * @deprecated Use useModelDeleteAdvanced(model)
     */
    deleteAdvanced() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelDeleteAdvanced(this);
    }
    /**
     * Raw request to mass-delete data (does not affect local cache)
     * @param req The deletion request
     */
    async deleteAdvancedRaw(req) {
        if (!this.connector.deleteAdvanced) {
            throw new Error("Connector doesn't support advanced deletion");
        }
        return this.connector.deleteAdvanced(req, this);
    }
    /**
     * Updates stored data (not relations)
     * @param id The id of the record to edit
     * @param batch Data from index response?
     * @param updater The function which updates the data
     */
    updateStoredData(id, batch, updater) {
        ModelDataStore.setQueryData(this.getReactQueryKey(id, batch), (data) => {
            if (!data)
                throw new Error("Data not set");
            const [record, ...other] = data;
            return [updater(record), ...other];
        });
    }
    /**
     * Returns a data grid compatible column definition
     */
    toDataGridColumnDefinition(includeHidden = false) {
        return (!includeHidden
            ? Object.entries(this.fields).filter((entry) => !entry[1].visibility.overview.disabled)
            : Object.entries(this.fields)).map((entry) => {
            const key = entry[0];
            const value = entry[1];
            let filterData = undefined;
            if (value.type.getFilterType() === "enum") {
                if (!value.type.getEnumValues)
                    throw new Error("Model Type Filter Type is enum, but getEnumValues not set");
                filterData = value.type
                    .getEnumValues()
                    .filter((value) => !(value.invisibleInGridFilter ?? value.invisible))
                    .map((value) => ({
                    getLabelText: value.getLabel,
                    value: value.value,
                    disabled: value.disabled,
                    isDivider: value.isDivider,
                }));
            }
            else if (value.type.getFilterType() === "boolean") {
                filterData = [true, false].map((boolVal) => ({
                    getLabelText: value.type.stringify.bind(value.type, boolVal),
                    value: boolVal ? "true" : "false",
                }));
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
                width: (typeof value.columnWidth === "function"
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
    async validate(values, view, fieldsToValidate, type = "normal") {
        const errors = {};
        const validationFunction = type === "normal" ? "validate" : "validateHint";
        await Promise.all(Object.keys(this.fields).map(async (field) => {
            // skip validations for fields which aren't defined in the model or which are disabled in the current view or aren't currently mounted
            const value = getValueByDot(field, values);
            if (value === undefined)
                return;
            try {
                const fieldDef = this.fields[field];
                if (view &&
                    getVisibility(fieldDef.visibility[view], values, values).disabled)
                    return;
                if (fieldsToValidate && !fieldsToValidate.includes(field))
                    return;
                // first apply type validation
                let error;
                try {
                    const validate = fieldDef.type[validationFunction]?.bind(fieldDef.type);
                    error = validate
                        ? await validate(value, fieldDef)
                        : null;
                }
                catch (e) {
                    // eslint-disable-next-line
                    console.error("[Components-Care] [Model.validate] Error during validation:", e);
                    if (captureException)
                        captureException(e);
                    error = e.message;
                }
                // then apply custom field validation if present
                const fieldValidation = fieldDef[validationFunction]?.bind(fieldDef);
                if (!error && fieldValidation) {
                    try {
                        error = await fieldValidation(value, values, fieldDef);
                    }
                    catch (e) {
                        // eslint-disable-next-line
                        console.error("[Components-Care] [Model.validate] Error during validation:", e);
                        if (captureException)
                            captureException(e);
                        error = e.message;
                    }
                }
                if (error)
                    errors[field] = error;
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("[Components-Care] [Model.validate] Error during field validation:", field, value, e);
                if (captureException)
                    captureException(e);
            }
        }));
        return errors;
    }
    /**
     * Gets an empty/default model data entry
     */
    async getDefaultValues() {
        const data = {};
        const promises = Object.entries(this.fields)
            .filter(([field]) => {
            try {
                return !getVisibility(this.fields[field].visibility.create, {}, {}).disabled;
            }
            catch {
                return true;
            }
        })
            .map(async (entry) => {
            const [field, def] = entry;
            let defaultValue;
            if (def.getDefaultValue)
                defaultValue = await def.getDefaultValue();
            else
                defaultValue = def.type.getDefaultValue();
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
    async serialize(values, visibility) {
        const serializable = await this.applySerialization(values, "serialize", visibility);
        return JSON.stringify(serializable);
    }
    /**
     * Deserializes the given JSON data back into a data record
     * @param data The JSON string
     * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
     */
    async deserialize(data, visibility) {
        const parsed = JSON.parse(data);
        return await this.applySerialization(parsed, "deserialize", visibility);
    }
    /**
     * Applies the given serialization function to the data
     * @param values The data
     * @param func The function to apply
     * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
     * @returns A copy of the data
     */
    async applySerialization(values, func, visibility) {
        const copy = {};
        for (const key in this.fields) {
            if (!Object.prototype.hasOwnProperty.call(this.fields, key))
                continue;
            const field = this.fields[key];
            const value = getValueByDot(key, values);
            if (value === undefined && func === "serialize") {
                continue;
            }
            // don't include disabled fields (except ID and disabled+readonly fields when serializing)
            const visValue = getVisibility(field.visibility[visibility], values, values);
            if (visValue.disabled &&
                (func === "serialize" || !visValue.readOnly) &&
                key !== "id") {
                continue;
            }
            if (Model.printDevWarnings &&
                value === undefined &&
                func === "deserialize") {
                // eslint-disable-next-line no-console
                console.log(`[Components-Care] [Model(id = ${this.modelId}).applySerialization(..., 'deserialize', '${visibility}')] Field ${key} cannot be found in values`, values);
            }
            const serializeFunc = field.type[func];
            let result;
            if (serializeFunc) {
                result = (await serializeFunc(value));
            }
            else {
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
    validateUX(throwErr = false) {
        const report = (msg) => 
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
                    report(`[Components-Care] [Model.validateUX] ${this.modelId}.${field} is visible in Grid but doesn't have label`);
            }
        });
    }
    /**
     * dev util to check if requests can be batched
     * @param printWarnings output warnings, default false
     */
    canRequestsBeBatched(printWarnings = false) {
        const fieldsNotInOverview = Object.entries(this.fields)
            .filter(([field, def]) => {
            if (field === "id")
                return false;
            const fieldDef = def;
            const edit = getVisibility(fieldDef.visibility.edit, {}, {});
            const overview = getVisibility(fieldDef.visibility.overview, {}, {});
            const enabled = (vis) => !vis.disabled || vis.readOnly;
            return enabled(edit) && !enabled(overview);
        })
            .map(([field]) => field);
        if (printWarnings && fieldsNotInOverview.length > 0) {
            // eslint-disable-next-line no-console
            console.log(`[Components-Care] [Model(id = ${this.modelId}).canRequestsBeBatched] Fields enabled in edit, but not in overview:`, fieldsNotInOverview);
        }
        return fieldsNotInOverview.length === 0;
    }
    // EVENT HANDLERS
    /**
     * static event handler registry
     * @private
     */
    static eventHandlers = {
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
    addEventHandler(evt, handler, idFilter) {
        const handlerKey = JSON.stringify(this.getReactQueryKey(idFilter === undefined ? "any" : idFilter, false));
        if (!(handlerKey in Model.eventHandlers[evt])) {
            Model.eventHandlers[evt][handlerKey] = [handler];
        }
        else {
            Model.eventHandlers[evt][handlerKey].push(handler);
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
    removeEventHandler(evt, handler, idFilter) {
        const handlerKey = JSON.stringify(this.getReactQueryKey(idFilter === undefined ? "any" : idFilter, false));
        if (!(handlerKey in Model.eventHandlers[evt])) {
            return;
        }
        const handlers = Model.eventHandlers[evt][handlerKey];
        Model.eventHandlers[evt][handlerKey] = handlers.filter((h) => h !== handler);
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
    triggerMutationEvent(isCreate, data) {
        const handlers = Model.eventHandlers.mutate;
        const id = data[0].id;
        const keys = ["any", id];
        if (isCreate)
            keys.push(null);
        keys.forEach((key) => {
            const handlerKey = JSON.stringify(this.getReactQueryKey(key, false));
            if (handlerKey in handlers) {
                handlers[handlerKey].forEach((handler) => handler(data));
            }
        });
    }
}
export default Model;

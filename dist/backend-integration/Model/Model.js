var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { getVisibility } from "./Visibility";
import { useMutation, useQuery } from "react-query";
import { ModelDataStore } from "../index";
import queryCache from "../Store";
import { deepAssign, dotToObject, getValueByDot } from "../../utils";
import throwError from "../../utils/throwError";
// optional import
var captureException = null;
import("@sentry/react")
    .then(function (Sentry) { return (captureException = Sentry.captureException); })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .catch(function () { }); // ignore
/**
 * React-Query's useQuery for the given model and record ID
 * @param model The model ID to load
 * @param id The record ID (or null to get default values on create)
 */
export var useModelGet = function (model, id) {
    return useQuery(model.getReactQueryKey(id), function () { return model.getRaw(id); }, __assign({ 
        // 3 retries if we get network error
        retry: function (count, err) { return err.name === "NetworkError" && count < 3; } }, model.cacheOptions));
};
/**
 * React-Query's useQuery for the given model and index params
 * @param model The model ID to load
 * @param params The params to pass to fetchAll/index
 * @returns ModelIndexResponse where userMeta and meta is taken from the last call
 * @see Model.fetchAll
 */
export var useModelFetchAll = function (model, params) {
    return useQuery(model.getReactQueryKeyFetchAll(params), function () { return model.fetchAll(params); }, __assign({ 
        // 3 retries if we get network error
        retry: function (count, err) { return err.name === "NetworkError" && count < 3; } }, model.cacheOptions));
};
/**
 * React-Query's useMutation to update/create a new record on backend
 * @param model The model
 * @see model.createOrUpdateRecordRaw
 */
export var useModelMutation = function (model) {
    return useMutation(model.modelId + "-create-or-update", model.createOrUpdateRecordRaw.bind(model), {
        onSuccess: function (data) {
            if (!data[0].id) {
                throw new Error("Can't update null ID");
            }
            if (model.hooks.onCreateOrUpdate) {
                model.hooks.onCreateOrUpdate(data);
            }
            ModelDataStore.setQueryData(model.getReactQueryKey(data[0].id), data);
        },
    });
};
/**
 * React-Query's useMutation to delete a single record on backend
 * @param model The model
 */
export var useModelDelete = function (model) {
    return useMutation(model.modelId + "-delete", model.deleteRaw.bind(model), {
        onSuccess: function (data, id) {
            ModelDataStore.removeQueries(model.getReactQueryKey(id));
        },
    });
};
/**
 * React-Query's useMutation to delete multiple records by ID on backend
 * @param model The model
 */
export var useModelDeleteMultiple = function (model) {
    return useMutation(model.modelId + "-delete-multi", model.deleteMultipleRaw.bind(model), {
        onSuccess: function (data, ids) {
            ids.forEach(function (id) {
                return ModelDataStore.removeQueries(model.getReactQueryKey(id));
            });
        },
    });
};
/**
 * React-Query's useMutation to delete records using advanced filters on backend
 * @param model The model
 * @see model.deleteAdvancedRaw
 */
export var useModelDeleteAdvanced = function (model) {
    return useMutation(model.modelId + "-delete-adv", model.deleteAdvancedRaw.bind(model), {
        onSuccess: function (data, req) {
            // this function is likely to flush more then actually deleted
            var invert = req[0], ids = req[1];
            if (!invert) {
                ids.forEach(function (id) {
                    return ModelDataStore.removeQueries(model.getReactQueryKey(id));
                });
            }
            else {
                // delete everything from this model, unless ID matches
                ModelDataStore.removeQueries(undefined, {
                    predicate: function (query) {
                        return (query.queryKey[0] === model.modelId &&
                            !ids.includes(query.queryKey[1].id));
                    },
                });
            }
        },
    });
};
var Model = /** @class */ (function () {
    /**
     * Creates a new model
     * @param name A unique name for the model (modelId)
     * @param model The actual model definition
     * @param connector A backend connector
     * @param cacheKeys Optional cache keys
     * @param cacheOptions Optional cache options
     * @param hooks Optional: Model hooks
     */
    function Model(name, model, connector, cacheKeys, cacheOptions, hooks) {
        this.modelId = name;
        this.fields = model;
        this.connector = connector;
        this.cacheKeys = cacheKeys;
        this.cacheOptions = cacheOptions !== null && cacheOptions !== void 0 ? cacheOptions : {
            staleTime: 30000,
        };
        this.hooks = hooks !== null && hooks !== void 0 ? hooks : {};
        if (Model.autoValidateUX)
            this.validateUX(Model.autoValidateUXThrow);
    }
    /**
     * Loads a list of data entries by the given search params
     * @param params The search params
     */
    Model.prototype.index = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rawData, meta, userData;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.connector.index(params, this)];
                    case 1:
                        _a = _b.sent(), rawData = _a[0], meta = _a[1], userData = _a[2];
                        return [4 /*yield*/, Promise.all(rawData.map(function (data) {
                                return _this.applySerialization(data, "deserialize", "overview");
                            }))];
                    case 2: return [2 /*return*/, [
                            _b.sent(),
                            meta,
                            userData
                        ]];
                }
            });
        });
    };
    /**
     * Loads a list of data entries by the given search params. Works with offsets rather than pages
     * @param params The search params
     */
    Model.prototype.index2 = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, rawData, meta, userData;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.connector.index2(params, this)];
                    case 1:
                        _a = _b.sent(), rawData = _a[0], meta = _a[1], userData = _a[2];
                        return [4 /*yield*/, Promise.all(rawData.map(function (data) {
                                return _this.applySerialization(data, "deserialize", "overview");
                            }))];
                    case 2: return [2 /*return*/, [
                            _b.sent(),
                            meta,
                            userData
                        ]];
                }
            });
        });
    };
    /**
     * Fetches all records using index calls
     * @param params The params to pass to index
     * @returns ModelIndexResponse where userMeta and meta is taken from the last call
     */
    Model.prototype.fetchAll = function (params) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var page, perPage, perPageDefault, meta, userMeta, records, _b, tRecords, tMeta, tUserMeta, totalRows;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        page = 1;
                        perPage = 1000;
                        perPageDefault = true;
                        records = [];
                        _c.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.index(__assign(__assign({}, params), { rows: perPage, page: page }))];
                    case 2:
                        _b = _c.sent(), tRecords = _b[0], tMeta = _b[1], tUserMeta = _b[2];
                        // save data
                        records.push.apply(records, tRecords);
                        meta = tMeta;
                        userMeta = tUserMeta;
                        // calibrate defaults
                        if (perPageDefault) {
                            perPageDefault = false;
                            perPage = tRecords.length;
                        }
                        page++;
                        totalRows = (_a = meta.filteredRows) !== null && _a !== void 0 ? _a : meta.totalRows;
                        if (records.length >= totalRows || tRecords.length === 0)
                            return [3 /*break*/, 3];
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, [records, meta, userMeta]];
                }
            });
        });
    };
    /**
     * Fetches all records using index calls and caches the result
     * @param params The params to pass to index
     * @returns ModelIndexResponse where userMeta and meta is taken from the last call
     * @see fetchAll
     */
    Model.prototype.fetchAllCached = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, queryCache.fetchQuery(this.getReactQueryKeyFetchAll(params), function () { return _this.fetchAll(params); }, this.cacheOptions)];
            });
        });
    };
    /**
     * Gets the react-query cache key for this model
     * @param id The record id
     */
    Model.prototype.getReactQueryKey = function (id) {
        return [this.modelId, { id: id }, this.cacheKeys];
    };
    /**
     * Gets the react-query cache key for this model (for fetch all)
     * @param params The fetch all params
     */
    Model.prototype.getReactQueryKeyFetchAll = function (params) {
        return [this.modelId, params, this.cacheKeys];
    };
    /**
     * Provides a react-query useQuery hook for the given data id
     * @param id The data record id
     * @deprecated Use useModelGet(model, id) instead
     */
    Model.prototype.get = function (id) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelGet(this, id);
    };
    /**
     * Provides cached access for the given data id
     * @param id The data record id or null to obtain the default values
     */
    Model.prototype.getCached = function (id) {
        var _this = this;
        return queryCache.fetchQuery(this.getReactQueryKey(id), function () { return _this.getRaw(id); }, this.cacheOptions);
    };
    /**
     * Provides uncached access for the given data id
     * @param id The data record id or null to obtain the default values
     */
    Model.prototype.getRaw = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var rawData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getDefaultValues()];
                    case 1: return [2 /*return*/, [_a.sent(), {}]];
                    case 2: return [4 /*yield*/, this.connector.read(id, this)];
                    case 3:
                        rawData = _a.sent();
                        return [2 /*return*/, this.deserializeResponse(rawData)];
                }
            });
        });
    };
    /**
     * Deserializes the given ModelGetResponse
     * @param rawData The data to deserialize
     * @private
     */
    Model.prototype.deserializeResponse = function (rawData) {
        return __awaiter(this, void 0, void 0, function () {
            var deserialized, _a, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.applySerialization(rawData[0], "deserialize", "edit")];
                    case 1:
                        deserialized = _d.sent();
                        _a = [deserialized];
                        _c = (_b = Object).fromEntries;
                        return [4 /*yield*/, Promise.all(Object.entries(rawData[1]).map(function (keyValue) { return __awaiter(_this, void 0, void 0, function () {
                                var fieldName, values, refModel, _a, _b;
                                var _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            fieldName = keyValue[0];
                                            values = keyValue[1];
                                            refModel = (_c = this.fields[fieldName]) === null || _c === void 0 ? void 0 : _c.getRelationModel;
                                            if (!refModel) {
                                                // eslint-disable-next-line no-console
                                                console.warn("[Components-Care] [Model] Backend connector supplied related data, but no model is defined for this relationship (relationship name = " +
                                                    fieldName +
                                                    "). Data will be ignored.");
                                            }
                                            _a = [fieldName];
                                            if (!refModel) return [3 /*break*/, 2];
                                            return [4 /*yield*/, Promise.all(values.map(function (value) {
                                                    return refModel(deserialized.id, deserialized).applySerialization(value, "deserialize", "edit");
                                                }))];
                                        case 1:
                                            _b = _d.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            _b = null;
                                            _d.label = 3;
                                        case 3: return [2 /*return*/, _a.concat([
                                                _b
                                            ])];
                                    }
                                });
                            }); }))];
                    case 2: return [2 /*return*/, _a.concat([
                            _c.apply(_b, [_d.sent()])
                        ])];
                }
            });
        });
    };
    /**
     * Provides a react-query useMutation hook for creation or updates to an data entry
     * @deprecated Use useModelMutation(model) instead
     */
    Model.prototype.createOrUpdate = function () {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelMutation(this);
    };
    /**
     * Updates a single record on backend (doesn't update local cache)
     * @param values The new values (set id field to update)
     */
    Model.prototype.createOrUpdateRecordRaw = function (values) {
        return __awaiter(this, void 0, void 0, function () {
            var update, serializedValues, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        update = !!("id" in values && values.id);
                        return [4 /*yield*/, this.applySerialization(values, "serialize", update ? "edit" : "create")];
                    case 1:
                        serializedValues = _c.sent();
                        if (!update) return [3 /*break*/, 3];
                        _a = this.deserializeResponse;
                        return [4 /*yield*/, this.connector.update(serializedValues, this)];
                    case 2: return [2 /*return*/, _a.apply(this, [_c.sent()])];
                    case 3:
                        delete serializedValues["id"];
                        _b = this.deserializeResponse;
                        return [4 /*yield*/, this.connector.create(serializedValues, this)];
                    case 4: return [2 /*return*/, _b.apply(this, [_c.sent()])];
                }
            });
        });
    };
    /**
     * Provides a react hook to delete a given record id
     * @deprecated Use useModelDelete(model)
     */
    Model.prototype.delete = function () {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelDelete(this);
    };
    /**
     * Delete a single record in backend (does not affect local cache)
     * @param id The ID to delete
     */
    Model.prototype.deleteRaw = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.connector.delete(id, this)];
            });
        });
    };
    /**
     * Provides a react hook to delete multiple records at once
     * @deprecated Use useModelDeleteMultiple(model)
     */
    Model.prototype.deleteMultiple = function () {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelDeleteMultiple(this);
    };
    /**
     * Deletes multiple record at once (does not affect local cache)
     * @param ids The IDs to delete
     */
    // eslint-disable-next-line @typescript-eslint/require-await
    Model.prototype.deleteMultipleRaw = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.connector.deleteMultiple(ids, this)];
            });
        });
    };
    /**
     * Does the connector support delete all functionality?
     */
    Model.prototype.doesSupportAdvancedDeletion = function () {
        return !!this.connector.deleteAdvanced;
    };
    /**
     * Provides a react hook to mass delete data
     * @deprecated Use useModelDeleteAdvanced(model)
     */
    Model.prototype.deleteAdvanced = function () {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useModelDeleteAdvanced(this);
    };
    /**
     * Raw request to mass-delete data (does not affect local cache)
     * @param req The deletion request
     */
    Model.prototype.deleteAdvancedRaw = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.connector.deleteAdvanced) {
                    throw new Error("Connector doesn't support advanced deletion");
                }
                return [2 /*return*/, this.connector.deleteAdvanced(req, this)];
            });
        });
    };
    /**
     * Updates stored data (not relations)
     * @param id The id of the record to edit
     * @param updater The function which updates the data
     */
    Model.prototype.updateStoredData = function (id, updater) {
        ModelDataStore.setQueryData(this.getReactQueryKey(id), function (data) {
            if (!data)
                throw new Error("Data not set");
            var record = data[0], other = data.slice(1);
            return __spreadArray([updater(record)], other, true);
        });
    };
    /**
     * Returns a data grid compatible column definition
     */
    Model.prototype.toDataGridColumnDefinition = function (includeHidden) {
        if (includeHidden === void 0) { includeHidden = false; }
        return (!includeHidden
            ? Object.entries(this.fields).filter(function (entry) {
                return !entry[1].visibility.overview.disabled;
            })
            : Object.entries(this.fields)).map(function (entry) {
            var _a;
            var key = entry[0];
            var value = entry[1];
            var filterData = undefined;
            if (value.type.getFilterType() === "enum") {
                if (!value.type.getEnumValues)
                    throw new Error("Model Type Filter Type is enum, but getEnumValues not set");
                filterData = value.type
                    .getEnumValues()
                    .filter(function (value) { var _a; return !((_a = value.invisibleInGridFilter) !== null && _a !== void 0 ? _a : value.invisible); })
                    .map(function (value) {
                    return ({
                        getLabelText: value.getLabel,
                        value: value.value,
                        disabled: value.disabled,
                        isDivider: value.isDivider,
                    });
                });
            }
            else if (value.type.getFilterType() === "boolean") {
                filterData = [true, false].map(function (boolVal) {
                    return ({
                        getLabelText: value.type.stringify.bind(value.type, boolVal),
                        value: boolVal ? "true" : "false",
                    });
                });
            }
            return {
                field: key,
                headerName: value.getLabel(),
                headerLabel: value.getColumnLabel ? value.getColumnLabel() : undefined,
                type: value.type.getFilterType(),
                filterData: filterData,
                hidden: value.visibility.overview.hidden,
                filterable: value.filterable,
                sortable: value.sortable,
                width: (_a = (typeof value.columnWidth === "function"
                    ? value.columnWidth()
                    : value.columnWidth)) !== null && _a !== void 0 ? _a : (typeof value.type.dataGridColumnSizingHint === "function"
                    ? value.type.dataGridColumnSizingHint()
                    : value.type.dataGridColumnSizingHint),
            };
        });
    };
    /**
     * Validates the given values against the field defined validation rules
     * @param values The values to validate
     * @param view Optional view filter (only applies validations on fields present in given view)
     * @param fieldsToValidate List of fields to validate
     * @param type The validation type (normal = validate, hint = validateHint]
     */
    Model.prototype.validate = function (values, view, fieldsToValidate, type) {
        if (type === void 0) { type = "normal"; }
        return __awaiter(this, void 0, void 0, function () {
            var errors, validationFunction;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errors = {};
                        validationFunction = type === "normal" ? "validate" : "validateHint";
                        return [4 /*yield*/, Promise.all(Object.keys(this.fields).map(function (field) { return __awaiter(_this, void 0, void 0, function () {
                                var value, fieldDef, error, validate, _a, e_1, fieldValidation, e_2, e_3;
                                var _b, _c;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            value = getValueByDot(field, values);
                                            if (value === undefined)
                                                return [2 /*return*/];
                                            _d.label = 1;
                                        case 1:
                                            _d.trys.push([1, 12, , 13]);
                                            fieldDef = this.fields[field];
                                            if (view &&
                                                getVisibility(fieldDef.visibility[view], values, values).disabled)
                                                return [2 /*return*/];
                                            if (fieldsToValidate && !fieldsToValidate.includes(field))
                                                return [2 /*return*/];
                                            error = void 0;
                                            _d.label = 2;
                                        case 2:
                                            _d.trys.push([2, 6, , 7]);
                                            validate = (_b = fieldDef.type[validationFunction]) === null || _b === void 0 ? void 0 : _b.bind(fieldDef.type);
                                            if (!validate) return [3 /*break*/, 4];
                                            return [4 /*yield*/, validate(value)];
                                        case 3:
                                            _a = _d.sent();
                                            return [3 /*break*/, 5];
                                        case 4:
                                            _a = null;
                                            _d.label = 5;
                                        case 5:
                                            error = _a;
                                            return [3 /*break*/, 7];
                                        case 6:
                                            e_1 = _d.sent();
                                            // eslint-disable-next-line
                                            console.error("[Components-Care] [Model.validate] Error during validation:", e_1);
                                            if (captureException)
                                                captureException(e_1);
                                            error = e_1.message;
                                            return [3 /*break*/, 7];
                                        case 7:
                                            fieldValidation = (_c = fieldDef[validationFunction]) === null || _c === void 0 ? void 0 : _c.bind(fieldDef);
                                            if (!(!error && fieldValidation)) return [3 /*break*/, 11];
                                            _d.label = 8;
                                        case 8:
                                            _d.trys.push([8, 10, , 11]);
                                            return [4 /*yield*/, fieldValidation(value, values, fieldDef)];
                                        case 9:
                                            error = _d.sent();
                                            return [3 /*break*/, 11];
                                        case 10:
                                            e_2 = _d.sent();
                                            // eslint-disable-next-line
                                            console.error("[Components-Care] [Model.validate] Error during validation:", e_2);
                                            if (captureException)
                                                captureException(e_2);
                                            error = e_2.message;
                                            return [3 /*break*/, 11];
                                        case 11:
                                            if (error)
                                                errors[field] = error;
                                            return [3 /*break*/, 13];
                                        case 12:
                                            e_3 = _d.sent();
                                            // eslint-disable-next-line no-console
                                            console.error("[Components-Care] [Model.validate] Error during field validation:", field, value, e_3);
                                            if (captureException)
                                                captureException(e_3);
                                            return [3 /*break*/, 13];
                                        case 13: return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, errors];
                }
            });
        });
    };
    /**
     * Gets an empty/default model data entry
     */
    Model.prototype.getDefaultValues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = {};
                        promises = Object.entries(this.fields)
                            .filter(function (_a) {
                            var field = _a[0];
                            try {
                                return !getVisibility(_this.fields[field].visibility.create, {}, {}).disabled;
                            }
                            catch (e) {
                                return true;
                            }
                        })
                            .map(function (entry) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, field, def, defaultValue;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = entry, field = _a[0], def = _a[1];
                                        if (!def.getDefaultValue) return [3 /*break*/, 2];
                                        return [4 /*yield*/, def.getDefaultValue()];
                                    case 1:
                                        defaultValue = _b.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        defaultValue = def.type.getDefaultValue();
                                        _b.label = 3;
                                    case 3:
                                        deepAssign(data, dotToObject(field, defaultValue));
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * Serializes the given values into a JSON string
     * @param values The values to serialize
     * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
     */
    Model.prototype.serialize = function (values, visibility) {
        return __awaiter(this, void 0, void 0, function () {
            var serializable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.applySerialization(values, "serialize", visibility)];
                    case 1:
                        serializable = _a.sent();
                        return [2 /*return*/, JSON.stringify(serializable)];
                }
            });
        });
    };
    /**
     * Deserializes the given JSON data back into a data record
     * @param data The JSON string
     * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
     */
    Model.prototype.deserialize = function (data, visibility) {
        return __awaiter(this, void 0, void 0, function () {
            var parsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parsed = JSON.parse(data);
                        return [4 /*yield*/, this.applySerialization(parsed, "deserialize", visibility)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Applies the given serialization function to the data
     * @param values The data
     * @param func The function to apply
     * @param visibility The visibility of the field to check. Field will be dropped if visibility has disabled == true.
     * @returns A copy of the data
     */
    Model.prototype.applySerialization = function (values, func, visibility) {
        return __awaiter(this, void 0, void 0, function () {
            var copy, _a, _b, _i, key, field, value, visValue, serializeFunc, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        copy = {};
                        _a = [];
                        for (_b in this.fields)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        key = _a[_i];
                        if (!Object.prototype.hasOwnProperty.call(this.fields, key))
                            return [3 /*break*/, 5];
                        field = this.fields[key];
                        value = getValueByDot(key, values);
                        if (value === undefined && func === "serialize") {
                            return [3 /*break*/, 5];
                        }
                        visValue = getVisibility(field.visibility[visibility], values, values);
                        if (visValue.disabled &&
                            (func === "serialize" || !visValue.readOnly) &&
                            key !== "id") {
                            return [3 /*break*/, 5];
                        }
                        serializeFunc = field.type[func];
                        result = void 0;
                        if (!serializeFunc) return [3 /*break*/, 3];
                        return [4 /*yield*/, serializeFunc(value)];
                    case 2:
                        result = (_c.sent());
                        return [3 /*break*/, 4];
                    case 3:
                        result = value;
                        _c.label = 4;
                    case 4:
                        deepAssign(copy, dotToObject(key, result));
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, copy];
                }
            });
        });
    };
    /**
     * Find UX issues (dev util)
     * @param throwErr If true throws an error, otherwise logs it to console as warning
     * @remarks To enable this automatically set `Model.autoValidateUX = true; Model.autoValidateUXThrow = false/true;`
     */
    Model.prototype.validateUX = function (throwErr) {
        var _this = this;
        if (throwErr === void 0) { throwErr = false; }
        var report = function (msg) {
            // eslint-disable-next-line no-console
            return throwErr ? throwError(msg) : console.warn(msg);
        };
        // iterate over the whole definition
        Object.entries(this.fields).forEach(function (kv) {
            var field = kv[0];
            var def = kv[1];
            // fields that are visibile in grid
            if (def.visibility.overview.grid) {
                // check if they have a label
                if (!def.getLabel().trim())
                    report("[Components-Care] [Model.validateUX] ".concat(_this.modelId, ".").concat(field, " is visible in Grid but doesn't have label"));
            }
        });
    };
    /**
     * Global toggle to trigger auto validation of UX when constructor is called
     */
    Model.autoValidateUX = false;
    /**
     * Throw errors when UX auto validation fails, only used when autoValidateUX is true
     */
    Model.autoValidateUXThrow = false;
    return Model;
}());
export default Model;

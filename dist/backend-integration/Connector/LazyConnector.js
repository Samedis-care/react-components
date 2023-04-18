var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { last, } from "../..";
import Connector from "./Connector";
export var IndexEnhancementLevel;
(function (IndexEnhancementLevel) {
    /**
     * Pass though index call to backend
     */
    IndexEnhancementLevel[IndexEnhancementLevel["None"] = 0] = "None";
    /**
     * Pass though index call to backend, append new records and changed records in result
     */
    IndexEnhancementLevel[IndexEnhancementLevel["Basic"] = 1] = "Basic";
})(IndexEnhancementLevel || (IndexEnhancementLevel = {}));
/**
 * Forwards all read calls (index, read) to the real connector directly but queues all writing calls (create, update, delete) which can be fired at once
 * @remarks Does not support relations, enhances read/index calls with locally updated data
 */
var LazyConnector = /** @class */ (function (_super) {
    __extends(LazyConnector, _super);
    function LazyConnector(connector, fakeReads, onQueueChange) {
        var _this = _super.call(this) || this;
        _this.indexEnhancement = IndexEnhancementLevel.Basic;
        _this.queue = [];
        // backend emulation
        _this.FAKE_ID_PREFIX = "fake-id-";
        _this.fakeIdCounter = 0;
        _this.fakeIdMapping = {};
        _this.fakeIdMappingRev = {}; // reverse map
        _this.handleAdvancedDelete = function (req, model) {
            if (!_this.realConnector.deleteAdvanced)
                throw new Error("deleteAdvanced got undefined!");
            // optimize queue if filter is not active
            if (req.length === 2) {
                var invert_1 = req[0];
                _this.queue = _this.queue.filter(function (entry) {
                    if (!entry.id)
                        return true;
                    var included = req[1].includes(entry.id);
                    return invert_1 ? included : !included;
                });
                req[1] = req[1].filter(function (id) {
                    return !id.startsWith(_this.FAKE_ID_PREFIX) ||
                        _this.queue.find(function (entry) { return entry.id === id; });
                });
                req[1] = req[1].filter(function (id) {
                    return !id.startsWith(_this.FAKE_ID_PREFIX) ||
                        _this.queue.find(function (entry) { return entry.id === id; });
                });
                if (!invert_1 && req[1].length === 0) {
                    _this.onAfterOperation();
                    return;
                }
            }
            _this.queue.push({
                type: "delete",
                id: null,
                func: _this.realConnector.deleteAdvanced.bind(_this.realConnector, req, model),
                result: null,
            });
            _this.onAfterOperation();
        };
        _this.workQueue = function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, entry, res, realId, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.queue;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        entry = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, entry.func()];
                    case 3:
                        res = _b.sent();
                        if (entry.type === "create") {
                            realId = res[0].id;
                            this.fakeIdMapping[entry.id] = realId;
                            this.fakeIdMappingRev[realId] = entry.id;
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _b.sent();
                        // we ignore failed deletes
                        if (entry.type !== "delete") {
                            throw e_1;
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        this.queue = [];
                        this.onAfterOperation();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.onQueueChange = onQueueChange;
        _this.realConnector = connector;
        _this.fakeReads = fakeReads;
        if (_this.realConnector.deleteAdvanced) {
            _this.deleteAdvanced = _this.handleAdvancedDelete;
        }
        return _this;
    }
    LazyConnector.prototype.create = function (data, model) {
        var _a;
        var fakeId = "".concat(this.FAKE_ID_PREFIX).concat(this.fakeIdCounter++);
        var returnData = [
            __assign(__assign({}, data), (_a = {}, _a["id"] = fakeId, _a)),
            {},
        ];
        this.queue.push({
            type: "create",
            id: fakeId,
            func: this.realConnector.create.bind(this.realConnector, data, model),
            result: returnData,
        });
        this.onAfterOperation();
        return returnData;
    };
    LazyConnector.prototype.delete = function (id, model) {
        this.queue = this.queue.filter(function (entry) { return !entry.id || entry.id !== id; });
        id = this.mapId(id);
        if (id.startsWith(this.FAKE_ID_PREFIX)) {
            this.onAfterOperation();
            return;
        }
        this.queue.push({
            type: "delete",
            id: id,
            func: this.realConnector.delete.bind(this.realConnector, id, model),
            result: null,
        });
        this.onAfterOperation();
    };
    LazyConnector.prototype.index = function (params, model) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = [
                            [],
                            { totalRows: 0, filteredRows: 0 },
                        ];
                        if (!!this.fakeReads) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.realConnector.index(params, model)];
                    case 1:
                        result = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (this.indexEnhancement === IndexEnhancementLevel.None)
                            return [2 /*return*/, result];
                        // map real ids to fake ids for consistency
                        result[0] = result[0].map(function (entry) { return (__assign(__assign({}, entry), { id: _this.unmapId(entry.id) })); });
                        // enhance result with local data
                        this.queue.forEach(function (entry) {
                            if (entry.type === "create") {
                                result[0].push(entry.result[0]);
                                if (result[1].filteredRows)
                                    ++result[1].filteredRows;
                                ++result[1].totalRows;
                            }
                            else if (entry.type === "update") {
                                result[0] = result[0]
                                    .filter(function (backendRecord) {
                                    return backendRecord.id !== entry.id;
                                })
                                    .concat(entry.result[0]);
                            }
                            else if (entry.type === "delete") {
                                var entryId_1 = entry.id;
                                if (!entryId_1)
                                    return;
                                result[0].filter(function (backendRecord) {
                                    return backendRecord.id !== entry.id &&
                                        !entryId_1
                                            .split(",")
                                            .includes(backendRecord.id);
                                });
                            }
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    LazyConnector.prototype.read = function (id, model) {
        var localData = last(this.queue.filter(function (entry) { var _a; return entry.id === id || ((_a = entry.id) === null || _a === void 0 ? void 0 : _a.split(",").includes(id)); }));
        if (localData) {
            if (localData.result) {
                return localData.result;
            }
            else {
                throw new Error("data has been deleted");
            }
        }
        return this.realConnector.read(this.mapId(id), model);
    };
    LazyConnector.prototype.update = function (data, model) {
        var _this = this;
        var previousQueueEntry = this.queue.find(function (entry) {
            return (entry.type === "create" || entry.type === "update") &&
                entry.id === data.id;
        });
        var id = data.id, otherData = __rest(data, ["id"]);
        var updateFunc = function () {
            return _this.realConnector.update(__assign(__assign({}, otherData), { id: _this.mapId(id) }), model);
        };
        if (previousQueueEntry) {
            if (previousQueueEntry.type === "update") {
                previousQueueEntry.func = function () { return updateFunc; };
            }
            else if (previousQueueEntry.type === "create") {
                previousQueueEntry.func = this.realConnector.create.bind(this.realConnector, otherData, model);
            }
        }
        else {
            this.queue.push({
                type: "update",
                id: data.id,
                func: updateFunc,
                result: [data, {}],
            });
        }
        this.onAfterOperation();
        return [data, {}];
    };
    LazyConnector.prototype.deleteMultiple = function (ids, model) {
        var _this = this;
        this.queue = this.queue.filter(function (entry) { return !entry.id || !ids.includes(entry.id); });
        ids = ids.map(function (id) { return _this.mapId(id); });
        ids = ids.filter(function (id) {
            return !id.startsWith(_this.FAKE_ID_PREFIX) ||
                _this.queue.find(function (entry) { return entry.id === id; });
        });
        if (ids.length === 0) {
            this.onAfterOperation();
            return;
        }
        this.queue.push({
            type: "delete",
            id: ids.join(","),
            func: this.realConnector.deleteMultiple.bind(this.realConnector, ids, model),
            result: null,
        });
        this.onAfterOperation();
    };
    LazyConnector.prototype.onAfterOperation = function () {
        if (this.onQueueChange)
            this.onQueueChange(this.queue);
    };
    /**
     * Maps a potentially fake ID to a real ID
     * @param id The ID
     * @remarks Only works after workQueue has been called
     */
    LazyConnector.prototype.mapId = function (id) {
        var _a;
        return (_a = this.fakeIdMapping[id]) !== null && _a !== void 0 ? _a : id;
    };
    /**
     * Maps a potentially real ID to a fake ID
     * @param id The ID
     */
    LazyConnector.prototype.unmapId = function (id) {
        var _a;
        return (_a = this.fakeIdMappingRev[id]) !== null && _a !== void 0 ? _a : id;
    };
    /**
     * Is the work queue empty?
     */
    LazyConnector.prototype.isQueueEmpty = function () {
        return this.queue.length === 0;
    };
    /**
     * Set a new queue change handler
     * @param newHandler The new handler
     */
    LazyConnector.prototype.setQueueChangeHandler = function (newHandler) {
        this.onQueueChange = newHandler !== null && newHandler !== void 0 ? newHandler : undefined;
    };
    return LazyConnector;
}(Connector));
export default LazyConnector;

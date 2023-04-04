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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Connector, filterSortPaginate, } from "../..";
var LocalStorageConnector = /** @class */ (function (_super) {
    __extends(LocalStorageConnector, _super);
    /**
     * Creates a new local storage connector
     * @param key The storage key
     */
    function LocalStorageConnector(key) {
        var _this = _super.call(this) || this;
        _this.deleteAdvanced = function (req, model) { return __awaiter(_this, void 0, void 0, function () {
            var invert, ids, filter, toDelete, matchingIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        invert = req[0], ids = req[1], filter = req[2];
                        if (!!invert) return [3 /*break*/, 2];
                        // deleteMultiple may return undefined or a promise
                        // eslint-disable-next-line @typescript-eslint/await-thenable
                        return [4 /*yield*/, _super.prototype.deleteMultiple.call(this, ids, model)];
                    case 1:
                        // deleteMultiple may return undefined or a promise
                        // eslint-disable-next-line @typescript-eslint/await-thenable
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this.index(__assign({ page: 1, rows: Number.MAX_SAFE_INTEGER, sort: [] }, filter))];
                    case 3:
                        toDelete = _a.sent();
                        matchingIds = toDelete[0]
                            .map(function (entry) { return entry.id; })
                            .filter(function (id) { return !ids.includes(id); });
                        return [2 /*return*/, _super.prototype.deleteMultiple.call(this, matchingIds, model)];
                }
            });
        }); };
        _this.key = key;
        return _this;
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    LocalStorageConnector.prototype.index = function (params, model) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var db, processed;
            return __generator(this, function (_b) {
                // eslint-disable-next-line no-console
                console.log("[CC] [LocalStorageConnector] index(", params, model, ")");
                if (!model && (params === null || params === void 0 ? void 0 : params.fieldFilter)) {
                    throw new Error("Can't index with field filter: No model specified");
                }
                db = this.getDB();
                processed = filterSortPaginate(Object.values(db), Object.assign({
                    page: 1,
                    rows: 25,
                    sort: [],
                    quickFilter: "",
                    fieldFilter: {},
                    additionalFilters: {},
                }, params), (_a = model === null || model === void 0 ? void 0 : model.toDataGridColumnDefinition()) !== null && _a !== void 0 ? _a : []);
                return [2 /*return*/, [
                        processed[0],
                        {
                            totalRows: Object.keys(db).length,
                            filteredRows: processed[1],
                        },
                    ]];
            });
        });
    };
    LocalStorageConnector.prototype.create = function (data) {
        if ("id" in data && data.id) {
            throw new Error("Can't create: Creation request contains ID");
        }
        var db = this.getDB();
        // generate random ID
        var id = __spreadArray([], new Array(16), true).map(function () { return Math.floor(Math.random() * 16).toString(16); })
            .join("");
        data["id"] = id;
        db[id] = data;
        this.setDB(db);
        return [data, {}];
    };
    LocalStorageConnector.prototype.read = function (id) {
        var db = this.getDB();
        if (!(id in db)) {
            throw new Error("Can't read: Record not found");
        }
        return [db[id], {}];
    };
    LocalStorageConnector.prototype.update = function (data) {
        var db = this.getDB();
        var id = data["id"];
        if (!(id in db)) {
            throw new Error("Can't read: Record not found");
        }
        db[id] = data;
        this.setDB(db);
        return [data, {}];
    };
    // eslint-disable-next-line @typescript-eslint/require-await
    LocalStorageConnector.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                db = this.getDB();
                if (!(id in db)) {
                    throw new Error("Can't delete: Record not found");
                }
                delete db[id];
                this.setDB(db);
                return [2 /*return*/];
            });
        });
    };
    LocalStorageConnector.prototype.getDB = function () {
        var dataStr = localStorage.getItem(this.key);
        if (!dataStr)
            return {};
        try {
            return JSON.parse(dataStr);
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [LocalStorageConnector] Failed parsing data", e);
            return {};
        }
    };
    LocalStorageConnector.prototype.setDB = function (data) {
        return localStorage.setItem(this.key, JSON.stringify(data));
    };
    return LocalStorageConnector;
}(Connector));
export default LocalStorageConnector;

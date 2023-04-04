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
import { Connector } from "../../backend-integration/Connector";
import JsonApiClient from "../../backend-integration/Connector/JsonApiClient";
import AuthMode from "../../backend-integration/Connector/AuthMode";
var BackendConnector = /** @class */ (function (_super) {
    __extends(BackendConnector, _super);
    function BackendConnector() {
        var _this = _super.call(this) || this;
        _this.getApiBase = function () {
            if (!localStorage.apiBase) {
                throw new Error("Please set the API endpoint for the data grid story in dev tools: 'localStorage.apiBase = \"https://url/to/your/api\"'");
            }
            return localStorage.apiBase;
        };
        _this.handleAuth = function () {
            if (!localStorage.dataGridAuth) {
                throw new Error("Please set your authentication in dev tools: 'localStorage.dataGridAuth = \"Authorization Header Value\"'");
            }
            return localStorage.dataGridAuth;
        };
        _this.processResponse = function (response, responseData, method, url, args, body, auth) { return __awaiter(_this, void 0, void 0, function () {
            var rsp, success, error, message;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                rsp = responseData;
                success = (_b = (_a = rsp.meta) === null || _a === void 0 ? void 0 : _a.msg) === null || _b === void 0 ? void 0 : _b.success;
                error = (_d = (_c = rsp.meta) === null || _c === void 0 ? void 0 : _c.msg) === null || _d === void 0 ? void 0 : _d.error;
                message = (_f = (_e = rsp.meta) === null || _e === void 0 ? void 0 : _e.msg) === null || _f === void 0 ? void 0 : _f.message;
                if (!success) {
                    if (error === "token_invalid" || error === "token_expired") {
                        if (auth === AuthMode.Off) {
                            throw new Error("Authentication is needed, but wasn't specified");
                        }
                        delete localStorage.dataGridAuth;
                        // retry
                        return [2 /*return*/, this.client.request(method, url, args, body, auth)];
                    }
                    throw new Error(message || error || "Invalid response");
                }
                return [2 /*return*/, responseData];
            });
        }); };
        _this.convertSort = function (sort) { return ({
            property: sort.field,
            direction: sort.direction < 0 ? "DESC" : "ASC",
        }); };
        _this.client = new JsonApiClient(_this.handleAuth, _this.processResponse);
        return _this;
    }
    BackendConnector.prototype.getIndexParams = function (page, rows, sort, quickFilter, gridFilter, additionalFilters, extraParams) {
        if (!extraParams)
            extraParams = {};
        return Object.assign({
            "page[number]": page,
            "page[limit]": rows,
            sort: sort.map(this.convertSort),
            quickfilter: quickFilter,
            gridfilter: gridFilter,
            additionalFilters: additionalFilters,
        }, extraParams);
    };
    BackendConnector.prototype.index = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var indexParams, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // load reasonable defaults if nothing is set
                        if (!params)
                            params = {};
                        if (!params.page)
                            params.page = 1;
                        if (!params.rows)
                            params.rows = 25;
                        if (!params.sort)
                            params.sort = [];
                        if (!params.quickFilter)
                            params.quickFilter = "";
                        if (!params.fieldFilter)
                            params.fieldFilter = {};
                        if (!params.additionalFilters)
                            params.additionalFilters = {};
                        indexParams = this.getIndexParams(params.page, params.rows, params.sort, params.quickFilter, params.fieldFilter, params.additionalFilters);
                        return [4 /*yield*/, this.client.get(this.getApiBase(), indexParams)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, [
                                resp.data.map(function (entry) { return entry.attributes; }),
                                {
                                    totalRows: resp.meta.total,
                                },
                                resp.meta,
                            ]];
                }
            });
        });
    };
    BackendConnector.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.post(this.getApiBase(), null, data)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, [resp.data.attributes, {}]];
                }
            });
        });
    };
    BackendConnector.prototype.read = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.get("".concat(this.getApiBase(), "/").concat(id), null)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, [resp.data.attributes, {}]];
                }
            });
        });
    };
    BackendConnector.prototype.update = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.put("".concat(this.getApiBase(), "/").concat(data.id), null, data)];
                    case 1:
                        resp = _a.sent();
                        return [2 /*return*/, [resp.data.attributes, {}]];
                }
            });
        });
    };
    BackendConnector.prototype.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.delete("".concat(this.getApiBase(), "/").concat(id), null)];
            });
        });
    };
    BackendConnector.prototype.deleteMultiple = function (ids) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.delete("".concat(this.getApiBase(), "/").concat(ids.join(",")), null)];
            });
        });
    };
    return BackendConnector;
}(Connector));
export default BackendConnector;

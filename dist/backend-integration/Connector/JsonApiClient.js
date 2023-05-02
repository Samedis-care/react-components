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
/* eslint-disable no-console */
import ccI18n from "../../i18n";
import AuthMode from "./AuthMode";
import { addGetParams } from "../../utils";
import { BackendError, NetworkError } from "./index";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
// noinspection ExceptionCaughtLocallyJS
/**
 * A helper class to connect to JSON REST apis
 */
var JsonApiClient = /** @class */ (function () {
    function JsonApiClient(authHandler, responseProcessor, preRequestHook, postRequestHook, exceptionHook, customRequestPerformer) {
        this.handleAuthentication = authHandler;
        this.handleResponse = responseProcessor;
        this.handlePreRequest = preRequestHook;
        this.handlePostRequest = postRequestHook;
        this.exceptionHook = exceptionHook;
        this.customRequestPerformer = customRequestPerformer;
    }
    /**
     * @see request
     */
    JsonApiClient.prototype.get = function (url, args, auth) {
        if (auth === void 0) { auth = AuthMode.On; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("GET", url, args, null, auth)];
            });
        });
    };
    /**
     * @see request
     */
    JsonApiClient.prototype.post = function (url, args, body, auth) {
        if (auth === void 0) { auth = AuthMode.On; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("POST", url, args, body, auth)];
            });
        });
    };
    /**
     * @see request
     */
    JsonApiClient.prototype.put = function (url, args, body, auth) {
        if (auth === void 0) { auth = AuthMode.On; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("PUT", url, args, body, auth)];
            });
        });
    };
    /**
     * @see request
     */
    JsonApiClient.prototype.patch = function (url, args, body, auth) {
        if (auth === void 0) { auth = AuthMode.On; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("PATCH", url, args, body, auth)];
            });
        });
    };
    /**
     * @see request
     */
    JsonApiClient.prototype.delete = function (url, args, auth) {
        if (auth === void 0) { auth = AuthMode.On; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request("DELETE", url, args, null, auth)];
            });
        });
    };
    /**
     * Convert request body
     * @param body The body data
     * @param headers The headers (can be modified to add/remove headers)
     * @return The body data passed to fetch
     * @protected
     */
    JsonApiClient.prototype.convertBody = function (body, headers) {
        if (!body)
            return null;
        headers["Content-Type"] = "application/json";
        return JSON.stringify(body);
    };
    /**
     * Performs an HTTP request with automatic authorization if desired
     * @param method The HTTP Verb
     * @param url The url of the request
     * @param args The query parameters to pass
     * @param body The JSON body to pass
     * @param auth The authentication mode to use
     */
    JsonApiClient.prototype.request = function (method, url, args, body, auth) {
        return __awaiter(this, void 0, void 0, function () {
            var safeToLeave, headers, _a, response, e_1, responseText, e_2, responseData, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        safeToLeave = method !== "GET" ? UnsafeToLeaveDispatch.lock(method + "-request") : null;
                        if (!this.handlePreRequest) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.handlePreRequest(method, url, args, body, auth)];
                    case 1:
                        void (_b.sent());
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 16, 17, 20]);
                        headers = {};
                        // Handle localization
                        headers["Accept-Language"] = ccI18n.language;
                        if (!(auth !== AuthMode.Off)) return [3 /*break*/, 4];
                        _a = headers;
                        return [4 /*yield*/, this.handleAuthentication(auth)];
                    case 3:
                        _a.Authorization = _b.sent();
                        _b.label = 4;
                    case 4:
                        response = void 0;
                        if (!this.customRequestPerformer) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.customRequestPerformer(method, url, args, headers, body, auth)];
                    case 5:
                        response = _b.sent();
                        _b.label = 6;
                    case 6:
                        if (!!response) return [3 /*break*/, 10];
                        // Handle URL GET arguments
                        url = addGetParams(url, args);
                        // Handle POST data
                        body = this.convertBody(body, headers);
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, fetch(url, {
                                body: body,
                                headers: headers,
                                method: method,
                            })];
                    case 8:
                        response = _b.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        e_1 = _b.sent();
                        // Network error
                        console.error("Failed fetch", e_1);
                        throw new NetworkError(ccI18n.t("backend-integration.connector.json-api-client.network-error"));
                    case 10:
                        responseText = void 0;
                        _b.label = 11;
                    case 11:
                        _b.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, response.text()];
                    case 12:
                        responseText = _b.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        e_2 = _b.sent();
                        console.error("[JsonApiClient] Failed reading response", e_2);
                        throw new NetworkError(ccI18n.t("backend-integration.connector.json-api-client.network-error"));
                    case 14:
                        responseData = void 0;
                        try {
                            responseData = JSON.parse(responseText);
                        }
                        catch (e) {
                            // JSON parse error
                            console.error("[JsonApiClient] Failed JSON parsing", e, responseText);
                            throw new BackendError(ccI18n.t("backend-integration.connector.json-api-client.parse-error", {
                                STATUS_CODE: response.status,
                                STATUS_TEXT: response.statusText,
                            }));
                        }
                        return [4 /*yield*/, this.handleResponse(response, responseData, method, url, args, body, auth)];
                    case 15: return [2 /*return*/, (_b.sent())];
                    case 16:
                        e_3 = _b.sent();
                        if (this.exceptionHook) {
                            this.exceptionHook(e_3);
                        }
                        throw e_3;
                    case 17:
                        if (!this.handlePostRequest) return [3 /*break*/, 19];
                        return [4 /*yield*/, this.handlePostRequest(method, url, args, body, auth)];
                    case 18:
                        void (_b.sent());
                        _b.label = 19;
                    case 19:
                        if (safeToLeave) {
                            safeToLeave();
                        }
                        return [7 /*endfinally*/];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    return JsonApiClient;
}());
export default JsonApiClient;

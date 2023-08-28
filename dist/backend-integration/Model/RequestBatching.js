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
import { sleep } from "../../utils";
var RequestBatching = /** @class */ (function () {
    function RequestBatching() {
    }
    RequestBatching.get = function (id, model) {
        return __awaiter(this, void 0, void 0, function () {
            var batchKey, promise, batchRequests_1, batchStart_1, batchNonce_1, result, record;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batchKey = JSON.stringify(model.getReactQueryKey(null, true));
                        if (batchKey in this.batchPromises &&
                            this.batchRequestIds[batchKey].length < this.MAX_BATCH_REQUESTS) {
                            this.batchRequestIds[batchKey].push(id);
                            this.batchLastAdded[batchKey] = Date.now();
                            promise = this.batchPromises[batchKey];
                        }
                        else {
                            batchRequests_1 = (this.batchRequestIds[batchKey] = [id]);
                            batchStart_1 = (this.batchLastAdded[batchKey] = Date.now());
                            batchNonce_1 = (this.batchNonce[batchKey] = "".concat(Date.now().toString(), "-").concat(Math.random()));
                            this.batchPromises[batchKey] = promise = (function () { return __awaiter(_this, void 0, void 0, function () {
                                var now, maxBatchTimeWait, nextRequestTimeWait, minWait;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(batchRequests_1.length < this.MAX_BATCH_REQUESTS)) return [3 /*break*/, 2];
                                            now = Date.now();
                                            maxBatchTimeWait = batchStart_1 + this.MAX_BATCH_TIME - now;
                                            nextRequestTimeWait = this.batchLastAdded[batchKey] + this.BATCH_DURATION - now;
                                            minWait = Math.min(maxBatchTimeWait, nextRequestTimeWait);
                                            if (minWait <= 0)
                                                return [3 /*break*/, 2]; // something timed out, we're ready
                                            return [4 /*yield*/, sleep(minWait)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 0];
                                        case 2:
                                            // if our nonce still matches there is no new instance using our key, so we clean up after us
                                            if (this.batchNonce[batchKey] === batchNonce_1) {
                                                delete this.batchPromises[batchKey];
                                                delete this.batchNonce[batchKey];
                                                delete this.batchRequestIds[batchKey];
                                                delete this.batchLastAdded[batchKey];
                                            }
                                            // execute batch
                                            return [2 /*return*/, model.fetchAll({
                                                    fieldFilter: {
                                                        id: {
                                                            type: "inSet",
                                                            value1: batchRequests_1.join(","),
                                                            value2: "",
                                                        },
                                                    },
                                                })];
                                    }
                                });
                            }); })();
                        }
                        return [4 /*yield*/, promise];
                    case 1:
                        result = _a.sent();
                        record = result[0].find(function (record) { return record.id === id; });
                        if (!record)
                            throw new Error("[Components-Care] [RequestBatching] Requested record not returned by backend");
                        return [2 /*return*/, record];
                }
            });
        });
    };
    /**
     * Time in milliseconds in which no new request shall be added to the batch for the batch to be processed (debounce timer)
     */
    RequestBatching.BATCH_DURATION = 10;
    /**
     * Max delay in milliseconds of requests added to the batch. This timer forces the batch to be processed even if BATCH_DURATION would make it wait
     * => limits max delay/latency
     */
    RequestBatching.MAX_BATCH_TIME = 50;
    /**
     * Max amount of requests in a single batch
     */
    RequestBatching.MAX_BATCH_REQUESTS = 100;
    RequestBatching.batchPromises = {};
    RequestBatching.batchNonce = {};
    RequestBatching.batchRequestIds = {};
    RequestBatching.batchLastAdded = {};
    return RequestBatching;
}());
export default RequestBatching;

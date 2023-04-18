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
/**
 * A generic backend connector which provides a basic CRUD interface for data
 */
var Connector = /** @class */ (function () {
    function Connector() {
    }
    /**
     * Index function, which works with offsets, rather than pages
     * @see index
     * @remarks This should be implemented by application developers if possible, it allows for increased efficiency.
     *          This function should be avoided if you are developing Components-Care components, prefer the normal index function.
     *          This function is poly-filled if not implemented by application developer, which is less efficient
     *          and drops the user-defined third return value, as the polyfill merges multiple calls to index function into one.
     */
    Connector.prototype.index2 = function (params, model) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var pageSize, page, offset, rows, mergedResultSet, lastMeta, _b, resultSet, meta, maxRows, recordStartIndex, recordEndIndex, copySet;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pageSize = 25;
                        if (params.rows < 0)
                            throw new Error("This function may only be called with params.rows >= 0");
                        page = (params.offset / pageSize) | 0;
                        offset = page * pageSize;
                        rows = params.rows;
                        mergedResultSet = [];
                        lastMeta = null;
                        _c.label = 1;
                    case 1: return [4 /*yield*/, this.index(Object.assign({}, params, { page: page + 1, rows: pageSize }), model)];
                    case 2:
                        _b = _c.sent(), resultSet = _b[0], meta = _b[1];
                        lastMeta = meta;
                        maxRows = (_a = meta.filteredRows) !== null && _a !== void 0 ? _a : meta.totalRows;
                        recordStartIndex = params.offset - offset;
                        recordEndIndex = Math.min(params.offset + params.rows, maxRows) - offset;
                        copySet = resultSet.slice(Math.max(recordStartIndex, 0), Math.min(recordEndIndex, pageSize));
                        mergedResultSet.push.apply(mergedResultSet, copySet);
                        if (offset + pageSize >= maxRows)
                            return [3 /*break*/, 4]; // no more data
                        // update vars
                        page++;
                        offset += pageSize;
                        rows -= pageSize;
                        _c.label = 3;
                    case 3:
                        if (rows > 0) return [3 /*break*/, 1];
                        _c.label = 4;
                    case 4:
                        if (lastMeta == null)
                            throw new Error("No metadata recorded");
                        return [2 /*return*/, [mergedResultSet, lastMeta]];
                }
            });
        });
    };
    Connector.prototype.deleteMultiple = function (ids, model) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(ids.map(function (id) { return _this.delete(id, model); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Connector;
}());
export default Connector;

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
import ModelDataStore from "../backend-integration/Store/index";
import debouncePromise from "../utils/debouncePromise";
var StorageProvider = /** @class */ (function () {
    function StorageProvider() {
    }
    return StorageProvider;
}());
export { StorageProvider };
var LocalStorageProvider = /** @class */ (function (_super) {
    __extends(LocalStorageProvider, _super);
    function LocalStorageProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.PREFIX = "cc-lsp-";
        return _this;
    }
    LocalStorageProvider.prototype.getItem = function (key) {
        return localStorage.getItem(this.PREFIX + key);
    };
    LocalStorageProvider.prototype.setItem = function (key, value) {
        if (value == null) {
            delete localStorage[this.PREFIX + key];
            return;
        }
        localStorage.setItem(this.PREFIX + key, value);
    };
    LocalStorageProvider.prototype.clear = function () {
        var _this = this;
        Object.keys(localStorage)
            .filter(function (e) { return e.startsWith(_this.PREFIX); })
            .forEach(function (e) { return delete localStorage[e]; });
    };
    return LocalStorageProvider;
}(StorageProvider));
export { LocalStorageProvider };
var SessionStorageProvider = /** @class */ (function (_super) {
    __extends(SessionStorageProvider, _super);
    function SessionStorageProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.PREFIX = "cc-ssp-";
        return _this;
    }
    SessionStorageProvider.prototype.getItem = function (key) {
        return sessionStorage.getItem(this.PREFIX + key);
    };
    SessionStorageProvider.prototype.setItem = function (key, value) {
        if (value == null) {
            delete sessionStorage[this.PREFIX + key];
            return;
        }
        sessionStorage.setItem(this.PREFIX + key, value);
    };
    SessionStorageProvider.prototype.clear = function () {
        var _this = this;
        Object.keys(sessionStorage)
            .filter(function (e) { return e.startsWith(_this.PREFIX); })
            .forEach(function (e) { return delete sessionStorage[e]; });
    };
    return SessionStorageProvider;
}(StorageProvider));
export { SessionStorageProvider };
var CachedServerStorageProvider = /** @class */ (function (_super) {
    __extends(CachedServerStorageProvider, _super);
    function CachedServerStorageProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * React-Query cache configuration. Defaults to 5 minute data caching
         * @protected
         */
        _this.cacheOptions = {
            staleTime: 300000,
        };
        _this.debounceTable = {};
        _this.cleanupTable = {};
        return _this;
    }
    CachedServerStorageProvider.prototype.getItem = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, ModelDataStore.fetchQuery(["cc-css", key], function () { return _this.getItemFromServer(key); }, this.cacheOptions)];
                }
                catch (e) {
                    // on failure return null
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    CachedServerStorageProvider.prototype.setItem = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (key in this.debounceTable) {
                    window.clearTimeout(this.cleanupTable[key]);
                }
                else {
                    this.debounceTable[key] = debouncePromise(function (value) {
                        return ModelDataStore.executeMutation({
                            mutationFn: function () { return _this.setItemOnServer(key, value); },
                            mutationKey: ["cc-css-mt", key],
                            onSuccess: function () {
                                ModelDataStore.setQueryData(["cc-css", key], function () { return value; });
                            },
                        });
                    }, 1000);
                }
                window.setTimeout(this.cleanDebounce.bind(this), 300000, key);
                return [2 /*return*/, this.debounceTable[key](value)];
            });
        });
    };
    CachedServerStorageProvider.prototype.clear = function () {
        var _this = this;
        return ModelDataStore.executeMutation({
            mutationFn: function () { return _this.clearFromServer(); },
            mutationKey: "cc-css-clear",
            onSuccess: function () {
                ModelDataStore.removeQueries({
                    predicate: function (query) {
                        return Array.isArray(query.queryKey) && query.queryKey[0] === "cs-css";
                    },
                });
            },
        });
    };
    CachedServerStorageProvider.prototype.cleanDebounce = function (key) {
        delete this.debounceTable[key];
        delete this.cleanupTable[key];
    };
    return CachedServerStorageProvider;
}(StorageProvider));
export { CachedServerStorageProvider };
export var LocalStorageProviderInstance = new LocalStorageProvider();
export var SessionStorageProviderInstance = new SessionStorageProvider();
export var DefaultGetStorageProviderCallback = function (id, keys) { return [LocalStorageProviderInstance, keys]; };
var StorageManager = /** @class */ (function () {
    function StorageManager() {
    }
    /**
     * Configures storage manager
     * @param callback The callback which determines the storage used for the given storage types
     */
    StorageManager.configure = function (callback) {
        this.storageProviderCallback = callback;
    };
    /**
     * Loads a record from storage
     * @param id Unique identifier, should be used to determine storage class
     * @param keys Identifiers which separate storage (think namespaces, such as tenant id)
     * @returns The value or null if not present
     */
    StorageManager.getItem = function (id, keys) {
        var _a = this.storageProviderCallback(id, __assign({}, keys)), storageProvider = _a[0], keysToUse = _a[1];
        return storageProvider.getItem(this.buildStorageKey(id, keysToUse));
    };
    /**
     * Store a record in storage
     * @param id Unique identifier, should be used to determine storage class
     * @param keys Identifiers which separate storage (think namespaces, such as tenant id)
     * @param value To record to store
     */
    StorageManager.setItem = function (id, keys, value) {
        var _a = this.storageProviderCallback(id, __assign({}, keys)), storageProvider = _a[0], keysToUse = _a[1];
        return storageProvider.setItem(this.buildStorageKey(id, keysToUse), value);
    };
    /**
     * Build a storage key to use with Storage Providers
     * @see GetStorageProviderCallback for params
     * @private
     */
    StorageManager.buildStorageKey = function (id, keys) {
        return id + "-" + JSON.stringify(keys);
    };
    StorageManager.storageProviderCallback = DefaultGetStorageProviderCallback;
    return StorageManager;
}());
export { StorageManager };

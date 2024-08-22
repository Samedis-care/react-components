import ModelDataStore from "../backend-integration/Store/index";
import debouncePromise from "../utils/debouncePromise";
export class StorageProvider {
}
export class LocalStorageProvider extends StorageProvider {
    PREFIX = "cc-lsp-";
    getItem(key) {
        return localStorage.getItem(this.PREFIX + key);
    }
    setItem(key, value) {
        if (value == null) {
            delete localStorage[this.PREFIX + key];
            return;
        }
        localStorage.setItem(this.PREFIX + key, value);
    }
    clear() {
        Object.keys(localStorage)
            .filter((e) => e.startsWith(this.PREFIX))
            .forEach((e) => delete localStorage[e]);
    }
}
export class SessionStorageProvider extends StorageProvider {
    PREFIX = "cc-ssp-";
    getItem(key) {
        return sessionStorage.getItem(this.PREFIX + key);
    }
    setItem(key, value) {
        if (value == null) {
            delete sessionStorage[this.PREFIX + key];
            return;
        }
        sessionStorage.setItem(this.PREFIX + key, value);
    }
    clear() {
        Object.keys(sessionStorage)
            .filter((e) => e.startsWith(this.PREFIX))
            .forEach((e) => delete sessionStorage[e]);
    }
}
export class CachedServerStorageProvider extends StorageProvider {
    /**
     * React-Query cache configuration. Defaults to 5 minute data caching
     * @protected
     */
    cacheOptions = {
        staleTime: 300000,
    };
    debounceTable = {};
    cleanupTable = {};
    async getItem(key) {
        try {
            return ModelDataStore.fetchQuery(["cc-css", key], () => this.getItemFromServer(key), this.cacheOptions);
        }
        catch {
            // on failure return null
            return null;
        }
    }
    async setItem(key, value) {
        if (key in this.debounceTable) {
            window.clearTimeout(this.cleanupTable[key]);
        }
        else {
            this.debounceTable[key] = debouncePromise((value) => ModelDataStore.executeMutation({
                mutationFn: () => this.setItemOnServer(key, value),
                mutationKey: ["cc-css-mt", key],
                onSuccess: () => {
                    ModelDataStore.setQueryData(["cc-css", key], () => value);
                },
            }), 1000);
        }
        window.setTimeout(this.cleanDebounce.bind(this), 300000, key);
        return this.debounceTable[key](value);
    }
    clear() {
        return ModelDataStore.executeMutation({
            mutationFn: () => this.clearFromServer(),
            mutationKey: "cc-css-clear",
            onSuccess: () => {
                ModelDataStore.removeQueries({
                    predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "cs-css",
                });
            },
        });
    }
    cleanDebounce(key) {
        delete this.debounceTable[key];
        delete this.cleanupTable[key];
    }
}
export const LocalStorageProviderInstance = new LocalStorageProvider();
export const SessionStorageProviderInstance = new SessionStorageProvider();
export const DefaultGetStorageProviderCallback = (id, keys) => [LocalStorageProviderInstance, keys];
export class StorageManager {
    static storageProviderCallback = DefaultGetStorageProviderCallback;
    /**
     * Configures storage manager
     * @param callback The callback which determines the storage used for the given storage types
     */
    static configure(callback) {
        this.storageProviderCallback = callback;
    }
    /**
     * Loads a record from storage
     * @param id Unique identifier, should be used to determine storage class
     * @param keys Identifiers which separate storage (think namespaces, such as tenant id)
     * @returns The value or null if not present
     */
    static getItem(id, keys) {
        const [storageProvider, keysToUse] = this.storageProviderCallback(id, {
            ...keys,
        });
        return storageProvider.getItem(this.buildStorageKey(id, keysToUse));
    }
    /**
     * Store a record in storage
     * @param id Unique identifier, should be used to determine storage class
     * @param keys Identifiers which separate storage (think namespaces, such as tenant id)
     * @param value To record to store
     */
    static setItem(id, keys, value) {
        const [storageProvider, keysToUse] = this.storageProviderCallback(id, {
            ...keys,
        });
        return storageProvider.setItem(this.buildStorageKey(id, keysToUse), value);
    }
    /**
     * Build a storage key to use with Storage Providers
     * @see GetStorageProviderCallback for params
     * @private
     */
    static buildStorageKey(id, keys) {
        return id + "-" + JSON.stringify(keys);
    }
}

import { hashKey } from "@tanstack/react-query";
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
    /**
     * Per key, the write setItem made last, until it has reached the server or
     * failed
     */
    lastWrites = new Map();
    /**
     * Reads the value of key through the react-query cache (see cacheOptions)
     * @param key The key to load
     * @returns The value the cache holds, synchronously, while it is fresh: read
     *          or written within cacheOptions.staleTime, and not invalidated
     *          since. Otherwise a promise of what the server holds. Either is
     *          null when the server has nothing stored. The promise rejects with
     *          getItemFromServer's error when the read fails; the next read asks
     *          the server again.
     */
    getItem(key) {
        const queryKey = ["cc-css", key];
        const options = {
            queryKey,
            queryFn: () => this.getItemFromServer(key),
            ...this.cacheOptions,
        };
        // a fresh value is answered at once (fresh as fetchQuery decides it), so
        // a reader that takes a synchronous answer, such as DataGrid's
        // StorageManagerPersist, has it in the same render
        const cached = ModelDataStore.getQueryCache().find({
            queryKey,
            exact: true,
        });
        if (cached) {
            const { staleTime } = ModelDataStore.defaultQueryOptions(options);
            const fresh = !cached.isStaleByTime(typeof staleTime === "function" ? staleTime(cached) : staleTime);
            // a fresh query always holds data
            if (fresh)
                return cached.state.data;
        }
        return ModelDataStore.fetchQuery(options);
    }
    /**
     * Writes the value of key: into the react-query cache at once, and to the
     * server after a second without further writes to the key, which sends the
     * value written last
     * @param key The key to write
     * @param value The value, or null to delete what is stored under the key
     * @returns A promise which resolves once the value is on the server, and
     *          rejects with setItemOnServer's error when the write fails
     * @remarks The writes of a key reach the server one after another, in the
     *          order they were made: a write waits until the key's write before
     *          it has succeeded or failed, so the server keeps the value written
     *          last also when it answers an earlier write late. Writes of other
     *          keys don't wait for each other.
     *          The next read answers the value written last, also before it
     *          reaches the server, as long as the cache holds it fresh (see
     *          getItem); a read already on its way to the server answers it
     *          too. When the write fails, the value is invalidated in the
     *          cache, so the next read asks the server what it holds. A write
     *          which settles after a newer value was written leaves the newer
     *          value in the cache.
     */
    async setItem(key, value) {
        const queryKey = ["cc-css", key];
        // a read on its way to the server would put the value from before back
        // into the cache: cancelled, it answers what the cache holds instead,
        // which is the value written
        void ModelDataStore.cancelQueries({ queryKey, exact: true });
        ModelDataStore.setQueryData(queryKey, () => value);
        this.lastWrites.set(key, { value });
        if (key in this.debounceTable) {
            window.clearTimeout(this.cleanupTable[key]);
        }
        else {
            this.debounceTable[key] = debouncePromise((value) => {
                // this sends the value setItem wrote last
                const write = this.lastWrites.get(key);
                // only the write made last updates the cache once it settles: a
                // newer value is in the cache already. Forgets the write if it is
                // the last one, and tells whether it was.
                const forgetIfLast = () => {
                    if (this.lastWrites.get(key) !== write)
                        return false;
                    this.lastWrites.delete(key);
                    return true;
                };
                const mutationKey = ["cc-css-mt", key];
                return ModelDataStore.getMutationCache()
                    .build(ModelDataStore, {
                    mutationFn: () => this.setItemOnServer(key, value),
                    mutationKey,
                    // the key's writes reach the server one after another: one the
                    // server answers late cannot replace a newer value there
                    scope: { id: hashKey(mutationKey) },
                    onSuccess: () => {
                        if (forgetIfLast())
                            ModelDataStore.setQueryData(["cc-css", key], () => value);
                    },
                    onError: () => {
                        // what the server holds is unknown, so the next read asks it
                        if (forgetIfLast())
                            void ModelDataStore.invalidateQueries({
                                queryKey: ["cc-css", key],
                                exact: true,
                                refetchType: "none",
                            });
                    },
                })
                    .execute({});
            }, 1000);
        }
        this.cleanupTable[key] = window.setTimeout(this.cleanDebounce.bind(this), 300000, key);
        return this.debounceTable[key](value);
    }
    clear() {
        return ModelDataStore.getMutationCache()
            .build(ModelDataStore, {
            mutationFn: () => this.clearFromServer(),
            mutationKey: ["cc-css-clear"],
            onSuccess: () => {
                ModelDataStore.removeQueries({
                    predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "cc-css",
                });
            },
        })
            .execute({});
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
     * @returns The value, or null only when nothing is stored: synchronously
     *          when the storage provider answers synchronously, else as a
     *          promise. Throws or rejects when the storage cannot be read (see
     *          StorageProvider.getItem).
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

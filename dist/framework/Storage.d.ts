import { CacheOptions } from "../backend-integration/Model/Model";
/**
 * Simple KV Storage
 */
export type StorageKeyType = string;
export type StorageValueType = string | null;
export declare abstract class StorageProvider {
    /**
     * Set item in key value store
     * @param key The key to set
     * @param value The value to write
     */
    abstract setItem(key: StorageKeyType, value: StorageValueType): Promise<void> | void;
    /**
     * Get item in key value store
     * @param key The key to load
     * @returns The stored value, or null only when nothing is stored under the
     *          key. Answer synchronously when the value is at hand (a browser
     *          storage, a cache), with a promise otherwise: a reader that takes
     *          a synchronous answer uses it in the same render, as DataGrid's
     *          StorageManagerPersist does, whose grids then open without a
     *          Loader. A read that fails (a server error, a timeout, offline, a
     *          blocked storage) throws or rejects instead: callers treat null
     *          as "nothing stored" and may write their defaults over the key,
     *          as DataGrid's StorageManagerPersist does.
     */
    abstract getItem(key: StorageKeyType): Promise<StorageValueType> | StorageValueType;
    /**
     * Clear all records from storage
     */
    abstract clear(): Promise<void> | void;
}
export declare class LocalStorageProvider extends StorageProvider {
    PREFIX: string;
    getItem(key: StorageKeyType): string | null;
    setItem(key: StorageKeyType, value: StorageValueType): void;
    clear(): void;
}
export declare class SessionStorageProvider extends StorageProvider {
    PREFIX: string;
    getItem(key: StorageKeyType): string | null;
    setItem(key: StorageKeyType, value: StorageValueType): void;
    clear(): void;
}
export declare abstract class CachedServerStorageProvider extends StorageProvider {
    /**
     * React-Query cache configuration. Defaults to 5 minute data caching
     * @protected
     */
    protected cacheOptions: CacheOptions;
    protected debounceTable: Record<StorageKeyType, (value: StorageValueType) => Promise<void>>;
    protected cleanupTable: Record<StorageKeyType, number>;
    /**
     * Per key, the write setItem made last, until it has reached the server or
     * failed
     */
    private lastWrites;
    /**
     * Receive value of key from server
     * @param key The key
     * @returns The stored value, or null only when the server has nothing
     *          stored under the key. Reject on every other failure: a null is
     *          cached as "nothing stored" (see cacheOptions) and returned by
     *          getItem, a rejection is not cached.
     * @protected
     */
    protected abstract getItemFromServer(key: StorageKeyType): Promise<string | null>;
    /**
     * Set value of key on server
     * @param key The key
     * @param value The value, or null to delete what is stored under the key
     * @returns A promise which resolves once the server has stored the value,
     *          and rejects when the write fails. The next write of the key waits
     *          for it to settle, so the writes of one key never overlap, and a
     *          promise which never settles holds back the key's later writes.
     * @protected
     */
    protected abstract setItemOnServer(key: StorageKeyType, value: StorageValueType): Promise<void>;
    /**
     * Delete all key value pairs from server
     * @protected
     */
    protected abstract clearFromServer(): Promise<void>;
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
    getItem(key: StorageKeyType): StorageValueType | Promise<StorageValueType>;
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
    setItem(key: StorageKeyType, value: StorageValueType): Promise<void>;
    clear(): Promise<void>;
    private cleanDebounce;
}
export declare const LocalStorageProviderInstance: LocalStorageProvider;
export declare const SessionStorageProviderInstance: SessionStorageProvider;
/**
 * Gets the storage provider to be used for the given parameters
 * @param id Unique identifier, should be used to determine storage class
 * @param keys Identifiers which separate storage (think namespaces, such as tenant id)
 * @returns The storage provider to use and the keys to use to create the final key used in the storage provider
 * @remarks You can add/remove keys to your liking. For example, you can add a tenant ID to make the record tenant specific.
 *          The record is stored under the id and the JSON of the keys, so their order is part of it: `{ a, b }` and `{ b, a }` are two records.
 */
export type GetStorageProviderCallback = (id: string, keys: Record<string, string>) => [StorageProvider, Record<string, string>];
export declare const DefaultGetStorageProviderCallback: GetStorageProviderCallback;
export declare class StorageManager {
    private static storageProviderCallback;
    /**
     * Configures storage manager
     * @param callback The callback which determines the storage used for the given storage types
     */
    static configure(callback: GetStorageProviderCallback): void;
    /**
     * Loads a record from storage
     * @param id Unique identifier, should be used to determine storage class
     * @param keys Identifiers which separate storage (think namespaces, such as tenant id)
     * @returns The value, or null only when nothing is stored: synchronously
     *          when the storage provider answers synchronously, else as a
     *          promise. Throws or rejects when the storage cannot be read (see
     *          StorageProvider.getItem).
     */
    static getItem(id: StorageKeyType, keys: Record<string, string>): Promise<StorageValueType> | StorageValueType;
    /**
     * Store a record in storage
     * @param id Unique identifier, should be used to determine storage class
     * @param keys Identifiers which separate storage (think namespaces, such as tenant id)
     * @param value To record to store
     */
    static setItem(id: StorageKeyType, keys: Record<string, string>, value: StorageValueType): Promise<void> | void;
    /**
     * Build a storage key to use with Storage Providers
     * @see GetStorageProviderCallback for params
     * @private
     */
    private static buildStorageKey;
}

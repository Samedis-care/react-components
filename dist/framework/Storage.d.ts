import { CacheOptions } from "../backend-integration/Model/Model";
/**
 * Simple KV Storage
 */
export declare type StorageKeyType = string;
export declare type StorageValueType = string | null;
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
     * @returns The stored value or null if nothing is stored
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
     * Receive value of key from server
     * @param key The key
     * @protected
     */
    protected abstract getItemFromServer(key: StorageKeyType): Promise<string | null>;
    /**
     * Set value of key on server
     * @param key The key
     * @param value The value
     * @protected
     */
    protected abstract setItemOnServer(key: StorageKeyType, value: StorageValueType): Promise<void>;
    /**
     * Delete all key value pairs from server
     * @protected
     */
    protected abstract clearFromServer(): Promise<void>;
    getItem(key: StorageKeyType): Promise<string | null>;
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
 */
export declare type GetStorageProviderCallback = (id: string, keys: Record<string, string>) => [StorageProvider, Record<string, string>];
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
     * @returns The value or null if not present
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

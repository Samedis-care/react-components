import type { QueryKey } from "@tanstack/react-query";
import { CacheOptions } from "../backend-integration/Model/Model";
import ModelDataStore from "../backend-integration/Store/index";
import debouncePromise from "../utils/debouncePromise";

/**
 * Simple KV Storage
 */

export type StorageKeyType = string;
export type StorageValueType = string | null;

export abstract class StorageProvider {
	/**
	 * Set item in key value store
	 * @param key The key to set
	 * @param value The value to write
	 */
	public abstract setItem(
		key: StorageKeyType,
		value: StorageValueType,
	): Promise<void> | void;

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
	public abstract getItem(
		key: StorageKeyType,
	): Promise<StorageValueType> | StorageValueType;

	/**
	 * Clear all records from storage
	 */
	public abstract clear(): Promise<void> | void;
}

export class LocalStorageProvider extends StorageProvider {
	PREFIX = "cc-lsp-";

	getItem(key: StorageKeyType): string | null {
		return localStorage.getItem(this.PREFIX + key);
	}

	setItem(key: StorageKeyType, value: StorageValueType): void {
		if (value == null) {
			delete localStorage[this.PREFIX + key];
			return;
		}
		localStorage.setItem(this.PREFIX + key, value);
	}

	clear(): void {
		Object.keys(localStorage)
			.filter((e) => e.startsWith(this.PREFIX))
			.forEach((e) => delete localStorage[e]);
	}
}

export class SessionStorageProvider extends StorageProvider {
	PREFIX = "cc-ssp-";

	getItem(key: StorageKeyType): string | null {
		return sessionStorage.getItem(this.PREFIX + key);
	}

	setItem(key: StorageKeyType, value: StorageValueType): void {
		if (value == null) {
			delete sessionStorage[this.PREFIX + key];
			return;
		}
		sessionStorage.setItem(this.PREFIX + key, value);
	}

	clear(): void {
		Object.keys(sessionStorage)
			.filter((e) => e.startsWith(this.PREFIX))
			.forEach((e) => delete sessionStorage[e]);
	}
}

export abstract class CachedServerStorageProvider extends StorageProvider {
	/**
	 * React-Query cache configuration. Defaults to 5 minute data caching
	 * @protected
	 */
	protected cacheOptions: CacheOptions = {
		staleTime: 300000,
	};

	protected debounceTable: Record<
		StorageKeyType,
		(value: StorageValueType) => Promise<void>
	> = {};
	protected cleanupTable: Record<StorageKeyType, number> = {};

	/**
	 * Receive value of key from server
	 * @param key The key
	 * @returns The stored value, or null only when the server has nothing
	 *          stored under the key. Reject on every other failure: a null is
	 *          cached as "nothing stored" (see cacheOptions) and returned by
	 *          getItem, a rejection is not cached.
	 * @protected
	 */
	protected abstract getItemFromServer(
		key: StorageKeyType,
	): Promise<string | null>;

	/**
	 * Set value of key on server
	 * @param key The key
	 * @param value The value
	 * @protected
	 */
	protected abstract setItemOnServer(
		key: StorageKeyType,
		value: StorageValueType,
	): Promise<void>;

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
	getItem(key: StorageKeyType): StorageValueType | Promise<StorageValueType> {
		const queryKey: QueryKey = ["cc-css", key];
		const options = {
			queryKey,
			queryFn: () => this.getItemFromServer(key),
			...this.cacheOptions,
		};
		// a fresh value is answered at once (fresh as fetchQuery decides it), so
		// a reader that takes a synchronous answer, such as DataGrid's
		// StorageManagerPersist, has it in the same render
		const cached = ModelDataStore.getQueryCache().find<string | null>({
			queryKey,
			exact: true,
		});
		if (cached) {
			const { staleTime } = ModelDataStore.defaultQueryOptions(options);
			const fresh = !cached.isStaleByTime(
				typeof staleTime === "function" ? staleTime(cached) : staleTime,
			);
			// a fresh query always holds data
			if (fresh) return cached.state.data as string | null;
		}
		return ModelDataStore.fetchQuery(options);
	}

	async setItem(key: StorageKeyType, value: StorageValueType): Promise<void> {
		if (key in this.debounceTable) {
			window.clearTimeout(this.cleanupTable[key]);
		} else {
			this.debounceTable[key] = debouncePromise(
				(value: StorageValueType) =>
					ModelDataStore.getMutationCache()
						.build(ModelDataStore, {
							mutationFn: () => this.setItemOnServer(key, value),
							mutationKey: ["cc-css-mt", key],
							onSuccess: () => {
								ModelDataStore.setQueryData(["cc-css", key], () => value);
							},
						})
						.execute({}),
				1000,
			);
		}
		this.cleanupTable[key] = window.setTimeout(
			this.cleanDebounce.bind(this),
			300000,
			key,
		);
		return this.debounceTable[key](value);
	}

	clear(): Promise<void> {
		return ModelDataStore.getMutationCache()
			.build(ModelDataStore, {
				mutationFn: () => this.clearFromServer(),
				mutationKey: ["cc-css-clear"],
				onSuccess: () => {
					ModelDataStore.removeQueries({
						predicate: (query) =>
							Array.isArray(query.queryKey) && query.queryKey[0] === "cc-css",
					});
				},
			})
			.execute({});
	}

	private cleanDebounce(key: string) {
		delete this.debounceTable[key];
		delete this.cleanupTable[key];
	}
}

export const LocalStorageProviderInstance = new LocalStorageProvider();
export const SessionStorageProviderInstance = new SessionStorageProvider();

/**
 * Gets the storage provider to be used for the given parameters
 * @param id Unique identifier, should be used to determine storage class
 * @param keys Identifiers which separate storage (think namespaces, such as tenant id)
 * @returns The storage provider to use and the keys to use to create the final key used in the storage provider
 * @remarks You can add/remove keys to your liking. For example, you can add a tenant ID to make the record tenant specific.
 *          The record is stored under the id and the JSON of the keys, so their order is part of it: `{ a, b }` and `{ b, a }` are two records.
 */
export type GetStorageProviderCallback = (
	id: string,
	keys: Record<string, string>,
) => [StorageProvider, Record<string, string>];

export const DefaultGetStorageProviderCallback: GetStorageProviderCallback = (
	id: string,
	keys: Record<string, string>,
) => [LocalStorageProviderInstance, keys];

export class StorageManager {
	private static storageProviderCallback: GetStorageProviderCallback =
		DefaultGetStorageProviderCallback;

	/**
	 * Configures storage manager
	 * @param callback The callback which determines the storage used for the given storage types
	 */
	public static configure(callback: GetStorageProviderCallback): void {
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
	public static getItem(
		id: StorageKeyType,
		keys: Record<string, string>,
	): Promise<StorageValueType> | StorageValueType {
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
	public static setItem(
		id: StorageKeyType,
		keys: Record<string, string>,
		value: StorageValueType,
	): Promise<void> | void {
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
	private static buildStorageKey(
		id: StorageKeyType,
		keys: Record<string, string>,
	): string {
		return id + "-" + JSON.stringify(keys);
	}
}

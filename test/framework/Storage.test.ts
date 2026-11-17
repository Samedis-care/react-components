import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
	CachedServerStorageProvider,
	LocalStorageProvider,
	SessionStorageProvider,
	StorageManager,
	DefaultGetStorageProviderCallback,
	LocalStorageProviderInstance,
	StorageKeyType,
} from "../../src/framework/Storage";
import ModelDataStore from "../../src/backend-integration/Store";

describe("LocalStorageProvider", () => {
	let provider: LocalStorageProvider;

	beforeEach(() => {
		provider = new LocalStorageProvider();
		localStorage.clear();
	});

	it("returns null for missing key", () => {
		expect(provider.getItem("nonexistent")).toBeNull();
	});

	it("stores and retrieves a value", () => {
		provider.setItem("key1", "value1");
		expect(provider.getItem("key1")).toBe("value1");
	});

	it("stores values with prefix", () => {
		provider.setItem("key1", "value1");
		expect(localStorage.getItem("cc-lsp-key1")).toBe("value1");
	});

	it("removes value when set to null", () => {
		provider.setItem("key1", "value1");
		provider.setItem("key1", null);
		expect(provider.getItem("key1")).toBeNull();
	});

	it("clears only prefixed keys", () => {
		provider.setItem("key1", "value1");
		provider.setItem("key2", "value2");
		localStorage.setItem("other-key", "other-value");

		provider.clear();

		expect(provider.getItem("key1")).toBeNull();
		expect(provider.getItem("key2")).toBeNull();
		expect(localStorage.getItem("other-key")).toBe("other-value");
	});
});

describe("SessionStorageProvider", () => {
	let provider: SessionStorageProvider;

	beforeEach(() => {
		provider = new SessionStorageProvider();
		sessionStorage.clear();
	});

	it("returns null for missing key", () => {
		expect(provider.getItem("nonexistent")).toBeNull();
	});

	it("stores and retrieves a value", () => {
		provider.setItem("key1", "value1");
		expect(provider.getItem("key1")).toBe("value1");
	});

	it("stores values with prefix", () => {
		provider.setItem("key1", "value1");
		expect(sessionStorage.getItem("cc-ssp-key1")).toBe("value1");
	});

	it("removes value when set to null", () => {
		provider.setItem("key1", "value1");
		provider.setItem("key1", null);
		expect(provider.getItem("key1")).toBeNull();
	});

	it("clears only prefixed keys", () => {
		provider.setItem("key1", "value1");
		provider.setItem("key2", "value2");
		sessionStorage.setItem("other-key", "other-value");

		provider.clear();

		expect(provider.getItem("key1")).toBeNull();
		expect(provider.getItem("key2")).toBeNull();
		expect(sessionStorage.getItem("other-key")).toBe("other-value");
	});
});

describe("DefaultGetStorageProviderCallback", () => {
	it("returns LocalStorageProviderInstance and the same keys", () => {
		const keys = { tenant: "abc" };
		const [storageProvider, returnedKeys] = DefaultGetStorageProviderCallback(
			"test-id",
			keys,
		);
		expect(storageProvider).toBe(LocalStorageProviderInstance);
		expect(returnedKeys).toBe(keys);
	});
});

describe("StorageManager", () => {
	beforeEach(() => {
		localStorage.clear();
		// Reset to default callback
		StorageManager.configure(DefaultGetStorageProviderCallback);
	});

	it("stores and retrieves a value using default provider", () => {
		const keys = { ns: "test" };
		void StorageManager.setItem("myId", keys, "myValue");
		expect(StorageManager.getItem("myId", keys)).toBe("myValue");
	});

	it("returns null for missing value", () => {
		expect(StorageManager.getItem("missing", {})).toBeNull();
	});

	it("uses custom storage provider via configure", () => {
		const sessionProvider = new SessionStorageProvider();
		StorageManager.configure((_id, keys) => [sessionProvider, keys]);

		const keys = { ns: "test" };
		void StorageManager.setItem("myId", keys, "sessionValue");
		expect(StorageManager.getItem("myId", keys)).toBe("sessionValue");

		// Verify it went to sessionStorage, not localStorage
		expect(localStorage.length).toBe(0);
	});

	it("builds storage key from id and keys", () => {
		const keys = { a: "1", b: "2" };
		void StorageManager.setItem("testId", keys, "val");

		// The key format is id + "-" + JSON.stringify(keys)
		const expectedKey = "cc-lsp-testId-" + JSON.stringify(keys);
		expect(localStorage.getItem(expectedKey)).toBe("val");
	});
});

describe("CachedServerStorageProvider", () => {
	class TestServerStorageProvider extends CachedServerStorageProvider {
		readFromServer = vi.fn<(key: StorageKeyType) => Promise<string | null>>();

		protected getItemFromServer(key: StorageKeyType): Promise<string | null> {
			return this.readFromServer(key);
		}

		protected setItemOnServer(): Promise<void> {
			return Promise.resolve();
		}

		protected clearFromServer(): Promise<void> {
			return Promise.resolve();
		}
	}

	afterEach(() => {
		// drops the cached reads together with their garbage collection timers
		ModelDataStore.clear();
	});

	it("[ISSUE-3496-ITEM-20] getItem resolves null when the server has nothing stored", async () => {
		const provider = new TestServerStorageProvider();
		provider.readFromServer.mockResolvedValue(null);

		await expect(provider.getItem("key")).resolves.toBeNull();
	});

	it("[ISSUE-3496-ITEM-20] getItem rejects with the server's error when the read fails, instead of reporting nothing stored", async () => {
		const provider = new TestServerStorageProvider();
		const error = new Error("500 Internal Server Error");
		provider.readFromServer.mockRejectedValue(error);

		await expect(provider.getItem("key")).rejects.toBe(error);
	});

	it("[ISSUE-3496-ITEM-20] a failed read is not remembered: the next read asks the server again and gets the stored value", async () => {
		const provider = new TestServerStorageProvider();
		provider.readFromServer
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce("stored");

		await expect(provider.getItem("key")).rejects.toThrow("offline");
		await expect(provider.getItem("key")).resolves.toBe("stored");
		expect(provider.readFromServer).toHaveBeenCalledTimes(2);
	});
});

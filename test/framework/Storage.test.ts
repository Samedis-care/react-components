import { describe, it, expect, beforeEach } from "vitest";
import {
	LocalStorageProvider,
	SessionStorageProvider,
	StorageManager,
	DefaultGetStorageProviderCallback,
	LocalStorageProviderInstance,
} from "../../src/framework/Storage";

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

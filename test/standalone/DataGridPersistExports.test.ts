import { describe, expect, expectTypeOf, it } from "vitest";
import type * as PackageRoot from "../../src";
import type { LocalStoragePersistProps } from "../../src/standalone/DataGrid/LocalStoragePersist";
import {
	DATA_GRID_STORAGE_KEY_COLUMN_SIZING,
	DATA_GRID_STORAGE_KEY_FILTERS,
	type StorageManagerPersistProps,
} from "../../src/standalone/DataGrid/StorageManagerPersist";
import type { NoPersistProps } from "../../src/standalone/DataGrid/NoPersist";
import {
	decodePersistedState,
	mergePersistedState,
	splitPersistedState,
	type DataGridDecodedState,
} from "../../src/standalone/DataGrid/PersistFormat";

describe("DataGrid persistence exports", () => {
	it("[ISSUE-3496-ITEM-18] exports the bucket ids and the persisted data helpers from the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		const expected: Record<string, unknown> = {
			// what StorageManager.configure routes DataGridStorageManagerPersist's
			// two buckets by
			DATA_GRID_STORAGE_KEY_COLUMN_SIZING,
			DATA_GRID_STORAGE_KEY_FILTERS,
			// what a custom provider splits and merges the stored state with
			splitPersistedState,
			mergePersistedState,
			// what reads stored data of any format ever written
			decodePersistedState,
		};
		for (const [name, value] of Object.entries(expected)) {
			expect(root[name], `${name} is missing from the package root`).toBe(
				value,
			);
		}
	}, 90000);

	it("[ISSUE-3496-ITEM-18] exports the providers' props types and the decoded state type from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.LocalStoragePersistProps>().toEqualTypeOf<LocalStoragePersistProps>();
		expectTypeOf<PackageRoot.StorageManagerPersistProps>().toEqualTypeOf<StorageManagerPersistProps>();
		expectTypeOf<PackageRoot.NoPersistProps>().toEqualTypeOf<NoPersistProps>();
		expectTypeOf<PackageRoot.DataGridDecodedState>().toEqualTypeOf<DataGridDecodedState>();
	});
});

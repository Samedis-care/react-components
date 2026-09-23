import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import useCrudSelect, {
	UseCrudSelectParams,
} from "../../../src/backend-components/Selector/useCrudSelect";
import { Connector, PageVisibility } from "../../../src/backend-integration";
import { BaseSelectorData } from "../../../src/standalone";
import CrudSelectError from "../../../src/backend-components/Selector/CrudSelectError";

afterEach(cleanup);

interface JoinData extends BaseSelectorData {
	/** extra per-join-record metadata collected on add */
	note?: string;
}

/**
 * Minimal in-memory connector that records create/update/delete calls so the
 * tests can assert which backend operations the hook triggered.
 */
const makeConnector = (initial: Record<string, unknown>[] = []) => {
	let nextId = 100;
	const create = vi.fn((data: Record<string, unknown>) => {
		const record = { ...data, id: String(nextId++) };
		return Promise.resolve([record, {}]);
	});
	const update = vi.fn((data: Record<string, unknown>) =>
		Promise.resolve([data, {}]),
	);
	const del = vi.fn(() => Promise.resolve(undefined));
	const index = vi.fn(() =>
		Promise.resolve([
			initial,
			{ totalRows: initial.length, filteredRows: initial.length },
		]),
	);
	const connector = {
		index,
		create,
		update,
		delete: del,
	} as unknown as Connector<string, PageVisibility, null>;
	return { connector, create, update, delete: del, index };
};

const baseParams = (
	connector: Connector<string, PageVisibility, null>,
	overrides: Partial<
		UseCrudSelectParams<string, PageVisibility, null, JoinData>
	>,
): UseCrudSelectParams<string, PageVisibility, null, JoinData> => ({
	connector,
	serialize: (data) => ({ source_id: data.value, note: data.note }),
	deserialize: (record) => ({
		value: record.id as string,
		label: "L" + (record.id as string),
		note: record.note as string | undefined,
	}),
	deserializeModel: (record) => ({
		label: "L" + (record.id as string),
		note: record.note as string | undefined,
	}),
	getIdOfData: (data) => data.value,
	...overrides,
});

const renderCrudSelect = (
	params: UseCrudSelectParams<string, PageVisibility, null, JoinData>,
) => renderHook(() => useCrudSelect(params, { current: null }));

describe("useCrudSelect prepareNewEntry", () => {
	it("augments a new entry before it is serialized/created", async () => {
		const { connector, create } = makeConnector();
		const serialize = vi.fn((data: JoinData): Record<string, unknown> => ({
			source_id: data.value,
			note: data.note,
		}));
		const prepareNewEntry = vi.fn((entry: JoinData) =>
			Promise.resolve({ ...entry, note: "2026-06-19" }),
		);

		const { result } = renderCrudSelect(
			baseParams(connector, { serialize, prepareNewEntry }),
		);
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.handleSelect(
				["a"],
				[{ value: "a", label: "Alpha" }],
			);
		});

		expect(prepareNewEntry).toHaveBeenCalledTimes(1);
		// serialize received the augmented entry
		expect(serialize).toHaveBeenCalledWith(
			expect.objectContaining({ value: "a", note: "2026-06-19" }),
		);
		expect(create).toHaveBeenCalledTimes(1);
		// augmentation reflected in selection (carried through serialize -> create -> deserialize)
		expect(result.current.selected).toHaveLength(1);
		expect(result.current.selected[0].note).toBe("2026-06-19");
		expect(result.current.error).toBeNull();
	});

	it("cancels an add cleanly when prepareNewEntry resolves null (no error, selection unchanged)", async () => {
		const { connector, create } = makeConnector();
		const prepareNewEntry = vi.fn(() => Promise.resolve(null));

		const { result } = renderCrudSelect(
			baseParams(connector, { prepareNewEntry }),
		);
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.handleSelect(
				["a"],
				[{ value: "a", label: "Alpha" }],
			);
		});

		expect(prepareNewEntry).toHaveBeenCalledTimes(1);
		expect(create).not.toHaveBeenCalled();
		expect(result.current.selected).toHaveLength(0);
		expect(result.current.error).toBeNull();
	});

	it("does NOT call prepareNewEntry for removals or updates", async () => {
		const {
			connector,
			update,
			delete: del,
		} = makeConnector([{ id: "1", note: "initial" }]);
		const prepareNewEntry = vi.fn((entry: JoinData) => Promise.resolve(entry));

		const { result } = renderCrudSelect(
			baseParams(connector, { prepareNewEntry }),
		);
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.selected).toHaveLength(1);

		// update the existing entry (changed metadata)
		await act(async () => {
			await result.current.handleSelect(
				["1"],
				[{ value: "1", label: "L1", note: "changed" }],
			);
		});
		expect(update).toHaveBeenCalledTimes(1);

		// remove the existing entry
		await act(async () => {
			await result.current.handleSelect([], []);
		});
		expect(del).toHaveBeenCalledTimes(1);

		expect(prepareNewEntry).not.toHaveBeenCalled();
		expect(result.current.error).toBeNull();
	});

	it("runs prepareNewEntry sequentially for batched adds (no overlap, input order preserved)", async () => {
		const { connector } = makeConnector();
		let active = 0;
		let maxActive = 0;
		const completionOrder: string[] = [];
		const prepareNewEntry = vi.fn(async (entry: JoinData) => {
			active++;
			maxActive = Math.max(maxActive, active);
			await new Promise((resolve) => setTimeout(resolve, 5));
			completionOrder.push(entry.value);
			active--;
			return entry;
		});

		const { result } = renderCrudSelect(
			baseParams(connector, { prepareNewEntry }),
		);
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.handleSelect(
				["a", "b", "c"],
				[
					{ value: "a", label: "Alpha" },
					{ value: "b", label: "Beta" },
					{ value: "c", label: "Gamma" },
				],
			);
		});

		expect(prepareNewEntry).toHaveBeenCalledTimes(3);
		// never two in flight at once
		expect(maxActive).toBe(1);
		// resolved in the same order they were added
		expect(completionOrder).toEqual(["a", "b", "c"]);
		expect(result.current.selected).toHaveLength(3);
	});

	it("is backwards compatible: omitting prepareNewEntry adds entries directly", async () => {
		const { connector, create } = makeConnector();

		const { result } = renderCrudSelect(baseParams(connector, {}));
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.handleSelect(
				["a"],
				[{ value: "a", label: "Alpha" }],
			);
		});

		expect(create).toHaveBeenCalledTimes(1);
		expect(result.current.selected).toHaveLength(1);
		expect(result.current.error).toBeNull();
	});

	it("modelToSelectorData assigns a stable (non-random) value to unpersisted entries", async () => {
		// Reproduces the removal bug: unpersisted entries used to get a fresh
		// `Math.random()` value on every rebuild, so handleSelect (which keys
		// new/changed/deleted off `value`) reclassified the survivors as new
		// and re-ran prepareNewEntry for each. The value must be stable.
		const { connector } = makeConnector();
		const { result } = renderCrudSelect(
			baseParams(connector, {
				// stable id derived from the record, not from `value`
				deserializeModel: (record) => ({
					label: "L" + (record.id as string),
					note: record.note as string | undefined,
				}),
				getIdOfData: (data) => data.label,
			}),
		);
		await waitFor(() => expect(result.current.loading).toBe(false));

		// same record id rebuilt twice -> identical value
		const a1 = await result.current.modelToSelectorData({ id: "7" });
		const a2 = await result.current.modelToSelectorData({ id: "7" });
		expect(a1.value).toBe(a2.value);
		expect(a1.value).toBe("to-create-L7");

		// different record id -> different value
		const b = await result.current.modelToSelectorData({ id: "8" });
		expect(b.value).not.toBe(a1.value);
	});

	it("surfaces a thrown error from prepareNewEntry via error state (genuine failure)", async () => {
		const { connector, create } = makeConnector();
		const prepareNewEntry = vi.fn(() =>
			Promise.reject(new Error("collection failed")),
		);

		const { result } = renderCrudSelect(
			baseParams(connector, { prepareNewEntry }),
		);
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.handleSelect(
				["a"],
				[{ value: "a", label: "Alpha" }],
			);
		});

		expect(create).not.toHaveBeenCalled();
		expect(result.current.error).toBeInstanceOf(Error);
		expect(result.current.error?.message).toBe("Alpha: collection failed");
		expect(result.current.selected).toHaveLength(0);
	});
});

describe("useCrudSelect partial failures", () => {
	const rejectFor =
		(badSourceIds: string[]) =>
		(connector: ReturnType<typeof makeConnector>) => {
			const original = connector.create.getMockImplementation()!;
			connector.create.mockImplementation((data: Record<string, unknown>) =>
				badSourceIds.includes(data.source_id as string)
					? Promise.reject(new Error("duplicate_key_error"))
					: original(data),
			);
		};

	it("keeps every create which went through when another one fails", async () => {
		const mock = makeConnector();
		rejectFor(["b"])(mock);

		const { result } = renderCrudSelect(baseParams(mock.connector, {}));
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.handleSelect(
				["a", "b", "c"],
				[
					{ value: "a", label: "Alpha" },
					{ value: "b", label: "Beta" },
					{ value: "c", label: "Gamma" },
				],
			);
		});

		expect(mock.create).toHaveBeenCalledTimes(3);
		expect(result.current.selected).toHaveLength(2);
		expect(result.current.initialRawData).toHaveLength(2);
		const error = result.current.error as CrudSelectError;
		expect(error).toBeInstanceOf(CrudSelectError);
		expect(error.failures).toHaveLength(1);
		expect(error.failures[0].action).toBe("create");
		expect(error.failures[0].entry.value).toBe("b");
		expect(error.message).toBe("Beta: duplicate_key_error");
	});

	it("reflects removals which went through when a create in the same change fails", async () => {
		const mock = makeConnector([{ id: "1" }, { id: "2" }]);
		rejectFor(["a"])(mock);

		const { result } = renderCrudSelect(baseParams(mock.connector, {}));
		await waitFor(() => expect(result.current.selected).toHaveLength(2));

		await act(async () => {
			await result.current.handleSelect(
				["2", "a"],
				[
					{ value: "2", label: "L2" },
					{ value: "a", label: "Alpha" },
				],
			);
		});

		expect(mock.delete).toHaveBeenCalledTimes(1);
		expect(result.current.selected.map((entry) => entry.value)).toEqual(["2"]);
		expect(result.current.error?.message).toBe("Alpha: duplicate_key_error");
	});

	it("keeps an entry selected when its removal is refused", async () => {
		const mock = makeConnector([{ id: "1" }, { id: "2" }]);
		mock.delete.mockImplementation(((id: string) =>
			id === "1"
				? Promise.reject(new Error("in use"))
				: Promise.resolve(undefined)) as () => Promise<undefined>);

		const { result } = renderCrudSelect(
			baseParams(mock.connector, {
				serialize: (data) => ({ id: data.value }),
			}),
		);
		await waitFor(() => expect(result.current.selected).toHaveLength(2));

		await act(async () => {
			await result.current.handleSelect([], []);
		});

		expect(mock.delete).toHaveBeenCalledTimes(2);
		expect(result.current.selected.map((entry) => entry.value)).toEqual(["1"]);
		const error = result.current.error as CrudSelectError;
		expect(error.failures.map((failure) => failure.action)).toEqual(["delete"]);
	});

	it("keeps the previous entry when its update is refused", async () => {
		const mock = makeConnector([{ id: "1", note: "initial" }]);
		mock.update.mockImplementation(() => Promise.reject(new Error("locked")));

		const { result } = renderCrudSelect(baseParams(mock.connector, {}));
		await waitFor(() => expect(result.current.selected).toHaveLength(1));

		await act(async () => {
			await result.current.handleSelect(
				["1"],
				[{ value: "1", label: "L1", note: "changed" }],
			);
		});

		expect(result.current.selected[0].note).toBe("initial");
		expect(result.current.error?.message).toBe("L1: locked");
	});

	it("clears the error once a later change goes through", async () => {
		const mock = makeConnector();
		rejectFor(["b"])(mock);

		const { result } = renderCrudSelect(baseParams(mock.connector, {}));
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.handleSelect(["b"], [{ value: "b", label: "Beta" }]);
		});
		expect(result.current.error).not.toBeNull();

		await act(async () => {
			await result.current.handleSelect(
				["a"],
				[{ value: "a", label: "Alpha" }],
			);
		});
		expect(result.current.error).toBeNull();
		expect(result.current.selected).toHaveLength(1);
	});
});

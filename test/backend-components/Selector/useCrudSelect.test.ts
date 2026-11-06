import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import useCrudSelect, {
	CrudSelectDispatch,
	UseCrudSelectParams,
} from "../../../src/backend-components/Selector/useCrudSelect";
import { Connector, ModelUnknown } from "../../../src/backend-integration";
import { BaseSelectorData, getStringLabel } from "../../../src/standalone";
import PartialApplyError from "../../../src/backend-components/Form/PartialApplyError";

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
	} as unknown as Connector;
	return { connector, create, update, delete: del, index };
};

const baseParams = (
	connector: Connector,
	overrides: Partial<UseCrudSelectParams<ModelUnknown, JoinData>>,
): UseCrudSelectParams<ModelUnknown, JoinData> => ({
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
	params: UseCrudSelectParams<ModelUnknown, JoinData>,
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
				getIdOfData: (data) => getStringLabel(data),
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
		const error = result.current.error as PartialApplyError<JoinData>;
		expect(error).toBeInstanceOf(PartialApplyError);
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
		const error = result.current.error as PartialApplyError<JoinData>;
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

// ---------------------------------------------------------------------------
// A join collection as the apps have it: rows { id, source_id, note } behind the
// connector, entries whose value is the row id and whose getIdOfData is the
// looked-up record's id (source_id), new entries with value "to-create-<source>".
// Every request is logged ("create:s1", "update:j1:b", "delete:j1"); a delete of
// a row that is gone is refused like a 404. Creates and deletes can be held in
// flight to overlap two changes.
// ---------------------------------------------------------------------------

interface SourceJoinData extends BaseSelectorData {
	source_id: string;
	note?: string;
}

const makeBackend = (initial: Record<string, unknown>[] = []) => {
	const rows = new Map<string, Record<string, unknown>>();
	initial.forEach((row) => rows.set(row.id as string, { ...row }));
	let nextId = 100;
	const calls: string[] = [];
	const gates: { create?: Promise<void>; delete?: Promise<void> } = {};
	let createsInFlight = 0;
	let maxCreatesInFlight = 0;
	const create = vi.fn(async (data: Record<string, unknown>) => {
		createsInFlight++;
		maxCreatesInFlight = Math.max(maxCreatesInFlight, createsInFlight);
		if (gates.create) await gates.create;
		createsInFlight--;
		calls.push("create:" + String(data.source_id));
		const record = { ...data, id: String(nextId++) };
		rows.set(record.id, record);
		return [record, {}];
	});
	const update = vi.fn((data: Record<string, unknown>) => {
		calls.push("update:" + String(data.id) + ":" + String(data.note));
		rows.set(data.id as string, { ...rows.get(data.id as string), ...data });
		return Promise.resolve([data, {}]);
	});
	const del = vi.fn(async (id: string) => {
		if (gates.delete) await gates.delete;
		calls.push("delete:" + String(id));
		if (!rows.has(id)) throw new Error("not found " + String(id));
		rows.delete(id);
	});
	const index = vi.fn(() => {
		const list = Array.from(rows.values()).map((row) => ({ ...row }));
		return Promise.resolve([
			list,
			{ totalRows: list.length, filteredRows: list.length },
		]);
	});
	/** holds every create (or delete) until the returned function is called */
	const hold = (kind: "create" | "delete") => {
		let release!: () => void;
		gates[kind] = new Promise<void>((resolve) => (release = resolve));
		return () => {
			gates[kind] = undefined;
			release();
		};
	};
	return {
		connector: { index, create, update, delete: del } as unknown as Connector,
		rows,
		calls,
		create,
		update,
		del,
		index,
		hold,
		maxCreatesInFlight: () => maxCreatesInFlight,
	};
};
type Backend = ReturnType<typeof makeBackend>;

// a new entry has no row id yet: leave it out, the backend assigns it
const joinSerialize = (data: SourceJoinData) => ({
	id: data.value.startsWith("to-create-") ? undefined : data.value,
	source_id: data.source_id,
	note: data.note,
});
const joinDeserialize = (record: Record<string, unknown>): SourceJoinData => ({
	value: record.id as string,
	label: "L" + String(record.source_id),
	source_id: record.source_id as string,
	note: record.note as string | undefined,
});
const joinParams = (
	connector: Connector,
	overrides: Partial<UseCrudSelectParams<ModelUnknown, SourceJoinData>> = {},
): UseCrudSelectParams<ModelUnknown, SourceJoinData> => ({
	connector,
	serialize: joinSerialize,
	deserialize: joinDeserialize,
	deserializeModel: (record) => ({
		label: "L" + String(record.id),
		source_id: record.id as string,
	}),
	getIdOfData: (data) => data.source_id,
	...overrides,
});
/** a search result picked in the field, as modelToSelectorData builds it */
const pick = (source: string): SourceJoinData => ({
	value: "to-create-" + source,
	label: "L" + source,
	source_id: source,
});
const values = (entries: BaseSelectorData[]) =>
	entries.map((entry) => entry.value);

const mountJoins = (
	be: Backend,
	overrides: Partial<UseCrudSelectParams<ModelUnknown, SourceJoinData>> = {},
) => {
	const ref = React.createRef<CrudSelectDispatch<SourceJoinData>>();
	const hook = renderHook(() =>
		useCrudSelect(joinParams(be.connector, overrides), ref),
	);
	return { ref, ...hook };
};

/**
 * Starts addToSelection in a sync act and returns its promise, to be awaited
 * outside of act: the queue is worked by an effect, which only runs once the act
 * scope is flushed, so awaiting it inside an async act never resolves
 */
const startAdd = (
	ref: React.RefObject<CrudSelectDispatch<SourceJoinData> | null>,
	entry: SourceJoinData,
) => {
	let pending!: Promise<void>;
	act(() => {
		pending = ref.current!.addToSelection(entry);
	});
	return pending;
};

/** lets pending promise callbacks and the state updates they cause run */
const flush = async () => {
	await act(async () => {});
	await act(async () => {});
};

// ---------------------------------------------------------------------------
// Bugs: these assert the correct behavior and fail until the entry in BUGS.md
// is fixed
// ---------------------------------------------------------------------------

describe("useCrudSelect bugs", () => {
	it("[ISSUE-3509-ITEM-3] a create that went through stays listed when deserializing its response fails", async () => {
		const be = makeBackend();
		let failDeserialize = false;
		const { result } = mountJoins(be, {
			deserialize: (record) =>
				failDeserialize
					? Promise.reject(new Error("lookup failed"))
					: joinDeserialize(record),
		});
		await waitFor(() => expect(result.current.loading).toBe(false));
		failDeserialize = true;
		await act(async () => {
			await result.current.handleSelect(["to-create-s1"], [pick("s1")]);
		});
		expect(be.calls).toEqual(["create:s1"]);
		// the row exists in the backend: it is listed, so it can be removed and is not picked again
		expect(values(result.current.selected)).toEqual(["100"]);
	});

	it("[ISSUE-3509-ITEM-3] a deserialize that fails after a create went through is reported as a read of the listed entry, not as a failed create", async () => {
		const be = makeBackend();
		const createImpl = be.create.getMockImplementation()!;
		be.create.mockImplementation((data: Record<string, unknown>) =>
			data.source_id === "s3"
				? Promise.reject(new Error("refused"))
				: createImpl(data),
		);
		const { result } = mountJoins(be, {
			deserialize: (record) =>
				record.source_id === "s2"
					? Promise.reject(new Error("lookup failed"))
					: joinDeserialize(record),
		});
		await waitFor(() => expect(result.current.loading).toBe(false));
		await act(async () => {
			await result.current.handleSelect(
				["to-create-s1", "to-create-s2", "to-create-s3"],
				[pick("s1"), pick("s2"), pick("s3")],
			);
		});
		expect(be.calls).toEqual(["create:s1", "create:s2"]);
		// s2 is listed as it was picked, under the id of its row
		expect(result.current.selected).toEqual([
			joinDeserialize({ id: "100", source_id: "s1" }),
			{ ...pick("s2"), value: "101" },
		]);
		expect(result.current.initialRawData.map((record) => record.id)).toEqual([
			"100",
			"101",
		]);
		const error = result.current.error as PartialApplyError<SourceJoinData>;
		expect(error).toBeInstanceOf(PartialApplyError);
		expect(
			error.failures.map(
				(failure) => failure.action + ":" + failure.entry.value,
			),
		).toEqual(["create:to-create-s3", "read:101"]);
		expect(error.failures[1].entry).toBe(result.current.selected[1]);
		expect(error.failures[1].error.message).toBe("lookup failed");
		expect(error.message).toBe("Ls3: refused; Ls2: lookup failed");
	});

	it("[ISSUE-3509-ITEM-3] the field is handed the listed entry for a row whose deserialize failed, and removing it deletes the row", async () => {
		const be = makeBackend();
		const deserialize = vi.fn(() =>
			Promise.reject<SourceJoinData>(new Error("lookup failed")),
		);
		const { result } = mountJoins(be, { deserialize });
		await waitFor(() => expect(result.current.loading).toBe(false));
		await act(async () => {
			await result.current.handleSelect(["to-create-s1"], [pick("s1")]);
		});
		const [listed] = result.current.selected;
		// the field builds the entries of the rows through modelToSelectorData
		await expect(
			result.current.modelToSelectorData(result.current.initialRawData[0]),
		).resolves.toBe(listed);
		expect(deserialize).toHaveBeenCalledTimes(1);
		await act(async () => {
			await result.current.handleSelect([], []);
		});
		expect(be.calls).toEqual(["create:s1", "delete:100"]);
		expect(result.current.selected).toEqual([]);
		expect(result.current.error).toBeNull();
	});

	it("[ISSUE-3509-ITEM-3] addToSelection lists a create whose response cannot be deserialized, and rejects with the read failure", async () => {
		const be = makeBackend();
		const { ref, result } = mountJoins(be, {
			deserialize: () => Promise.reject(new Error("lookup failed")),
		});
		await waitFor(() => expect(result.current.loading).toBe(false));
		const outcome = await startAdd(ref, pick("s1")).then(
			() => null,
			(e: unknown) => e,
		);
		await flush();
		expect(outcome).toBeInstanceOf(PartialApplyError);
		const error = outcome as PartialApplyError<SourceJoinData>;
		expect(error.failures.map((failure) => failure.action)).toEqual(["read"]);
		expect(error.failures[0].entry).toBe(result.current.selected[0]);
		expect(values(result.current.selected)).toEqual(["100"]);
		expect(result.current.initialRawData.map((record) => record.id)).toEqual([
			"100",
		]);
		await expect(
			result.current.modelToSelectorData(result.current.initialRawData[0]),
		).resolves.toBe(result.current.selected[0]);
		// it is listed, so adding it again is skipped
		await startAdd(ref, pick("s1"));
		await flush();
		expect(be.calls).toEqual(["create:s1"]);
	});
});

describe("useCrudSelect: a disabled control", () => {
	const mountDisabled = (be: Backend) => {
		const ref = React.createRef<CrudSelectDispatch<SourceJoinData>>();
		const hook = renderHook(
			({ disabled }: { disabled: boolean }) =>
				useCrudSelect(joinParams(be.connector, { disabled }), ref),
			{ initialProps: { disabled: true } },
		);
		return { ref, ...hook };
	};

	it("[ISSUE-3505-ITEM-5] writes nothing: handleSelect ignores picks, updates and removals, and addToSelection rejects", async () => {
		const be = makeBackend([{ id: "j1", source_id: "s1", note: "a" }]);
		const { ref, result } = mountDisabled(be);
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.disabled).toBe(true);

		await act(async () => {
			await result.current.handleSelect(
				["j1", "to-create-s2"],
				[{ ...result.current.selected[0], note: "b" }, pick("s2")],
			);
		});
		await act(async () => {
			await result.current.handleSelect([], []);
		});
		const outcome = await startAdd(ref, pick("s3")).then(
			() => null,
			(e: unknown) => e,
		);
		await flush();

		expect(outcome).toBeInstanceOf(Error);
		expect(be.calls).toEqual([]);
		expect(values(result.current.selected)).toEqual(["j1"]);
		expect(result.current.selected[0].note).toBe("a");
		expect(result.current.error).toBeNull();
	});

	it("[ISSUE-3505-ITEM-5] takes writes again once it is enabled", async () => {
		const be = makeBackend([{ id: "j1", source_id: "s1" }]);
		const { ref, result, rerender } = mountDisabled(be);
		await waitFor(() => expect(result.current.loading).toBe(false));

		rerender({ disabled: false });
		expect(result.current.disabled).toBe(false);
		await startAdd(ref, pick("s2"));
		await flush();
		await act(async () => {
			await result.current.handleSelect(
				[result.current.selected[1].value],
				[result.current.selected[1]],
			);
		});

		expect(be.calls).toEqual(["create:s2", "delete:j1"]);
		expect(values(result.current.selected)).toEqual(["100"]);
	});

	it("[ISSUE-3505-ITEM-5] still lists its initialSelected", async () => {
		const be = makeBackend();
		const { result } = renderHook(() =>
			useCrudSelect(
				joinParams(be.connector, {
					disabled: true,
					initialSelected: [pick("s1")],
				}),
				{ current: null },
			),
		);
		await waitFor(() => expect(result.current.loading).toBe(false));
		await flush();

		expect(result.current.selected.map((entry) => entry.label)).toEqual([
			"Ls1",
		]);
	});
});

import { describe, expect, it, vi, type Mock } from "vitest";
import LazyConnector from "../../src/backend-integration/Connector/LazyConnector";
import type ApiConnector from "../../src/backend-integration/Connector/ApiConnector";
import type { AdvancedDeleteRequest } from "../../src/backend-integration/Model/Model";
import NetworkError from "../../src/backend-integration/Connector/NetworkError";
import BackendError from "../../src/backend-integration/Connector/BackendError";
import { defaultShouldReportError } from "../../src/framework/ErrorReporting";

/**
 * The subset of the real connector the queue ever calls, so that a test can see exactly
 * which requests would be sent once the queue is worked
 */
const makeRealConnector = () => {
	const calls: string[] = [];
	const connector = {
		create: vi.fn((data: Record<string, unknown>) => {
			calls.push(`create:${String(data.name)}`);
			return Promise.resolve([{ id: `real-${String(data.name)}` }, {}]);
		}),
		delete: vi.fn((id: string) => {
			calls.push(`delete:${id}`);
			return Promise.resolve();
		}),
		deleteMultiple: vi.fn((ids: string[]) => {
			calls.push(`deleteMultiple:${ids.join("+")}`);
			return Promise.resolve();
		}),
		index: vi.fn(() =>
			Promise.resolve([[], { totalRows: 0, filteredRows: 0 }]),
		),
		read: vi.fn(),
		update: vi.fn(),
		setApiEndpoint: vi.fn(),
	} as unknown as ApiConnector;
	return { connector, calls };
};

const makeLazy = () => {
	const { connector, calls } = makeRealConnector();
	return {
		lazy: new LazyConnector(connector, true),
		calls,
	};
};

/**
 * A connector whose index actually returns rows, so the enhancement pass has something to
 * enhance. fakeReads false is what a form uses for an existing record: reads go to the
 * backend, writes are queued.
 */
const makeLazyOver = (rows: Record<string, unknown>[]) => {
	const { connector, calls } = makeRealConnector();
	(connector as unknown as { index: () => Promise<unknown> }).index = vi.fn(
		() =>
			Promise.resolve([
				rows.map((row) => ({ ...row })),
				{ totalRows: rows.length, filteredRows: rows.length },
			]),
	);
	return {
		lazy: new LazyConnector(connector, false),
		calls,
	};
};

describe("LazyConnector index enhancement", () => {
	it("hides a queued delete, and takes the row counts with it", async () => {
		const { lazy } = makeLazyOver([{ id: "a" }, { id: "b" }, { id: "c" }]);
		lazy.delete("b", undefined);

		const [rows, meta] = await lazy.index(undefined, undefined);
		expect(rows.map((row) => row.id)).toStrictEqual(["a", "c"]);
		expect(meta.totalRows).toBe(2);
		expect(meta.filteredRows).toBe(2);
	});

	it("hides every id of a queued deleteMultiple", async () => {
		const { lazy } = makeLazyOver([{ id: "a" }, { id: "b" }, { id: "c" }]);
		lazy.deleteMultiple(["a", "c"], undefined);

		const [rows, meta] = await lazy.index(undefined, undefined);
		expect(rows.map((row) => row.id)).toStrictEqual(["b"]);
		expect(meta.totalRows).toBe(1);
	});

	it("hands back what it hid, so a pending removal can still be shown", async () => {
		const { lazy } = makeLazyOver([{ id: "a" }, { id: "b" }]);
		lazy.delete("b", undefined);

		// nothing is remembered before an index call has hidden anything
		expect(lazy.getQueuedDeleteRecords()).toStrictEqual([]);
		await lazy.index(undefined, undefined);
		expect(lazy.getQueuedDeleteRecords()).toStrictEqual([{ id: "b" }]);
	});

	it("forgets what it hid when the delete is cancelled", async () => {
		const { lazy } = makeLazyOver([{ id: "a" }, { id: "b" }, { id: "c" }]);
		lazy.deleteMultiple(["b", "c"], undefined);
		await lazy.index(undefined, undefined);
		expect(lazy.getQueuedDeleteRecords()).toStrictEqual([
			{ id: "b" },
			{ id: "c" },
		]);

		// cancelling one narrows the entry, and with it what it remembers
		lazy.cancelQueuedOperation("b");
		expect(lazy.getQueuedDeleteRecords()).toStrictEqual([{ id: "c" }]);

		// cancelling the last drops the entry altogether
		lazy.cancelQueuedOperation("c");
		expect(lazy.getQueuedDeleteRecords()).toStrictEqual([]);
	});

	it("forgets what it hid once the delete has been worked", async () => {
		const { lazy } = makeLazyOver([{ id: "a" }, { id: "b" }]);
		lazy.delete("b", undefined);
		await lazy.index(undefined, undefined);
		await lazy.workQueue();

		expect(lazy.getQueuedDeleteRecords()).toStrictEqual([]);
	});

	it("leaves the rows alone once the delete has been worked", async () => {
		const { lazy } = makeLazyOver([{ id: "a" }, { id: "b" }]);
		lazy.delete("b", undefined);
		await lazy.workQueue();

		// the backend index is the mock's, which still reports both: what matters is
		// that the queue no longer subtracts anything on top of it
		const [rows, meta] = await lazy.index(undefined, undefined);
		expect(rows.map((row) => row.id)).toStrictEqual(["a", "b"]);
		expect(meta.totalRows).toBe(2);
	});
});

describe("LazyConnector queue introspection", () => {
	it("reports a queued create for the fake id it handed out", () => {
		const { lazy } = makeLazy();
		const [created] = lazy.create({ name: "a" }, undefined);
		const fakeId = (created as Record<"id", string>).id;

		expect(lazy.getQueuedOperation(fakeId)).toBe("create");
		expect(lazy.getQueuedOperation("some-other-id")).toBe(null);
	});

	it("reports a queued delete, for a single id and within a batch", () => {
		const { lazy } = makeLazy();
		lazy.delete("solo", undefined);
		lazy.deleteMultiple(["a", "b"], undefined);

		expect(lazy.getQueuedOperation("solo")).toBe("delete");
		expect(lazy.getQueuedOperation("a")).toBe("delete");
		expect(lazy.getQueuedOperation("b")).toBe("delete");
		expect(lazy.getQueuedOperation("c")).toBe(null);
	});

	it("reports nothing once the queue has been worked", async () => {
		const { lazy } = makeLazy();
		lazy.delete("gone", undefined);
		await lazy.workQueue();

		expect(lazy.getQueuedOperation("gone")).toBe(null);
		expect(lazy.isQueueEmpty()).toBe(true);
	});
});

describe("LazyConnector.cancelQueuedOperation", () => {
	it("drops a single id delete and sends nothing", async () => {
		const { lazy, calls } = makeLazy();
		lazy.delete("solo", undefined);

		expect(lazy.cancelQueuedOperation("solo")).toBe(true);
		expect(lazy.getQueuedOperation("solo")).toBe(null);
		await lazy.workQueue();
		expect(calls).toEqual([]);
	});

	it("keeps the other ids of a batched delete", async () => {
		const { lazy, calls } = makeLazy();
		lazy.deleteMultiple(["a", "b", "c"], undefined);

		expect(lazy.cancelQueuedOperation("b")).toBe(true);
		expect(lazy.getQueuedOperation("b")).toBe(null);
		expect(lazy.getQueuedOperation("a")).toBe("delete");
		expect(lazy.getQueuedOperation("c")).toBe("delete");

		await lazy.workQueue();
		// the request that actually goes out no longer mentions b
		expect(calls).toEqual(["deleteMultiple:a+c"]);
	});

	it("drops a batched delete entirely once every id is cancelled", async () => {
		const { lazy, calls } = makeLazy();
		lazy.deleteMultiple(["a", "b"], undefined);

		expect(lazy.cancelQueuedOperation("a")).toBe(true);
		expect(lazy.cancelQueuedOperation("b")).toBe(true);
		expect(lazy.isQueueEmpty()).toBe(true);
		await lazy.workQueue();
		expect(calls).toEqual([]);
	});

	it("undoes a queued create", async () => {
		const { lazy, calls } = makeLazy();
		const [created] = lazy.create({ name: "a" }, undefined);
		const fakeId = (created as Record<"id", string>).id;

		expect(lazy.cancelQueuedOperation(fakeId)).toBe(true);
		expect(lazy.getQueuedOperation(fakeId)).toBe(null);
		await lazy.workQueue();
		expect(calls).toEqual([]);
	});

	it("finds a delete queued for a record the caller still knows by its fake id", async () => {
		const { lazy, calls } = makeLazy();
		// batch one: create, submit. The caller keeps the fake id - nothing hands it the
		// real one, and index() maps real ids back to fake ones anyway.
		const [created] = lazy.create({ name: "a" }, undefined);
		const fakeId = (created as Record<"id", string>).id;
		await lazy.workQueue();
		expect(calls).toEqual(["create:a"]);

		// batch two, same form still open: remove that file by the id the caller holds
		lazy.deleteMultiple([fakeId], undefined);

		expect(lazy.getQueuedOperation(fakeId)).toBe("delete");
		expect(lazy.cancelQueuedOperation(fakeId)).toBe(true);
		expect(lazy.isQueueEmpty()).toBe(true);
	});

	it("reports false and changes nothing for an id it does not hold", () => {
		const { lazy } = makeLazy();
		lazy.delete("kept", undefined);

		expect(lazy.cancelQueuedOperation("unknown")).toBe(false);
		expect(lazy.getQueuedOperation("kept")).toBe("delete");
	});

	it("notifies the queue change handler when it cancels, and only then", () => {
		const { connector } = makeRealConnector();
		const onQueueChange = vi.fn();
		const lazy = new LazyConnector(connector, true, onQueueChange);
		lazy.delete("solo", undefined);
		onQueueChange.mockClear();

		expect(lazy.cancelQueuedOperation("unknown")).toBe(false);
		expect(onQueueChange).not.toHaveBeenCalled();

		expect(lazy.cancelQueuedOperation("solo")).toBe(true);
		expect(onQueueChange).toHaveBeenCalledTimes(1);
		expect(onQueueChange.mock.calls[0][0]).toEqual([]);
	});
});

describe("LazyConnector workQueue", () => {
	/**
	 * A connector whose writes fail for whatever it is told to refuse: a create or an update
	 * by the name it carries, a delete by its id
	 */
	const makeRefusingConnector = (refused: string[]) => {
		const { connector, calls } = makeRealConnector();
		const real = connector as unknown as {
			create: (data: Record<string, unknown>) => Promise<unknown>;
			update: (data: Record<string, unknown>) => Promise<unknown>;
			delete: (id: string) => Promise<unknown>;
		};
		real.create = vi.fn((data: Record<string, unknown>) => {
			const name = String(data.name);
			calls.push(`create:${name}`);
			return refused.includes(name)
				? Promise.reject(new Error(`create of ${name} refused`))
				: Promise.resolve([{ id: `real-${name}` }, {}]);
		});
		real.update = vi.fn((data: Record<string, unknown>) => {
			const name = String(data.name);
			calls.push(`update:${String(data.id)}:${name}`);
			return refused.includes(name)
				? Promise.reject(new Error(`update to ${name} refused`))
				: Promise.resolve([data, {}]);
		});
		real.delete = vi.fn((id: string) => {
			calls.push(`delete:${id}`);
			return refused.includes(id)
				? Promise.reject(new Error(`delete of ${id} refused`))
				: Promise.resolve();
		});
		return {
			lazy: new LazyConnector(connector, true),
			calls,
		};
	};

	it("[ISSUE-3505-ITEM-11] sends the creates and updates queued after a refused write, and keeps only the refused ones", async () => {
		const { lazy, calls } = makeRefusingConnector(["b", "x2", "d"]);
		lazy.create({ name: "a" }, undefined);
		lazy.create({ name: "b" }, undefined);
		void lazy.update({ id: "x", name: "x2" }, undefined);
		lazy.create({ name: "c" }, undefined);
		lazy.create({ name: "d" }, undefined);
		void lazy.update({ id: "y", name: "y2" }, undefined);

		await expect(lazy.workQueue()).rejects.toThrow("refused");

		expect(calls).toStrictEqual([
			"create:a",
			"create:b",
			"update:x:x2",
			"create:c",
			"create:d",
			"update:y:y2",
		]);
		expect(
			["fake-id-0", "fake-id-1", "x", "fake-id-2", "fake-id-3", "y"].map((id) =>
				lazy.getQueuedOperation(id),
			),
		).toStrictEqual([null, "create", "update", null, "create", null]);
	});

	it("[ISSUE-3505-ITEM-11] holds back the deletes queued after a refused write until it went through, and sends the ones queued before it", async () => {
		const refused = ["bad"];
		const { lazy, calls } = makeRefusingConnector(refused);
		lazy.delete("before", undefined);
		lazy.create({ name: "bad" }, undefined);
		lazy.delete("after", undefined);
		lazy.deleteMultiple(["after2", "after3"], undefined);
		lazy.create({ name: "c" }, undefined);

		await expect(lazy.workQueue()).rejects.toThrow("create of bad refused");
		const firstSave = [...calls];
		const held = ["after", "after2", "after3"].map((id) =>
			lazy.getQueuedOperation(id),
		);
		// the backend takes it the second time
		refused.length = 0;
		calls.length = 0;
		await lazy.workQueue();

		// a delete may be the second half of a replacement, which must not go while the
		// record that replaces it is not stored
		expect(firstSave).toStrictEqual([
			"delete:before",
			"create:bad",
			"create:c",
		]);
		expect(held).toStrictEqual(["delete", "delete", "delete"]);
		expect(calls).toStrictEqual([
			"create:bad",
			"delete:after",
			"deleteMultiple:after2+after3",
		]);
		expect(lazy.isQueueEmpty()).toBe(true);
	});

	it("[ISSUE-3505-ITEM-11] rejects with the refusal itself when one write was refused, and with an AggregateError of all of them when several were", async () => {
		const one = makeRefusingConnector(["b"]);
		one.lazy.create({ name: "a" }, undefined);
		one.lazy.create({ name: "b" }, undefined);
		const several = makeRefusingConnector(["b", "x2"]);
		several.lazy.create({ name: "b" }, undefined);
		void several.lazy.update({ id: "x", name: "x2" }, undefined);

		const single = await one.lazy.workQueue().catch((e: unknown) => e);
		const aggregate = await several.lazy.workQueue().catch((e: unknown) => e);

		expect(single).not.toBeInstanceOf(AggregateError);
		expect((single as Error).message).toBe("create of b refused");
		expect(aggregate).toBeInstanceOf(AggregateError);
		expect((aggregate as AggregateError).message).toBe(
			"create of b refused; update to x2 refused",
		);
		expect(
			(aggregate as AggregateError).errors.map((e: Error) => e.message),
		).toStrictEqual(["create of b refused", "update to x2 refused"]);
	});

	it("[ISSUE-3505-ITEM-11] rejects with the error the error factory makes of the refused writes, which carry the ids index hands out", async () => {
		const refused: string[] = [];
		const { lazy } = makeRefusingConnector(refused);
		// created by an earlier save, so the backend has its own id for it
		const [created] = lazy.create({ name: "a" }, undefined);
		await lazy.workQueue();
		refused.push("bad", "c");
		void lazy.update({ ...created, name: "bad" }, undefined);
		lazy.create({ name: "c" }, undefined);
		const factory = vi.fn(() => new Error("named by the control"));
		lazy.setQueueErrorFactory(factory);

		await expect(lazy.workQueue()).rejects.toThrow("named by the control");

		expect(factory).toHaveBeenCalledTimes(1);
		expect(factory.mock.calls[0]).toStrictEqual([
			[
				{
					id: created.id,
					operation: "update",
					error: new Error("update to bad refused"),
				},
				{
					id: "fake-id-1",
					operation: "create",
					error: new Error("create of c refused"),
				},
			],
		]);
	});

	it("[ISSUE-3505-ITEM-11] a factory that makes no error, or was removed, leaves the error as without one", async () => {
		const { lazy } = makeRefusingConnector(["b"]);
		lazy.create({ name: "b" }, undefined);
		const removed = vi.fn(() => new Error("removed factory"));
		const removeFirst = lazy.setQueueErrorFactory(removed);
		const second = vi.fn(() => undefined);
		const removeSecond = lazy.setQueueErrorFactory(second);
		// removes the first factory only, which the second one replaced already
		removeFirst();

		const withSecond = await lazy.workQueue().catch((e: unknown) => e);
		const secondsCalls = second.mock.calls.length;
		removeSecond();
		const withNone = await lazy.workQueue().catch((e: unknown) => e);

		expect(removed).not.toHaveBeenCalled();
		expect((withSecond as Error).message).toBe("create of b refused");
		expect((withNone as Error).message).toBe("create of b refused");
		// asked once, and not after it was removed
		expect(secondsCalls).toBe(1);
		expect(second).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3505-ITEM-29] without an error factory, a save whose writes all failed for the connection rejects with an error the default reporting policy doesn't report; one the backend refused too, with one it reports", async () => {
		/** Queues one create per error, which the real connector fails with */
		const save = (...errors: Error[]) => {
			const { connector } = makeRealConnector();
			errors.forEach((error) =>
				(connector.create as Mock).mockRejectedValueOnce(error),
			);
			const lazy = new LazyConnector(connector, true);
			errors.forEach((_, index) => lazy.create({ name: index }, undefined));
			return lazy.workQueue().then(
				() => null,
				(e: unknown) => e as Error,
			);
		};

		const offline = await save(
			new NetworkError("offline"),
			new NetworkError("offline"),
		);
		const refused = await save(
			new NetworkError("offline"),
			new BackendError("refused"),
		);

		expect(offline).toBeInstanceOf(AggregateError);
		expect(defaultShouldReportError(offline!, { source: "test" })).toBe(false);
		expect(refused).toBeInstanceOf(AggregateError);
		expect(defaultShouldReportError(refused!, { source: "test" })).toBe(true);
	});

	it("does not write the same record twice when the submit is retried", async () => {
		const { lazy, calls } = makeRefusingConnector(["b"]);
		lazy.create({ name: "a" }, undefined);
		lazy.create({ name: "b" }, undefined);
		await expect(lazy.workQueue()).rejects.toThrow("refused");
		calls.length = 0;

		await expect(lazy.workQueue()).rejects.toThrow("refused");

		// a caller which fixes the problem and submits again would otherwise create a
		// second record for everything the first attempt got through
		expect(calls).toStrictEqual(["create:b"]);
	});

	it("announces the queue it is left with, failure or not", async () => {
		const { lazy } = makeRefusingConnector(["b"]);
		const listener = vi.fn();
		lazy.create({ name: "a" }, undefined);
		lazy.create({ name: "b" }, undefined);
		lazy.addQueueChangeListener(listener);

		await expect(lazy.workQueue()).rejects.toThrow("refused");

		// anything rendering from the queue has to hear that half of it is gone
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener.mock.calls[0][0]).toHaveLength(1);
	});

	it("ignores a refused delete and carries on with the rest", async () => {
		const { lazy, calls } = makeRefusingConnector(["gone"]);
		lazy.delete("gone", undefined);
		lazy.create({ name: "a" }, undefined);

		await lazy.workQueue();

		// deleting what the backend no longer has is not a reason to stop
		expect(calls).toStrictEqual(["delete:gone", "create:a"]);
		expect(lazy.isQueueEmpty()).toBe(true);
	});
});

describe("LazyConnector deleteAdvanced", () => {
	/**
	 * A connector whose advanced delete logs the request it is sent, with the ids it would
	 * give the backend
	 */
	const makeAdvancedDeletingConnector = () => {
		const { connector, calls } = makeRealConnector();
		(
			connector as unknown as {
				deleteAdvanced: (req: AdvancedDeleteRequest) => Promise<unknown>;
			}
		).deleteAdvanced = vi.fn(([invert, ids]: AdvancedDeleteRequest) => {
			calls.push(`deleteAdvanced:${String(invert)}:${ids.join("+")}`);
			return Promise.resolve();
		});
		return { lazy: new LazyConnector(connector, true), calls };
	};

	const filter = {
		quickFilter: "",
		additionalFilters: {},
		fieldFilter: {},
	};

	it("[ISSUE-3505-ITEM-21] an inverted deleteAdvanced queued after a create excludes the created record by its server id", async () => {
		const { lazy, calls } = makeAdvancedDeletingConnector();

		const [created] = lazy.create({ name: "a" }, undefined);
		const fakeId = (created as Record<"id", string>).id;
		// everything the filter matches, except the record created in this batch
		const request: AdvancedDeleteRequest = [true, [fakeId], filter];
		void lazy.deleteAdvanced!(request, undefined);
		await lazy.workQueue();

		// the id the create handed out means nothing to the backend: the request has to
		// name the record by the id its create got when that ran, or the backend keeps
		// nothing out and deletes what was just created
		expect(lazy.mapId(fakeId)).toBe("real-a");
		expect(calls).toStrictEqual(["create:a", "deleteAdvanced:true:real-a"]);
		// the caller's request still names the record as the caller knows it
		expect(request).toStrictEqual([true, [fakeId], filter]);
	});

	it("[ISSUE-3505-ITEM-21] an advanced delete queued after a create names the created record by its server id", async () => {
		const { lazy, calls } = makeAdvancedDeletingConnector();

		const [created] = lazy.create({ name: "a" }, undefined);
		const fakeId = (created as Record<"id", string>).id;
		void lazy.deleteAdvanced!([false, [fakeId], filter], undefined);
		await lazy.workQueue();

		// deleting the record the batch just created reaches it: the fake id would match
		// nothing on the backend
		expect(calls).toStrictEqual(["create:a", "deleteAdvanced:false:real-a"]);
	});
});

describe("LazyConnector update", () => {
	/**
	 * A real connector whose updates are logged with the data they carry
	 * @param rows The records on the server: index lists them, read finds them by id
	 */
	const makeUpdatingConnector = (rows: Record<string, unknown>[] = []) => {
		const { connector, calls } = makeRealConnector();
		(
			connector as unknown as {
				update: (data: Record<string, unknown>) => Promise<unknown>;
			}
		).update = vi.fn((data: Record<string, unknown>) => {
			calls.push(`update:${String(data.id)}:${String(data.note)}`);
			return Promise.resolve([data, {}]);
		});
		const real = connector as unknown as Record<string, unknown>;
		real.index = vi.fn(() =>
			Promise.resolve([
				rows.map((row) => ({ ...row })),
				{ totalRows: rows.length, filteredRows: rows.length },
			]),
		);
		real.read = vi.fn((id: string) => {
			const row = rows.find((candidate) => candidate.id === id);
			return row
				? Promise.resolve([{ ...row }, {}])
				: Promise.reject(new Error(`${id} not found`));
		});
		return { connector, calls };
	};

	it("queues an update, shows it in index and sends it once the queue is worked", async () => {
		const { connector, calls } = makeUpdatingConnector();
		const lazy = new LazyConnector(connector, false);

		void lazy.update({ id: "j1", note: "first" }, undefined);

		const [rows] = await lazy.index(undefined, undefined);
		expect(rows).toStrictEqual([{ id: "j1", note: "first" }]);
		expect(calls).toStrictEqual([]);
		await lazy.workQueue();
		expect(calls).toStrictEqual(["update:j1:first"]);
	});

	it("[ISSUE-3505-ITEM-6] a second update of a record before the queue is worked sends the latest data, and index shows it", async () => {
		const { connector, calls } = makeUpdatingConnector();
		const lazy = new LazyConnector(connector, false);

		void lazy.update({ id: "j1", note: "first" }, undefined);
		void lazy.update({ id: "j1", note: "second" }, undefined);
		const [rows] = await lazy.index(undefined, undefined);
		await lazy.workQueue();

		expect({ shown: rows, sent: calls }).toStrictEqual({
			shown: [{ id: "j1", note: "second" }],
			sent: ["update:j1:second"],
		});
	});

	it("[ISSUE-3505-ITEM-6] index shows the update of a queued create before the queue is worked", async () => {
		const { connector } = makeUpdatingConnector();
		const lazy = new LazyConnector(connector, true);

		const [created] = lazy.create({ name: "a", note: "first" }, undefined);
		void lazy.update({ ...created, note: "second" }, undefined);
		const [rows] = await lazy.index(undefined, undefined);

		expect(rows.map((row) => row.note)).toStrictEqual(["second"]);
	});

	/**
	 * The data each create or update of a connector from makeUpdatingConnector was given
	 */
	const sentData = (connector: ApiConnector, method: "create" | "update") =>
		(
			connector as unknown as Record<
				typeof method,
				Mock<(data: Record<string, unknown>) => unknown>
			>
		)[method].mock.calls.map(([data]) => data);

	it("[ISSUE-3505-ITEM-6] two updates carrying different fields send both edits in one request, and read serves them", async () => {
		const { connector } = makeUpdatingConnector([{ id: "j1" }]);
		const lazy = new LazyConnector(connector, false);

		// a partial update, as the DataGrid's inline edit sends one per edited field
		void lazy.update({ id: "j1", note: "first" }, undefined);
		const returned = await lazy.update({ id: "j1", title: "t" }, undefined);
		const read = await lazy.read("j1", undefined);
		await lazy.workQueue();

		expect({
			returned: returned[0],
			read: read[0],
			sent: sentData(connector, "update"),
		}).toStrictEqual({
			returned: { id: "j1", note: "first", title: "t" },
			read: { id: "j1", note: "first", title: "t" },
			sent: [{ id: "j1", note: "first", title: "t" }],
		});
	});

	it("[ISSUE-3505-ITEM-6] an update of a queued create is sent as that create, with the fields of both", async () => {
		const { connector, calls } = makeUpdatingConnector();
		const lazy = new LazyConnector(connector, true);

		const [created] = lazy.create({ name: "a", note: "first" }, undefined);
		const fakeId = (created as Record<"id", string>).id;
		void lazy.update({ id: fakeId, note: "second" }, undefined);
		const [rows] = await lazy.index(undefined, undefined);
		await lazy.workQueue();

		expect({
			shown: rows,
			sent: calls,
			created: sentData(connector, "create"),
		}).toStrictEqual({
			shown: [{ id: fakeId, name: "a", note: "second" }],
			sent: ["create:a"],
			created: [{ name: "a", note: "second" }],
		});
		expect(lazy.mapId(fakeId)).toBe("real-a");
	});

	it("[ISSUE-3505-ITEM-20] a queued partial update keeps the row's other fields in index and read", async () => {
		const { connector } = makeUpdatingConnector([
			{ id: "j1", title: "t", note: "old" },
		]);
		const lazy = new LazyConnector(connector, false);

		void lazy.update({ id: "j1", note: "n" }, undefined);
		const [rows] = await lazy.index(undefined, undefined);
		const [read] = await lazy.read("j1", undefined);

		expect({ rows, read }).toStrictEqual({
			rows: [{ id: "j1", title: "t", note: "n" }],
			read: { id: "j1", title: "t", note: "n" },
		});
	});

	it("[ISSUE-3505-ITEM-20] a queued update leaves its row where the backend lists it", async () => {
		const { connector } = makeUpdatingConnector([
			{ id: "j1", title: "t" },
			{ id: "k2", title: "u" },
		]);
		const lazy = new LazyConnector(connector, false);

		void lazy.update({ id: "j1", note: "n" }, undefined);
		const [rows] = await lazy.index(undefined, undefined);

		expect(rows.map((row) => row.id)).toStrictEqual(["j1", "k2"]);
	});

	it("[ISSUE-3505-ITEM-20] with fakeReads, read serves a queued update as it is, without asking the backend", async () => {
		const { connector } = makeUpdatingConnector([{ id: "j1", title: "t" }]);
		const lazy = new LazyConnector(connector, true);

		void lazy.update({ id: "j1", note: "n" }, undefined);
		const [read] = await lazy.read("j1", undefined);

		expect(read).toStrictEqual({ id: "j1", note: "n" });
		expect(
			(connector as unknown as Record<"read", Mock>).read,
		).not.toHaveBeenCalled();
	});
});

describe("LazyConnector after a first save", () => {
	/**
	 * A form's connector after its first save, which leaves the form open: the record
	 * created through it is on the server, where index lists it under its real id next
	 * to one that was there before, and the form still holds the fake id
	 */
	const makeSavedHere = async () => {
		const { connector, calls } = makeRealConnector();
		const rows: Record<string, unknown>[] = [{ id: "b", name: "b" }];
		const real = connector as unknown as Record<string, unknown>;
		real.create = vi.fn((data: Record<string, unknown>) => {
			const row = { ...data, id: `real-${String(data.name)}` };
			calls.push(`create:${String(data.name)}`);
			rows.push(row);
			return Promise.resolve([{ ...row }, {}]);
		});
		real.index = vi.fn(() =>
			Promise.resolve([
				rows.map((row) => ({ ...row })),
				{ totalRows: rows.length, filteredRows: rows.length },
			]),
		);
		real.read = vi.fn((id: string) => {
			const row = rows.find((candidate) => candidate.id === id);
			return row
				? Promise.resolve([{ ...row }, {}])
				: Promise.reject(new Error(`${id} not found`));
		});
		real.update = vi.fn((data: Record<string, unknown>) => {
			calls.push(`update:${String(data.id)}:${String(data.note)}`);
			return Promise.resolve([data, {}]);
		});
		real.deleteAdvanced = vi.fn(([invert, ids]: [boolean, string[]]) => {
			calls.push(`deleteAdvanced:${String(invert)}:${ids.join("+")}`);
			return Promise.resolve();
		});
		const lazy = new LazyConnector(connector, false);
		const [created] = lazy.create({ name: "a" }, undefined);
		const fakeId = (created as Record<"id", string>).id;
		await lazy.workQueue();
		calls.length = 0;
		return { lazy, calls, fakeId };
	};

	it("[ISSUE-3505-ITEM-19] a queued delete of a record created there hides it from index and read", async () => {
		const { lazy, calls, fakeId } = await makeSavedHere();
		// index lists it under the id the form holds
		const [before] = await lazy.index(undefined, undefined);
		expect(before.map((row) => row.id)).toStrictEqual(["b", fakeId]);

		lazy.delete(fakeId, undefined);
		const [rows, meta] = await lazy.index(undefined, undefined);

		expect(rows.map((row) => row.id)).toStrictEqual(["b"]);
		expect(meta.totalRows).toBe(1);
		expect(lazy.getQueuedDeleteRecords()).toStrictEqual([
			{ id: fakeId, name: "a" },
		]);
		await expect(lazy.read(fakeId, undefined)).rejects.toThrow(
			"data has been deleted",
		);
		expect(lazy.getQueuedOperation(fakeId)).toBe("delete");
		await lazy.workQueue();
		expect(calls).toStrictEqual(["delete:real-a"]);
	});

	it("[ISSUE-3505-ITEM-19] a queued update of a record created there is reported, and cancelling it sends nothing", async () => {
		const { lazy, calls, fakeId } = await makeSavedHere();

		void lazy.update({ id: fakeId, note: "n" }, undefined);

		expect(lazy.getQueuedOperation(fakeId)).toBe("update");
		const [rows] = await lazy.index(undefined, undefined);
		// the update takes the place of the row it changes, under the id the form holds
		expect(rows.map((row) => [row.id, row.note])).toStrictEqual([
			["b", undefined],
			[fakeId, "n"],
		]);
		expect((await lazy.read(fakeId, undefined))[0]).toStrictEqual({
			id: fakeId,
			name: "a",
			note: "n",
		});

		expect(lazy.cancelQueuedOperation(fakeId)).toBe(true);
		expect(lazy.getQueuedOperation(fakeId)).toBe(null);
		expect(lazy.isQueueEmpty()).toBe(true);
		await lazy.workQueue();
		expect(calls).toStrictEqual([]);
	});

	it("[ISSUE-3505-ITEM-19] a queued update of a record created there is sent under its real id, merged with a second one", async () => {
		const { lazy, calls, fakeId } = await makeSavedHere();

		void lazy.update({ id: fakeId, note: "first" }, undefined);
		void lazy.update({ id: fakeId, note: "second" }, undefined);
		await lazy.workQueue();

		expect(calls).toStrictEqual(["update:real-a:second"]);
	});

	it("[ISSUE-3505-ITEM-20] a queued update of a record created there keeps its other fields in index and read", async () => {
		const { lazy, fakeId } = await makeSavedHere();

		void lazy.update({ id: fakeId, note: "n" }, undefined);
		const [rows] = await lazy.index(undefined, undefined);
		const [read] = await lazy.read(fakeId, undefined);

		expect({ rows, read }).toStrictEqual({
			rows: [
				{ id: "b", name: "b" },
				{ id: fakeId, name: "a", note: "n" },
			],
			read: { id: fakeId, name: "a", note: "n" },
		});
	});

	it("[ISSUE-3505-ITEM-20] index keeps listing a record created there under its fake id when an update names its real one", async () => {
		const { lazy, fakeId } = await makeSavedHere();

		void lazy.update({ id: lazy.mapId(fakeId), note: "n" }, undefined);
		const [rows] = await lazy.index(undefined, undefined);

		expect(rows.map((row) => row.id)).toStrictEqual(["b", fakeId]);
	});

	it("[ISSUE-3505-ITEM-22] read hands out a record created there under the id index lists it by", async () => {
		const { lazy, fakeId } = await makeSavedHere();

		const [rows] = await lazy.index(undefined, undefined);
		const [byFakeId] = await lazy.read(fakeId, undefined);
		const [byRealId] = await lazy.read(lazy.mapId(fakeId), undefined);

		expect({ listed: rows[1], byFakeId, byRealId }).toStrictEqual({
			listed: { id: fakeId, name: "a" },
			byFakeId: { id: fakeId, name: "a" },
			byRealId: { id: fakeId, name: "a" },
		});
	});

	it("[ISSUE-3505-ITEM-22] read hands out a record created there under its fake id when a queued update names its real one", async () => {
		const { lazy, fakeId } = await makeSavedHere();

		void lazy.update({ id: lazy.mapId(fakeId), note: "n" }, undefined);
		const [rows] = await lazy.index(undefined, undefined);
		const [read] = await lazy.read(fakeId, undefined);

		expect({ listed: rows[1], read }).toStrictEqual({
			listed: { id: fakeId, name: "a", note: "n" },
			read: { id: fakeId, name: "a", note: "n" },
		});
	});

	it("[ISSUE-3505-ITEM-19] a delete replaces a queued update of a record created there, and deleting it again queues nothing more", async () => {
		const single = await makeSavedHere();
		void single.lazy.update({ id: single.fakeId, note: "n" }, undefined);
		single.lazy.delete(single.fakeId, undefined);
		single.lazy.delete(single.fakeId, undefined);
		await single.lazy.workQueue();

		const batch = await makeSavedHere();
		void batch.lazy.update({ id: batch.fakeId, note: "n" }, undefined);
		batch.lazy.deleteMultiple([batch.fakeId], undefined);
		batch.lazy.deleteMultiple([batch.fakeId], undefined);
		await batch.lazy.workQueue();

		expect({ single: single.calls, batch: batch.calls }).toStrictEqual({
			single: ["delete:real-a"],
			batch: ["deleteMultiple:real-a"],
		});
	});

	it("[ISSUE-3505-ITEM-19] cancelling one id of a batched delete keeps remembering a record created there", async () => {
		const { lazy, fakeId } = await makeSavedHere();

		lazy.deleteMultiple([fakeId, "b"], undefined);
		await lazy.index(undefined, undefined);
		lazy.cancelQueuedOperation("b");

		expect(lazy.getQueuedDeleteRecords()).toStrictEqual([
			{ id: fakeId, name: "a" },
		]);
	});

	it("[ISSUE-3505-ITEM-19] an advanced delete of a record created there is queued and sent under its real id", async () => {
		const { lazy, calls, fakeId } = await makeSavedHere();
		const deleteAdvanced = lazy.deleteAdvanced!;

		void lazy.update({ id: fakeId, note: "n" }, undefined);
		const request: AdvancedDeleteRequest = [false, [fakeId]];
		void deleteAdvanced(request, undefined);
		// and with a filter, where the ids are the ones to keep
		void deleteAdvanced(
			[
				true,
				[fakeId],
				{ quickFilter: "", additionalFilters: {}, fieldFilter: {} },
			],
			undefined,
		);
		await lazy.workQueue();

		expect(calls).toStrictEqual([
			"deleteAdvanced:false:real-a",
			"deleteAdvanced:true:real-a",
		]);
		// the caller's request still names the record as the caller knows it
		expect(request).toStrictEqual([false, [fakeId]]);
	});
});

describe("LazyConnector read", () => {
	/**
	 * A new record's connector: fakeReads is set, and the real connector points at the
	 * endpoint built for the parent id "null", where a request is answered for whatever
	 * it asks
	 */
	const makeNewRecordConnector = () => {
		const { connector } = makeRealConnector();
		const backendRead = vi.fn((id: string) => Promise.resolve([{ id }, {}]));
		(connector as unknown as Record<"read", Mock>).read = backendRead;
		return { lazy: new LazyConnector(connector, true), backendRead };
	};

	it("[ISSUE-3505-ITEM-30] with fakeReads, a read of a record that is not queued rejects as not found, without asking the backend", async () => {
		const { lazy, backendRead } = makeNewRecordConnector();
		// a create dropped again leaves nothing queued under its fake id
		const [dropped] = lazy.create({ name: "a" }, undefined);
		const droppedId = (dropped as Record<"id", string>).id;
		lazy.delete(droppedId, undefined);

		await expect(lazy.read("unknown", undefined)).rejects.toThrow(
			"Record not found: unknown",
		);
		await expect(lazy.read(droppedId, undefined)).rejects.toThrow(
			`Record not found: ${droppedId}`,
		);
		expect(backendRead).not.toHaveBeenCalled();
	});

	it("[ISSUE-3505-ITEM-30] once fakeReads is cleared, as the save of the new record does, a record that is not queued is read from the backend", async () => {
		const { lazy, backendRead } = makeNewRecordConnector();

		lazy.fakeReads = false;
		const [read] = await lazy.read("b", undefined);

		expect(read).toStrictEqual({ id: "b" });
		expect(backendRead).toHaveBeenCalledWith("b", undefined);
	});

	/**
	 * The ways a create is dropped before the save, which leaves nothing queued under the
	 * fake id it handed out
	 */
	const dropCreate: [string, (lazy: LazyConnector, id: string) => void][] = [
		["removed", (lazy, id) => lazy.delete(id, undefined)],
		[
			"removed with another record",
			(lazy, id) => lazy.deleteMultiple([id, "b"], undefined),
		],
		["undone", (lazy, id) => void lazy.cancelQueuedOperation(id)],
	];

	it.each(dropCreate)(
		"[ISSUE-3505-ITEM-31] in an existing record's connector, a fake id whose create was %s before the save rejects as not found, without asking the backend",
		async (_, drop) => {
			const { connector } = makeRealConnector();
			const backendRead = vi.fn((id: string) => Promise.resolve([{ id }, {}]));
			(connector as unknown as Record<"read", Mock>).read = backendRead;
			// fakeReads false: a record that is not queued is read from the backend
			const lazy = new LazyConnector(connector, false);
			const [dropped] = lazy.create({ name: "a" }, undefined);
			const droppedId = (dropped as Record<"id", string>).id;
			drop(lazy, droppedId);

			await expect(lazy.read(droppedId, undefined)).rejects.toThrow(
				`Record not found: ${droppedId}`,
			);
			expect(backendRead).not.toHaveBeenCalled();
		},
	);

	/**
	 * The ways a delete of a record the backend has is queued
	 */
	const queueDelete: [string, (lazy: LazyConnector, id: string) => void][] = [
		["alone", (lazy, id) => lazy.delete(id, undefined)],
		[
			"with another record",
			(lazy, id) => lazy.deleteMultiple([id, "b"], undefined),
		],
	];

	it.each(queueDelete)(
		"[ISSUE-3505-ITEM-32] a read of a record whose delete is queued %s rejects, as a read of a record that is not there does, rather than throwing",
		async (_, queue) => {
			const { connector } = makeRealConnector();
			const backendRead = vi.fn((id: string) => Promise.resolve([{ id }, {}]));
			(connector as unknown as Record<"read", Mock>).read = backendRead;
			const lazy = new LazyConnector(connector, false);
			queue(lazy, "a");
			const onError = vi.fn();

			// a caller that handles the failure on the promise read hands back
			await Promise.resolve(lazy.read("a", undefined)).catch(onError);

			expect(onError).toHaveBeenCalledWith(
				expect.objectContaining({ message: "data has been deleted" }),
			);
			expect(backendRead).not.toHaveBeenCalled();
		},
	);
});

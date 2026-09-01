import { describe, expect, it, vi } from "vitest";
import LazyConnector from "../../src/backend-integration/Connector/LazyConnector";
import type ApiConnector from "../../src/backend-integration/Connector/ApiConnector";
import type { PageVisibility } from "../../src/backend-integration/Model/Model";

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
	} as unknown as ApiConnector<string, PageVisibility, unknown>;
	return { connector, calls };
};

const makeLazy = () => {
	const { connector, calls } = makeRealConnector();
	return {
		lazy: new LazyConnector<string, PageVisibility, unknown>(connector, true),
		calls,
	};
};

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
		const lazy = new LazyConnector<string, PageVisibility, unknown>(
			connector,
			true,
			onQueueChange,
		);
		lazy.delete("solo", undefined);
		onQueueChange.mockClear();

		expect(lazy.cancelQueuedOperation("unknown")).toBe(false);
		expect(onQueueChange).not.toHaveBeenCalled();

		expect(lazy.cancelQueuedOperation("solo")).toBe(true);
		expect(onQueueChange).toHaveBeenCalledTimes(1);
		expect(onQueueChange.mock.calls[0][0]).toEqual([]);
	});
});

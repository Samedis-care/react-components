import { afterEach, describe, expect, it } from "vitest";
import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelVisibilityEdit,
	useModelDeleteAdvanced,
	useModelFetchAll,
	useModelIndex,
	useModelIndex2,
} from "../../src/backend-integration";
import ModelDataStore from "../../src/backend-integration/Store";
import MockConnector from "../../src/stories/test-utils/MockConnector";
import type { ConnectorIndex2Params } from "../../src/backend-integration/Connector/Connector";
import type {
	IDataGridFieldFilter,
	IDataGridLoadDataParameters,
} from "../../src/standalone/DataGrid/DataGrid";
import type { IFilterDef } from "../../src/standalone/DataGrid/Content/FilterEntry";

afterEach(() => {
	cleanup();
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={ModelDataStore}>{children}</QueryClientProvider>
);

class DeleteAdvancedConnector extends MockConnector {
	deleteAdvanced = () => Promise.resolve();
}

const RECORDS = [
	{ id: "1", title: "One" },
	{ id: "2", title: "Two" },
	{ id: "3", title: "Three" },
];

const createModel = (
	connector: MockConnector = new DeleteAdvancedConnector(RECORDS),
	cache?: { name: string; cacheKeys: unknown; cacheKeysIndex?: unknown },
) =>
	new Model(
		cache?.name ?? "index-hooks-" + Math.random().toString(16),
		{
			title: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Title",
				visibility: {
					overview: ModelVisibilityEdit,
					edit: ModelVisibilityEdit,
					create: ModelVisibilityEdit,
				},
				customData: null,
			},
		},
		connector,
		cache?.cacheKeys,
		{
			cacheOptions: { staleTime: 60000, gcTime: 1234 },
			cacheKeysIndex: cache?.cacheKeysIndex,
		},
	);

const isInvalidated = (queryKey: readonly unknown[]) =>
	ModelDataStore.getQueryCache().find({ queryKey, exact: true })?.state
		.isInvalidated;

describe("useModelIndex", () => {
	it("loads one page under its index key, with the model's cache options", async () => {
		const model = createModel();
		const params = { page: 2, rows: 2 };
		const { result } = renderHook(() => useModelIndex(model, params), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.[0].map((record) => record.title)).toEqual([
			"Three",
		]);
		expect(result.current.data?.[1]).toEqual({ totalRows: 3, filteredRows: 3 });

		const query = ModelDataStore.getQueryCache().find({
			queryKey: model.getReactQueryKeyIndex(params),
			exact: true,
		});
		expect(query?.state.data).toBe(result.current.data);
		expect(query?.options.gcTime).toBe(1234);
	});

	it("counts with rows: 0", async () => {
		const model = createModel();
		const { result } = renderHook(
			() => useModelIndex(model, { rows: 0, quickFilter: "t" }),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.[0]).toEqual([]);
		expect(result.current.data?.[1].filteredRows).toBe(2);
	});

	it("keeps a page apart from a fetch all with the same filters", async () => {
		const model = createModel();
		const { result } = renderHook(
			() => ({
				page: useModelIndex(model, { quickFilter: "" }),
				all: useModelFetchAll(model, { quickFilter: "" }),
			}),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.page.isSuccess).toBe(true));
		await waitFor(() => expect(result.current.all.isSuccess).toBe(true));
		expect(result.current.page.data).not.toBe(result.current.all.data);
		expect(model.getReactQueryKeyIndex({ quickFilter: "" })).not.toEqual(
			model.getReactQueryKeyFetchAll({ quickFilter: "" }),
		);
	});
});

describe("useModelIndex2", () => {
	it("loads a range under its index2 key", async () => {
		const model = createModel();
		const params = { offset: 1, rows: 1 };
		const { result } = renderHook(() => useModelIndex2(model, params), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.[0].map((record) => record.title)).toEqual([
			"Two",
		]);
		expect(
			ModelDataStore.getQueryCache().find({
				queryKey: model.getReactQueryKeyIndex2(params),
				exact: true,
			})?.state.data,
		).toBe(result.current.data);
	});
});

describe("model query invalidation", () => {
	type TestModel = ReturnType<typeof createModel>;

	const loadAll = async (model: TestModel) => {
		await model.getCached("1", { batch: false });
		// set, the mock connector's index can't answer a batched request (by id)
		ModelDataStore.setQueryData(model.getReactQueryKey("2", true), [
			RECORDS[1],
			{},
		]);
		await model.fetchAllCached({ quickFilter: "" });
		await ModelDataStore.fetchQuery({
			queryKey: model.getReactQueryKeyIndex({ rows: 1 }),
			queryFn: () => model.index({ rows: 1 }),
		});
		await ModelDataStore.fetchQuery({
			queryKey: model.getReactQueryKeyIndex2({ offset: 0, rows: 1 }),
			queryFn: () => model.index2({ offset: 0, rows: 1 }),
		});
	};

	const invalidatedOf = (model: TestModel) => ({
		record: isInvalidated(model.getReactQueryKey("1", false)),
		batched: isInvalidated(model.getReactQueryKey("2", true)),
		fetchAll: isInvalidated(
			model.getReactQueryKeyFetchAll({ quickFilter: "" }),
		),
		index: isInvalidated(model.getReactQueryKeyIndex({ rows: 1 })),
		index2: isInvalidated(model.getReactQueryKeyIndex2({ offset: 0, rows: 1 })),
	});

	const NONE = {
		record: false,
		batched: false,
		fetchAll: false,
		index: false,
		index2: false,
	};
	const INVALIDATES = {
		invalidateQueries: {
			record: true,
			batched: true,
			fetchAll: true,
			index: true,
			index2: true,
		},
		invalidateIndexQueries: { ...NONE, index: true },
		invalidateIndex2Queries: { ...NONE, index2: true },
	};
	const METHODS = Object.keys(INVALIDATES) as (keyof typeof INVALIDATES)[];

	it.each(METHODS)("%s reaches its queries, not the others", async (method) => {
		const model = createModel();
		await loadAll(model);

		await model[method]();
		expect(invalidatedOf(model)).toEqual(INVALIDATES[method]);
	});

	it.each(METHODS)(
		"%s reaches the model's cacheKeys, with any cacheKeysIndex",
		async (method) => {
			// one model, opened for two projects, one of them also filtered
			const name = "index-hooks-" + Math.random().toString(16);
			const projectA = createModel(undefined, { name, cacheKeys: ["t", "a"] });
			const projectAOpen = createModel(undefined, {
				name,
				cacheKeys: ["t", "a"],
				cacheKeysIndex: [{ status: "open" }],
			});
			const projectB = createModel(undefined, { name, cacheKeys: ["t", "b"] });
			for (const model of [projectA, projectAOpen, projectB])
				await loadAll(model);

			await projectA[method]();
			expect(invalidatedOf(projectA)).toEqual(INVALIDATES[method]);
			expect(invalidatedOf(projectAOpen)).toEqual(INVALIDATES[method]);
			expect(invalidatedOf(projectB)).toEqual(NONE);
		},
	);

	it("invalidateCacheForId reaches the record, not the lists", async () => {
		const model = createModel();
		await loadAll(model);

		model.invalidateCacheForId("1");
		expect(invalidatedOf(model)).toEqual({ ...NONE, record: true });
	});
});

describe("useModelDeleteAdvanced", () => {
	it("drops the model's lists on an inverted delete, also a fetch all without params", async () => {
		const model = createModel();
		await model.getCached("1");
		await model.fetchAllCached();
		await ModelDataStore.fetchQuery({
			queryKey: model.getReactQueryKeyIndex(),
			queryFn: () => model.index(undefined),
		});
		const { result } = renderHook(() => useModelDeleteAdvanced(model), {
			wrapper,
		});

		await act(() => result.current.mutateAsync([true, ["1"]]));

		const cache = ModelDataStore.getQueryCache();
		expect(
			cache.find({ queryKey: model.getReactQueryKeyFetchAll(), exact: true }),
		).toBeUndefined();
		expect(
			cache.find({ queryKey: model.getReactQueryKeyIndex(), exact: true }),
		).toBeUndefined();
		// the record that stays
		expect(
			cache.find({ queryKey: model.getReactQueryKey("1", false), exact: true }),
		).toBeDefined();
	});
});

const THIRTY_RECORDS = Array.from({ length: 30 }, (_, i) => ({
	id: String(i + 1),
	title: "Record " + (i + 1),
}));

const FORCED: IFilterDef = { type: "equals", value1: "forced", value2: "" };
const createFilter = (): IDataGridFieldFilter => ({
	title: { type: "contains", value1: "t", value2: "" },
});

/**
 * Chains its own filter into the given ones, as a connector forcing a filter does
 * @param params The params the connector got
 * @param received Collects the field filters as they arrived
 */
const forceFilter = (
	params: { fieldFilter?: IDataGridFieldFilter } | undefined,
	received: string[],
) => {
	received.push(JSON.stringify(params?.fieldFilter));
	if (!params) return;
	params.fieldFilter ??= {};
	if (params.fieldFilter.title) params.fieldFilter.title.nextFilter = FORCED;
	else params.fieldFilter.title = FORCED;
};

class ForcingConnector extends MockConnector {
	received: string[] = [];
	index(params?: Partial<IDataGridLoadDataParameters>) {
		forceFilter(params, this.received);
		return super.index(params);
	}
}

/** Implements index2 itself, as the app connectors do */
class ForcingIndex2Connector extends MockConnector {
	received: string[] = [];
	index2(params: ConnectorIndex2Params) {
		forceFilter(params, this.received);
		return super.index({ page: 1, rows: params.rows });
	}
}

describe("index params", () => {
	it("reach the connector's index as a copy", async () => {
		const connector = new ForcingConnector(RECORDS);
		const model = createModel(connector);
		const params = { fieldFilter: createFilter() };
		const { result } = renderHook(
			() => ({
				page: useModelIndex(model, params),
				all: useModelFetchAll(model, params),
			}),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.page.isSuccess).toBe(true));
		await waitFor(() => expect(result.current.all.isSuccess).toBe(true));
		await act(() => result.current.page.refetch());
		expect(params).toEqual({ fieldFilter: createFilter() });
		expect(
			ModelDataStore.getQueryCache().find({
				queryKey: model.getReactQueryKeyIndex({ fieldFilter: createFilter() }),
				exact: true,
			}),
		).toBeDefined();
		// no call saw what an earlier one chained in
		expect(connector.received).toHaveLength(3);
		expect(new Set(connector.received)).toEqual(
			new Set([JSON.stringify(createFilter())]),
		);
	});

	it("reach the connector's index2 as a copy", async () => {
		const connector = new ForcingIndex2Connector(RECORDS);
		const model = createModel(connector);
		const params = { offset: 0, rows: 2, fieldFilter: createFilter() };
		const { result } = renderHook(() => useModelIndex2(model, params), {
			wrapper,
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		await act(() => result.current.refetch());
		expect(params).toEqual({ offset: 0, rows: 2, fieldFilter: createFilter() });
		expect(new Set(connector.received)).toEqual(
			new Set([JSON.stringify(createFilter())]),
		);
	});

	it("reach every index call of the index2 polyfill as their own copy", async () => {
		const connector = new ForcingConnector(THIRTY_RECORDS);
		const model = createModel(connector);

		// spans the polyfill's first two pages
		await model.index2({ offset: 20, rows: 10, fieldFilter: createFilter() });
		expect(connector.received).toEqual([
			JSON.stringify(createFilter()),
			JSON.stringify(createFilter()),
		]);
	});
});

describe("index2 polyfill", () => {
	it("loads the whole range when it doesn't start on a page", async () => {
		const model = createModel(new MockConnector(THIRTY_RECORDS));

		const [records] = await model.index2({ offset: 20, rows: 10 });
		expect(records.map((record) => record.title)).toEqual(
			THIRTY_RECORDS.slice(20).map((record) => record.title),
		);
	});
});

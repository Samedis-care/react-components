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

afterEach(() => {
	cleanup();
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={ModelDataStore}>{children}</QueryClientProvider>
);

class DeleteAdvancedConnector extends MockConnector {
	deleteAdvanced = () => Promise.resolve();
}

const createModel = () =>
	new Model(
		"index-hooks-" + Math.random().toString(16),
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
		new DeleteAdvancedConnector([
			{ id: "1", title: "One" },
			{ id: "2", title: "Two" },
			{ id: "3", title: "Three" },
		]),
		undefined,
		{ cacheOptions: { staleTime: 60000, gcTime: 1234 } },
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

describe("index query keys", () => {
	const loadAll = async (model: ReturnType<typeof createModel>) => {
		await ModelDataStore.fetchQuery({
			queryKey: model.getReactQueryKeyIndex({ rows: 1 }),
			queryFn: () => model.index({ rows: 1 }),
		});
		await ModelDataStore.fetchQuery({
			queryKey: model.getReactQueryKeyIndex2({ offset: 0, rows: 1 }),
			queryFn: () => model.index2({ offset: 0, rows: 1 }),
		});
		await model.fetchAllCached({ quickFilter: "" });
	};

	it("are reached by invalidating the model", async () => {
		const model = createModel();
		await loadAll(model);

		await ModelDataStore.invalidateQueries({ queryKey: [model.modelId] });
		expect(isInvalidated(model.getReactQueryKeyIndex({ rows: 1 }))).toBe(true);
		expect(
			isInvalidated(model.getReactQueryKeyIndex2({ offset: 0, rows: 1 })),
		).toBe(true);
		expect(
			isInvalidated(model.getReactQueryKeyFetchAll({ quickFilter: "" })),
		).toBe(true);
	});

	it("are reached by their marker without the others", async () => {
		const model = createModel();
		await loadAll(model);

		await ModelDataStore.invalidateQueries({
			queryKey: [model.modelId, "index"],
		});
		expect(isInvalidated(model.getReactQueryKeyIndex({ rows: 1 }))).toBe(true);
		expect(
			isInvalidated(model.getReactQueryKeyIndex2({ offset: 0, rows: 1 })),
		).toBe(false);
		expect(
			isInvalidated(model.getReactQueryKeyFetchAll({ quickFilter: "" })),
		).toBe(false);
	});

	it("are not reached by invalidating a record", async () => {
		const model = createModel();
		await loadAll(model);

		model.invalidateCacheForId("1");
		expect(isInvalidated(model.getReactQueryKeyIndex({ rows: 1 }))).toBe(false);
		expect(
			isInvalidated(model.getReactQueryKeyIndex2({ offset: 0, rows: 1 })),
		).toBe(false);
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

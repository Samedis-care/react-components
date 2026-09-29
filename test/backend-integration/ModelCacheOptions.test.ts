import { describe, expect, it } from "vitest";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelVisibilityEdit,
} from "../../src/backend-integration";
import ModelDataStore from "../../src/backend-integration/Store";
import MockConnector from "../../src/stories/test-utils/MockConnector";

const createModel = () =>
	new Model(
		"cache-options-" + Math.random().toString(16),
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
		new MockConnector([{ id: "1", title: "One" }]),
		undefined,
		{ cacheOptions: { staleTime: 1000, gcTime: 1234 } },
	);

describe("Model cacheOptions", () => {
	it("hands staleTime and gcTime to react-query", async () => {
		const model = createModel();
		await model.getCached("1");

		const query = ModelDataStore.getQueryCache().find({
			queryKey: model.getReactQueryKey("1", false),
		});
		expect(query?.options.gcTime).toBe(1234);
		expect(query?.options).toMatchObject({ staleTime: 1000 });
	});
});

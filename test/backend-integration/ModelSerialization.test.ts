import { describe, expect, it } from "vitest";
import {
	Model,
	ModelDataTypeAny,
	ModelDataTypeDateNullableRendererCC,
	ModelVisibilityEdit,
} from "../../src/backend-integration";
import MockConnector from "../../src/stories/test-utils/MockConnector";

const VISIBILITY = {
	overview: ModelVisibilityEdit,
	edit: ModelVisibilityEdit,
	create: ModelVisibilityEdit,
};

// an opaque object field, and a field inside it with its own type
const createModel = (defaults?: {
	result: () => Record<string, unknown>;
	foundAt: () => Date;
}) =>
	new Model(
		"serialization-" + Math.random().toString(16),
		{
			id: {
				type: new ModelDataTypeAny<string>(),
				getLabel: () => "ID",
				visibility: VISIBILITY,
				customData: null,
			},
			result: {
				type: new ModelDataTypeAny<Record<string, unknown>>(),
				getLabel: () => "Result",
				getDefaultValue: defaults?.result,
				visibility: VISIBILITY,
				customData: null,
			},
			"result.found_at": {
				type: new ModelDataTypeDateNullableRendererCC(),
				getLabel: () => "Found at",
				getDefaultValue: defaults?.foundAt,
				visibility: VISIBILITY,
				customData: null,
			},
		},
		new MockConnector([]),
	);

describe("Model.applySerialization", () => {
	it("serializes a field inside an object field without changing the values", async () => {
		const foundAt = new Date("2026-09-30T00:00:00.000Z");
		const values = { id: "1", result: { found_at: foundAt, note: "a" } };

		const serialized = await createModel().applySerialization(
			values,
			"serialize",
			"edit",
		);
		expect(serialized.result).toEqual({
			found_at: foundAt.toISOString(),
			note: "a",
		});
		expect(values.result).toEqual({ found_at: foundAt, note: "a" });
	});

	it("deserializes a field inside an object field without changing the data", async () => {
		const data = {
			id: "1",
			result: { found_at: "2026-09-30T00:00:00.000Z", note: "a" },
		};

		const deserialized = await createModel().applySerialization(
			data,
			"deserialize",
			"edit",
		);
		expect(
			(deserialized.result as Record<string, unknown>).found_at,
		).toBeInstanceOf(Date);
		expect(data.result).toEqual({
			found_at: "2026-09-30T00:00:00.000Z",
			note: "a",
		});
	});
});

describe("Model default values", () => {
	it("fill a field inside an object field without changing the object field's default", async () => {
		const RESULT = { note: "a" };
		let calls = 0;
		const model = createModel({
			result: () => RESULT,
			foundAt: () => new Date(++calls),
		});

		const [first] = await model.getRaw(null);
		const [second] = await model.getRaw(null);
		expect(first.result).toEqual({ note: "a", found_at: new Date(1) });
		expect(second.result).toEqual({ note: "a", found_at: new Date(2) });
		expect(RESULT).toEqual({ note: "a" });
	});
});

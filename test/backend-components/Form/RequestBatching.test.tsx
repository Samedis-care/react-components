import { describe, expect, it, vi } from "vitest";
import React from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import FormField from "../../../src/backend-components/Form/Field";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import {
	Model,
	ModelDataTypeStringRendererMUI,
	ModelUnknown,
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
	ModelVisibilityEditRequired,
	ModelVisibilityGridView,
	ModelVisibilityHidden,
} from "../../../src/backend-integration";
import {
	capture,
	loaded,
	mountForm,
	setupFormTests,
	Sink,
} from "./formFixture";

setupFormTests();

let modelCounter = 0;

/**
 * A model with request batching on records "1" and "2", whose field "internal" is
 * disabled in overview and editable in edit, so overview records lack it. Its index returns
 * the same data as a show, as enableRequestBatching requires.
 */
const batchedModel = (connector: MockConnector): ModelUnknown =>
	new Model(
		"u41-batched-" + String(modelCounter++),
		{
			id: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "ID",
				visibility: {
					overview: ModelVisibilityDisabled,
					edit: ModelVisibilityHidden,
					create: ModelVisibilityDisabled,
				},
				customData: null,
			},
			title: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Title",
				visibility: {
					overview: ModelVisibilityGridView,
					edit: ModelVisibilityEditRequired,
					create: ModelVisibilityEditRequired,
				},
				customData: null,
			},
			internal: {
				type: new ModelDataTypeStringRendererMUI(),
				getLabel: () => "Internal note",
				visibility: {
					overview: ModelVisibilityDisabled,
					edit: ModelVisibilityEdit,
					create: ModelVisibilityEdit,
				},
				customData: null,
			},
		},
		connector,
		undefined,
		{ enableRequestBatching: true },
	);

const records = () => [
	{ id: "1", title: "T1", internal: "Secret 1" },
	{ id: "2", title: "T2", internal: "Secret 2" },
];

/**
 * Mounts a Form for record "1" of the model with the fields title and internal
 * @returns The sink holding the form context
 */
const mountRecord = async (model: ModelUnknown) => {
	const sink: Sink = {};
	mountForm(
		model,
		capture(sink, () => (
			<>
				<FormField name={"title"} />
				<FormField name={"internal"} />
			</>
		)),
	);
	await loaded(sink);
	return sink;
};

describe("Form on a model with request batching", () => {
	it("[ISSUE-3501-ITEM-41] a field disabled in overview shows its stored value", async () => {
		const sink = await mountRecord(batchedModel(new MockConnector(records())));
		expect(sink.ctx!.values.internal).toBe("Secret 1");
		expect(screen.getByRole("textbox", { name: "Internal note" })).toHaveValue(
			"Secret 1",
		);
	});

	it("[ISSUE-3501-ITEM-41] a field disabled in overview shows its stored value after a data grid loaded the index", async () => {
		const model = batchedModel(new MockConnector(records()));
		// what a data grid does: the index rows are cached for batched requests
		const [rows] = await model.index({ page: 1, rows: 25 });
		expect(rows.find((row) => row.id === "1")).not.toHaveProperty("internal");
		const sink = await mountRecord(model);
		expect(sink.ctx!.values.internal).toBe("Secret 1");
		expect(screen.getByRole("textbox", { name: "Internal note" })).toHaveValue(
			"Secret 1",
		);
	});

	it("[ISSUE-3501-ITEM-41] after a save, the form's record is cached as saved, with the field disabled in overview", async () => {
		const connector = new MockConnector(records());
		const model = batchedModel(connector);
		const sink = await mountRecord(model);
		fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
			target: { value: "T1 saved" },
		});
		await act(async () => {
			await sink.ctx!.submit();
		});
		const index = vi.spyOn(connector, "index");
		const read = vi.spyOn(connector, "read");
		const [record] = await model.getCached("1");
		expect(record).toMatchObject({ title: "T1 saved", internal: "Secret 1" });
		expect(index).not.toHaveBeenCalled();
		expect(read).not.toHaveBeenCalled();
	});
});

describe("getCached on a model with request batching", () => {
	it("[ISSUE-3501-ITEM-41] without a batch option, the batched record has the fields disabled in overview", async () => {
		const model = batchedModel(new MockConnector(records()));
		const [record] = await model.getCached("1");
		expect(record).toMatchObject({ title: "T1", internal: "Secret 1" });
	});

	it("[ISSUE-3501-ITEM-41] a get that asks for a batch itself keeps the overview record", async () => {
		const model = batchedModel(new MockConnector(records()));
		const [record] = await model.getCached("1", { batch: true });
		expect(record).toMatchObject({ title: "T1" });
		expect(record).not.toHaveProperty("internal");
	});

	it("[ISSUE-3501-ITEM-41] gets with and without the batch option share one index request, each with its own visibility", async () => {
		const connector = new MockConnector(records());
		const model = batchedModel(connector);
		const index = vi.spyOn(connector, "index");
		const read = vi.spyOn(connector, "read");
		const [[forEdit], [forOverview]] = await Promise.all([
			model.getCached("1"),
			model.getCached("2", { batch: true }),
		]);
		expect(forEdit).toMatchObject({ id: "1", internal: "Secret 1" });
		expect(forOverview).toMatchObject({ id: "2", title: "T2" });
		expect(forOverview).not.toHaveProperty("internal");
		expect(index).toHaveBeenCalledTimes(1);
		expect(read).not.toHaveBeenCalled();
	});
});

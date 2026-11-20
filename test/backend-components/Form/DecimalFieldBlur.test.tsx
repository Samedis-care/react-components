import { describe, expect, it, vi } from "vitest";
import React from "react";
import { fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormField from "../../../src/backend-components/Form/Field";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { ModelDataTypeDecimalRendererCC } from "../../../src/backend-integration";
import {
	Sink,
	capture,
	editRequired,
	inputOf,
	loaded,
	makeModel,
	mountForm,
	recordData,
	settle,
	setupFormTests,
} from "./formFixture";

setupFormTests();

describe("Form with a decimal field", () => {
	it("[ISSUE-3484-ITEM-2] a Tab through it keeps the loaded value and the form clean, and marks the field touched", async () => {
		const [first, ...rest] = recordData();
		const model = makeModel(
			{},
			new MockConnector([{ ...first, hours: 0.12345 }, ...rest]),
			{
				hours: {
					type: new ModelDataTypeDecimalRendererCC(),
					getLabel: () => "Hours",
					visibility: editRequired,
					customData: null,
				},
			},
		);
		const sink: Sink = {};
		const { container } = mountForm(
			model,
			capture(sink, () => <FormField name={"hours"} />),
		);
		await loaded(sink);
		const input = inputOf(container, "hours");
		expect(input).toHaveValue("0.123");

		fireEvent.focus(input);
		fireEvent.blur(input);
		await settle();

		expect(sink.ctx!.values.hours).toBe(0.12345);
		expect(sink.ctx!.dirty).toBe(false);
		expect(sink.ctx!.touched.hours).toBe(true);
	});

	it("[ISSUE-3484-ITEM-4] shows the value the field's onChange keeps after an edit", async () => {
		const [first, ...rest] = recordData();
		const model = makeModel(
			{},
			new MockConnector([{ ...first, hours: 10 }, ...rest]),
			{
				hours: {
					type: new ModelDataTypeDecimalRendererCC(),
					getLabel: () => "Hours",
					visibility: editRequired,
					customData: null,
					// at most 10
					onChange: (value: number | null) =>
						value == null ? value : Math.min(value, 10),
				},
			},
		);
		const sink: Sink = {};
		const { container } = mountForm(
			model,
			capture(sink, () => <FormField name={"hours"} />),
		);
		await loaded(sink);
		const input = inputOf(container, "hours");
		expect(input).toHaveValue("10");

		fireEvent.focus(input);
		fireEvent.change(input, { target: { value: "15" } });
		fireEvent.blur(input);
		await settle();

		expect(sink.ctx!.values.hours).toBe(10);
		expect(input).toHaveValue("10");
	});

	it("[ISSUE-3484-ITEM-19] Enter in the form's only text field saves the typed number", async () => {
		const user = userEvent.setup();
		const [first, ...rest] = recordData();
		const connector = new MockConnector([{ ...first, hours: 1 }, ...rest]);
		const update = vi.spyOn(connector, "update");
		const model = makeModel({}, connector, {
			hours: {
				type: new ModelDataTypeDecimalRendererCC(),
				getLabel: () => "Hours",
				visibility: editRequired,
				customData: null,
			},
		});
		const sink: Sink = {};
		const { container } = mountForm(
			model,
			capture(sink, () => <FormField name={"hours"} />),
		);
		await loaded(sink);
		const input = inputOf(container, "hours");

		// a form with one text field submits on Enter, without a blur
		await user.clear(input);
		await user.type(input, "7.5{Enter}");
		await waitFor(() => expect(update).toHaveBeenCalledTimes(1));

		expect(update.mock.calls[0][0].hours).toBe(7.5);
		expect(input).toHaveFocus();
	});
});

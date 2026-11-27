import { describe, expect, it, vi } from "vitest";
import React from "react";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import FormField from "../../../src/backend-components/Form/Field";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import { ModelDataTypeColorRendererCC } from "../../../src/backend-integration";
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
	trySubmit,
} from "./formFixture";

setupFormTests();

describe("Form with a color field", () => {
	it("[ISSUE-3485-ITEM-12] marks the field touched once focus leaves it, not on the way into its picker and back", async () => {
		const consoleError = vi.spyOn(console, "error");
		const [first, ...rest] = recordData();
		const model = makeModel(
			{},
			new MockConnector([{ ...first, color: "#336699" }, ...rest]),
			{
				color: {
					type: new ModelDataTypeColorRendererCC(),
					getLabel: () => "Color",
					visibility: editRequired,
					customData: null,
				},
			},
		);
		const sink: Sink = {};
		const { container } = mountForm(
			model,
			capture(sink, () => (
				<>
					<FormField name={"color"} />
					<button type={"button"}>Next</button>
				</>
			)),
		);
		await loaded(sink);
		const input = inputOf(container, "color");
		const opener = screen.getByRole("button", { name: "Choose color" });
		const next = screen.getByRole("button", { name: "Next" });
		expect(input).toHaveValue("#336699");

		// a click into the text opens the picker, which takes focus
		act(() => input.focus());
		fireEvent.click(input);
		const dialog = screen.getByRole("dialog", { name: "Color" });
		expect(dialog).toHaveFocus();
		await settle();
		expect(sink.ctx!.touched.color).toBeFalsy();
		fireEvent.keyDown(dialog, { key: "Escape" });
		await waitFor(() =>
			expect(document.querySelector(".chrome-picker")).toBeNull(),
		);
		expect(input).toHaveFocus();

		// on to the picker button, still in the field
		act(() => opener.focus());
		await settle();
		expect(sink.ctx!.touched.color).toBeFalsy();

		// out of the field, from its button: the field is named in the event
		act(() => next.focus());
		await settle();
		// the color field, and no other (such as one named after the button's id)
		expect(
			Object.keys(sink.ctx!.touched).filter((name) => sink.ctx!.touched[name]),
		).toEqual(["color"]);
		expect(sink.ctx!.values.color).toBe("#336699");
		expect(consoleError).not.toHaveBeenCalledWith(
			expect.stringContaining("without name"),
			expect.anything(),
		);
	});

	it("[ISSUE-3485-ITEM-19] flags a typo as it is typed and refuses to save it, and takes a stored color in another format", async () => {
		const [first, ...rest] = recordData();
		const connector = new MockConnector([
			{ ...first, color: "rgb(8, 105, 179)" },
			...rest,
		]);
		const update = vi.spyOn(connector, "update");
		const model = makeModel({}, connector, {
			color: {
				type: new ModelDataTypeColorRendererCC(),
				getLabel: () => "Color",
				visibility: editRequired,
				customData: null,
			},
		});
		const sink: Sink = {};
		const { container } = mountForm(
			model,
			capture(sink, () => <FormField name={"color"} />),
		);
		await loaded(sink);
		const input = inputOf(container, "color");
		expect(input).toHaveValue("rgb(8, 105, 179)");
		expect(input).toHaveAttribute("aria-invalid", "false");

		fireEvent.change(input, { target: { value: "zzz" } });
		await settle();
		expect(input).toHaveAttribute("aria-invalid", "true");
		expect(input).toHaveAccessibleDescription(
			"Please enter a valid color, such as #336699",
		);
		expect(await trySubmit(sink)).not.toBeNull();
		await settle();
		expect(update).not.toHaveBeenCalled();

		fireEvent.change(input, { target: { value: "#336699" } });
		await settle();
		expect(input).toHaveAttribute("aria-invalid", "false");
		expect(input).not.toHaveAccessibleDescription(/color/);
		expect(await trySubmit(sink)).toBeNull();
		expect(update).toHaveBeenCalledTimes(1);
		expect(update.mock.calls[0][0]).toMatchObject({ color: "#336699" });
	});
});

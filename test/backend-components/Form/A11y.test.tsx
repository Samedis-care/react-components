import { describe, expect, it } from "vitest";
import React from "react";
import {
	act,
	fireEvent,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import FormField from "../../../src/backend-components/Form/Field";
import MockConnector from "../../../src/stories/test-utils/MockConnector";
import {
	ModelDataTypeBooleanCheckboxRendererCC,
	ModelDataTypeBooleanCheckboxRendererMUI,
	ModelDataTypeBooleanSwitchRendererMUI,
	ModelDataTypeColorRendererCC,
	ModelDataTypeDecimalCurrencyRendererCC,
	ModelDataTypeDecimalRendererCC,
	ModelDataTypeEnumMultiCheckboxRendererMUI,
	ModelDataTypeEnumMultiSelectRenderer,
	ModelDataTypeEnumRadioRendererMUI,
	ModelDataTypeEnumSelectRenderer,
	ModelDataTypeEnumSelectRendererMUI,
	ModelDataTypeFilesRenderer,
	ModelDataTypeImageRenderer,
	ModelDataTypeIntegerRendererCC,
	ModelDataTypeStringArrayRendererCC,
	ModelDataTypeStringRendererCC,
	ModelDataTypeStringRendererMUI,
	ModelFieldDefinitionUnknown,
} from "../../../src/backend-integration";
import validatePresence from "../../../src/utils/validations/validatePresence";
import {
	ModelVisibilityDisabled,
	ModelVisibilityEdit,
} from "../../../src/backend-integration/Model/Visibilities";
import {
	capture,
	editRequired,
	loaded,
	makeModel,
	mountForm,
	required,
	settle,
	setupFormTests,
	Sink,
	trySubmit,
} from "./formFixture";

setupFormTests();

/**
 * A model whose title is required (validatePresence), plus an "accept terms" checkbox
 * that must be ticked
 */
const termsModel = (connector?: MockConnector) =>
	makeModel({ title: { validate: validatePresence } }, connector, {
		accept: {
			type: new ModelDataTypeBooleanCheckboxRendererMUI(),
			getLabel: () => "Accept terms",
			visibility: editRequired,
			customData: null,
			validate: (value: unknown) => (value ? null : "Please accept the terms"),
		},
	});

describe("Form accessibility: bugs", () => {
	it("[ISSUE-3501-ITEM-13] after a failed submit, each field's message is its description and every control is marked invalid", async () => {
		const sink: Sink = {};
		mountForm(
			termsModel(),
			capture(sink, () => (
				<>
					<FormField name={"title"} />
					<FormField name={"accept"} />
				</>
			)),
			{ id: null },
		);
		await loaded(sink, "");
		act(() => sink.ctx!.setFieldValue("note", "x"));
		await settle();
		await act(async () => {
			await sink.ctx!.safeSubmit();
		});
		// close the validation dialog, which hides the page from assistive technology
		fireEvent.click(
			within(await screen.findByRole("dialog")).getByRole("button", {
				name: "OK",
			}),
		);
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await settle();
		const title = screen.getByRole("textbox", { name: "Title" });
		expect(title).toHaveAttribute("aria-invalid", "true");
		expect(title).toHaveAccessibleDescription("The Title field is required");
		const accept = screen.getByRole("checkbox", { name: "Accept terms" });
		expect(accept).toHaveAttribute("aria-invalid", "true");
		expect(accept).toHaveAccessibleDescription("Please accept the terms");
	});

	const options = [
		{ value: "low", getLabel: () => "Low" },
		{ value: "high", getLabel: () => "High" },
	];

	/**
	 * Mounts a create form with a field "probe" of the given type, whose validation always
	 * fails with "Probe is wrong", and submits it
	 * @returns The element with the FormField's id "probe"
	 */
	const submitProbe = async (type: ModelFieldDefinitionUnknown["type"]) => {
		const sink: Sink = {};
		mountForm(
			makeModel({}, undefined, {
				probe: {
					type,
					getLabel: () => "Probe",
					visibility: editRequired,
					customData: null,
					validate: () => "Probe is wrong",
				},
			}),
			capture(sink, () => <FormField name={"probe"} id={"probe"} />),
			{ id: null },
		);
		await loaded(sink, "");
		act(() => sink.ctx!.setFieldValue("note", "x"));
		await settle();
		expect(await trySubmit(sink)).not.toBeNull();
		await settle();
		return document.getElementById("probe")!;
	};

	// where the invalid state is: the control itself, or each input of a group
	const self = (control: HTMLElement) => [control];
	const inputs = (control: HTMLElement) =>
		Array.from(control.querySelectorAll("input"));

	it.each([
		["a text field", new ModelDataTypeStringRendererMUI(), self],
		["a UIKit text field", new ModelDataTypeStringRendererCC(), self],
		["an integer field", new ModelDataTypeIntegerRendererCC(), self],
		["a decimal field", new ModelDataTypeDecimalRendererCC(), self],
		[
			"a currency field",
			new ModelDataTypeDecimalCurrencyRendererCC({ currency: "EUR" }),
			self,
		],
		["a color field", new ModelDataTypeColorRendererCC(), self],
		["a checkbox", new ModelDataTypeBooleanCheckboxRendererMUI(), self],
		["a UIKit checkbox", new ModelDataTypeBooleanCheckboxRendererCC(), self],
		["a switch", new ModelDataTypeBooleanSwitchRendererMUI(), self],
		["a radio group", new ModelDataTypeEnumRadioRendererMUI(options, ""), self],
		[
			"a group of checkboxes",
			new ModelDataTypeEnumMultiCheckboxRendererMUI(options),
			inputs,
		],
		["a select", new ModelDataTypeEnumSelectRendererMUI(options, ""), self],
	] as const)(
		"[ISSUE-3501-ITEM-13] %s: after a failed submit its message is its description and it is marked invalid",
		async (_, type, invalid) => {
			const control = await submitProbe(type);
			expect(control).toHaveAccessibleDescription("Probe is wrong");
			const marked = invalid(control);
			expect(marked.length).toBeGreaterThan(0);
			marked.forEach((element) =>
				expect(element).toHaveAttribute("aria-invalid", "true"),
			);
		},
	);

	it("[ISSUE-3501-ITEM-13] a list of strings: after a failed submit its message is its description and it is marked invalid", async () => {
		const control = await submitProbe(new ModelDataTypeStringArrayRendererCC());
		// the probe is required, which the list's group says first (ISSUE-3462-ITEM-20)
		expect(control).toHaveAccessibleDescription("Required Probe is wrong");
		const marked = inputs(control);
		expect(marked.length).toBeGreaterThan(0);
		marked.forEach((element) =>
			expect(element).toHaveAttribute("aria-invalid", "true"),
		);
	});

	it("[ISSUE-3462-ITEM-8] a files field: after a failed submit its message is the description of its group", async () => {
		const control = await submitProbe(new ModelDataTypeFilesRenderer());
		expect(control).toHaveRole("group");
		expect(control).toHaveAccessibleName("Probe");
		// the probe is required, which the group says first (ISSUE-3462-ITEM-11)
		expect(control).toHaveAccessibleDescription("Required Probe is wrong");
	});

	/**
	 * Mounts a create form with a field "probe" of the given type, once with a required and
	 * once with an optional visibility, and expects the field's frame to show the asterisk
	 * after its title and its group to be described as "Required" only while it is required
	 * @param type Creates the field's type
	 */
	const expectFrameShowsRequired = async (
		type: () => ModelFieldDefinitionUnknown["type"],
	) => {
		const optional = {
			overview: ModelVisibilityDisabled,
			edit: ModelVisibilityEdit,
			create: ModelVisibilityEdit,
		};
		for (const [visibility, required] of [
			[editRequired, true],
			[optional, false],
		] as const) {
			const sink: Sink = {};
			const { unmount } = mountForm(
				makeModel({}, undefined, {
					probe: {
						type: type(),
						getLabel: () => "Probe",
						visibility,
						customData: null,
					},
				}),
				capture(sink, () => <FormField name={"probe"} />),
				{ id: null },
			);
			await loaded(sink, "");
			const group = await screen.findByRole("group", { name: "Probe" });
			expect(group.querySelector("legend")?.textContent).toBe(
				required ? "Probe\u2009*" : "Probe",
			);
			expect(group).toHaveAccessibleDescription(required ? "Required" : "");
			unmount();
		}
	};

	it.each([
		["a files field", () => new ModelDataTypeFilesRenderer()],
		["an image field", () => new ModelDataTypeImageRenderer()],
	] as const)(
		"[ISSUE-3462-ITEM-11] %s shows on its frame whether its visibility is required",
		(_, type) => expectFrameShowsRequired(type),
	);

	it("[ISSUE-3462-ITEM-20] a list of strings shows on its frame whether its visibility is required", () =>
		expectFrameShowsRequired(() => new ModelDataTypeStringArrayRendererCC()));

	it("[ISSUE-3501-ITEM-13] a required radio group is exposed as required", async () => {
		const control = await submitProbe(
			new ModelDataTypeEnumRadioRendererMUI(options, ""),
		);
		expect(control).toHaveRole("radiogroup");
		expect(control).toHaveAttribute("aria-required", "true");
	});

	it.each([
		["an enum selector", new ModelDataTypeEnumSelectRenderer(options, "")],
		[
			"an enum multi selector",
			new ModelDataTypeEnumMultiSelectRenderer(options),
		],
	] as const)(
		"[ISSUE-3501-ITEM-13] %s: after a failed submit its combobox is marked invalid",
		async (_, type) => {
			const control = await submitProbe(type);
			expect(control).toHaveRole("combobox");
			expect(control).toHaveAttribute("aria-invalid", "true");
		},
	);

	it("[ISSUE-3501-ITEM-13] FormField's id and aria-describedby reach the control, and the message follows the app's description", async () => {
		const sink: Sink = {};
		mountForm(
			makeModel({ title: { validate: required } }),
			capture(sink, () => (
				<>
					<p id={"title-hint"}>As printed on the device</p>
					<FormField
						name={"title"}
						id={"title-input"}
						aria-describedby={"title-hint"}
					/>
				</>
			)),
		);
		await loaded(sink);
		const title = screen.getByRole("textbox", { name: "Title" });
		expect(title.id).toBe("title-input");
		// without a message only the app's description, not the empty message element
		expect(title).toHaveAttribute("aria-describedby", "title-hint");
		act(() => sink.ctx!.setFieldValue("title", ""));
		await settle();
		expect(title).toHaveAccessibleDescription(
			"As printed on the device required",
		);
		act(() => sink.ctx!.setFieldValue("title", "fixed"));
		await settle();
		expect(title).toHaveAttribute("aria-describedby", "title-hint");
	});

	it("[ISSUE-3501-ITEM-13] a warning describes the control without marking it invalid", async () => {
		const sink: Sink = {};
		mountForm(
			makeModel({
				note: {
					validateHint: (value) =>
						value === "short" ? "Note is quite short" : null,
				},
			}),
			capture(sink, () => <FormField name={"note"} />),
		);
		await loaded(sink);
		act(() => sink.ctx!.setFieldValue("note", "short"));
		await settle();
		const note = screen.getByRole("textbox", { name: "Note" });
		expect(note).toHaveAccessibleDescription("Note is quite short");
		expect(note).toHaveAttribute("aria-invalid", "false");
	});

	it.each([
		["the id of its FormField", "priority"],
		["a generated id", undefined],
	] as const)(
		"[ISSUE-3501-ITEM-42] a select's combobox and its list of options are named by the field's label, with %s",
		async (_, id) => {
			const sink: Sink = {};
			mountForm(
				makeModel({}, undefined, {
					priority: {
						type: new ModelDataTypeEnumSelectRendererMUI(options, "low"),
						getLabel: () => "Priority",
						visibility: editRequired,
						customData: null,
					},
				}),
				capture(sink, () => <FormField name={"priority"} id={id} />),
				{ id: null },
			);
			await loaded(sink, "");
			const combobox = screen.getByRole("combobox", { name: "Priority" });
			if (id) expect(combobox.id).toBe(id);
			fireEvent.mouseDown(combobox);
			const listbox = await screen.findByRole("listbox", { name: "Priority" });
			expect(within(listbox).getAllByRole("option")).toHaveLength(2);
		},
	);

	it.each([
		[
			"a decimal field",
			new ModelDataTypeDecimalRendererCC(),
			".",
			"Enter a number, such as 1,234.56",
		],
		[
			"a currency field",
			new ModelDataTypeDecimalCurrencyRendererCC({ currency: "EUR" }),
			".",
			"Enter a number, such as €1,234.56",
		],
		[
			"an integer field",
			new ModelDataTypeIntegerRendererCC(),
			"99999999999999999",
			"Enter a number from -9,007,199,254,740,991 to 9,007,199,254,740,991",
		],
	] as const)(
		"[ISSUE-3484-ITEM-33] %s: its own message about the typed text and the form's message both describe it",
		async (_, type, text, ownMessage) => {
			const control = await submitProbe(type);
			expect(control).toHaveAccessibleDescription("Probe is wrong");
			fireEvent.focus(control);
			fireEvent.change(control, { target: { value: text } });
			fireEvent.blur(control);
			await settle();
			expect(control).toHaveAttribute("aria-invalid", "true");
			expect(control).toHaveAccessibleDescription(
				`${ownMessage} Probe is wrong`,
			);
		},
	);
});

import { describe, expect, it } from "vitest";
import React from "react";
import { screen } from "@testing-library/react";
import FormField from "../../../src/backend-components/Form/Field";
import DirtyStateProvider from "../../../src/backend-components/Form/DirtyStateProvider";
import { DirtyStateMarks } from "../../../src/backend-components/Form/DirtyStateContext";
import {
	ModelDataTypeBooleanCheckboxRendererCC,
	ModelDataTypeBooleanCheckboxRendererMUI,
	ModelDataTypeBooleanSwitchRendererMUI,
	ModelDataTypeColorRendererCC,
	ModelDataTypeDateNullableRendererCC,
	ModelDataTypeDateNullableRendererMUI,
	ModelDataTypeDecimalRendererCC,
	ModelDataTypeEnumMultiCheckboxRendererMUI,
	ModelDataTypeEnumMultiSelectRenderer,
	ModelDataTypeEnumRadioRendererMUI,
	ModelDataTypeEnumSelectRenderer,
	ModelDataTypeEnumSelectRendererMUI,
	ModelDataTypeFilesRenderer,
	ModelDataTypeIntegerRendererCC,
	ModelDataTypeSignatureRenderer,
	ModelDataTypeStringRendererCC,
	ModelDataTypeStringRendererMUI,
	ModelFieldDefinitionUnknown,
} from "../../../src/backend-integration";
import {
	capture,
	editRequired,
	loaded,
	makeModel,
	mountForm,
	setupFormTests,
	Sink,
} from "./formFixture";

setupFormTests();

/**
 * A modified field says so in its name, whichever control renders it: the dot after the
 * label is for the eye, the label's text for a screen reader.
 */

const MARKED: DirtyStateMarks = { probe: true };
const UNMARKED: DirtyStateMarks = { probe: false };

/**
 * Mounts a create form with a field "probe" of the given type, marked or not
 * @returns The element with the FormField's id "probe", and unmount
 */
const mountProbe = async (
	type: ModelFieldDefinitionUnknown["type"],
	marks: DirtyStateMarks,
) => {
	const sink: Sink = {};
	const { unmount } = mountForm(
		makeModel({}, undefined, {
			probe: {
				type,
				getLabel: () => "Probe",
				visibility: editRequired,
				customData: null,
			},
		}),
		capture(sink, () => (
			<DirtyStateProvider marks={marks}>
				<FormField name={"probe"} id={"probe"} />
			</DirtyStateProvider>
		)),
		{ id: null },
	);
	await loaded(sink, "");
	return { control: document.getElementById("probe")!, unmount };
};

const options = [
	{ value: "low", getLabel: () => "Low" },
	{ value: "high", getLabel: () => "High" },
];

// which element the field's label names: the control itself, the fieldset around a
// radio group (the group is the fieldset's content), or the date picker's field group
const self = (control: HTMLElement) => control;
const fieldset = (control: HTMLElement) => control.closest("fieldset")!;
const dateGroup = () => screen.getByRole("group", { name: /^Probe/ });

describe("dirty state in the field's name", () => {
	it.each([
		["a text field", () => new ModelDataTypeStringRendererMUI(), self],
		["a UIKit text field", () => new ModelDataTypeStringRendererCC(), self],
		["an integer field", () => new ModelDataTypeIntegerRendererCC(), self],
		["a decimal field", () => new ModelDataTypeDecimalRendererCC(), self],
		["a color field", () => new ModelDataTypeColorRendererCC(), self],
		[
			"a date field",
			() => new ModelDataTypeDateNullableRendererMUI(),
			dateGroup,
		],
		[
			"a UIKit date field",
			() => new ModelDataTypeDateNullableRendererCC(),
			dateGroup,
		],
		["a checkbox", () => new ModelDataTypeBooleanCheckboxRendererMUI(), self],
		[
			"a UIKit checkbox",
			() => new ModelDataTypeBooleanCheckboxRendererCC(),
			self,
		],
		["a switch", () => new ModelDataTypeBooleanSwitchRendererMUI(), self],
		[
			"a radio group",
			() => new ModelDataTypeEnumRadioRendererMUI(options, ""),
			fieldset,
		],
		[
			"a group of checkboxes",
			() => new ModelDataTypeEnumMultiCheckboxRendererMUI(options),
			self,
		],
		[
			"a select",
			() => new ModelDataTypeEnumSelectRendererMUI(options, ""),
			self,
		],
		[
			"an enum selector",
			() => new ModelDataTypeEnumSelectRenderer(options, ""),
			self,
		],
		[
			"an enum multi selector",
			() => new ModelDataTypeEnumMultiSelectRenderer(options),
			self,
		],
		["a files field", () => new ModelDataTypeFilesRenderer(), self],
		["a signature", () => new ModelDataTypeSignatureRenderer(), self],
	] as const)(
		"[ISSUE-3474-ITEM-26] %s: a modified one has the state in its name, an unmodified one does not",
		async (_, type, named) => {
			const marked = await mountProbe(type(), MARKED);
			// the label first, as the field is still found by it, then the state
			expect(named(marked.control)).toHaveAccessibleName(/^Probe \(modified\)/);
			// once, not repeated by a second copy of the label (an outlined border's)
			expect(named(marked.control)).not.toHaveAccessibleName(
				/modified.*modified/,
			);
			marked.unmount();

			const unmarked = await mountProbe(type(), UNMARKED);
			expect(named(unmarked.control)).toHaveAccessibleName(/^Probe/);
			expect(named(unmarked.control)).not.toHaveAccessibleName(/modified/);
		},
	);
});

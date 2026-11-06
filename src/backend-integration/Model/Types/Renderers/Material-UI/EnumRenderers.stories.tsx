import React, { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect } from "storybook/test";
import RendererEnumRadio from "./RendererEnumRadio";
import RendererEnumMultiCheckbox from "./RendererEnumMultiCheckbox";
import RendererEnumSimpleSelect from "./RendererEnumSimpleSelect";
import { EnumValue } from "../../TypeEnum";
import Visibility from "../../../Visibility";
import RenderParams from "../../../RenderParams";

const meta: Meta = {
	title: "Backend-Integration/Renderers/Material-UI/EnumRenderers",
};

export default meta;

const values: EnumValue[] = [
	{ value: "alpha", getLabel: () => "Alpha" },
	{ value: "beta", getLabel: () => "Beta (disabled)", disabled: true },
	{ value: "gamma", getLabel: () => "Gamma" },
];

const editableVisibility: Visibility = {
	disabled: false,
	hidden: false,
	editable: true,
	readOnly: false,
	required: false,
	grid: false,
};

const noop = () => {
	/* noop */
};

const buildParams = <T,>(
	value: T,
	handleChange: (field: string, value: T) => void,
	label: string,
): RenderParams<T> => ({
	field: "demo",
	value,
	initialValue: value,
	label,
	touched: false,
	dirty: false,
	autoFocus: false,
	visibility: editableVisibility,
	handleChange,
	handleBlur: noop,
	errorMsg: null,
	warningMsg: null,
	setError: noop,
	setFieldTouched: noop,
	setFieldValue: noop,
	values: {},
});

const RadioDemo = () => {
	const [value, setValue] = useState("alpha");
	const renderer = useMemo(() => new RendererEnumRadio(values, "alpha"), []);
	const handleChange = useCallback(
		(_field: string, next: string) => setValue(next),
		[],
	);
	return renderer.render(buildParams(value, handleChange, "Choose one"));
};

const MultiCheckboxDemo = () => {
	const [value, setValue] = useState<string[]>(["alpha"]);
	const renderer = useMemo(() => new RendererEnumMultiCheckbox(values), []);
	const handleChange = useCallback(
		(_field: string, next: string[]) => setValue(next),
		[],
	);
	return renderer.render(buildParams(value, handleChange, "Choose several"));
};

const SimpleSelectDemo = () => {
	const [value, setValue] = useState("alpha");
	const renderer = useMemo(
		() => new RendererEnumSimpleSelect(values, "alpha"),
		[],
	);
	const handleChange = useCallback(
		(_field: string, next: string) => setValue(next),
		[],
	);
	return renderer.render(buildParams(value, handleChange, "Choose one"));
};

export const RadioWithDisabledEntry: StoryObj = {
	render: () => <RadioDemo />,
};

export const MultiCheckboxWithDisabledEntry: StoryObj = {
	render: () => <MultiCheckboxDemo />,
};

export const SimpleSelectWithDisabledEntry: StoryObj = {
	render: () => <SimpleSelectDemo />,
};

/**
 * A select rendered the way FormField renders it, with the field's id, or the way a data
 * grid cell or the import preview renders it, without one
 */
const LabelledSelectDemo = (props: { id?: string; label: string }) => {
	const { id, label } = props;
	const [value, setValue] = useState("alpha");
	const renderer = useMemo(
		() => new RendererEnumSimpleSelect(values, "alpha"),
		[],
	);
	const handleChange = useCallback(
		(_field: string, next: string) => setValue(next),
		[],
	);
	return renderer.render({ ...buildParams(value, handleChange, label), id });
};

export const Issue3501Item42SimpleSelectNamedByLabel: StoryObj = {
	render: () => (
		<>
			<LabelledSelectDemo id={"priority"} label={"Priority"} />
			<LabelledSelectDemo label={"Severity"} />
		</>
	),
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3501-ITEM-42: the select's combobox is named by its label, with the field's id (Priority) and without one (Severity, as in a data grid cell). Fails the axe rule `aria-input-field-name` while it has no name.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ canvas, userEvent }) => {
		const priority = canvas.getByRole("combobox", { name: "Priority" });
		await expect(
			canvas.getByRole("combobox", { name: "Severity" }),
		).toBeVisible();
		// like a label of a native input, clicking it moves the focus to its select
		await userEvent.click(canvas.getByText("Priority"));
		await expect(priority).toHaveFocus();
	},
};

import React, { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
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
	const renderer = useMemo(() => new RendererEnumRadio(values), []);
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
	const renderer = useMemo(() => new RendererEnumSimpleSelect(values), []);
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

import React, { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect } from "storybook/test";
import RendererStringArray from "./RendererStringArray";
import RenderParams from "../../../RenderParams";

const meta: Meta = {
	title: "Backend-Integration/Renderers/UIKit/StringArrayRenderer",
};

export default meta;

const noop = () => {
	/* noop */
};

/**
 * A string list field holding two entries, editable, as a form renders it
 */
const StringListDemo = () => {
	const [value, setValue] = useState(["Red", "Blue"]);
	const renderer = useMemo(() => new RendererStringArray(), []);
	const handleChange = useCallback(
		(_field: string, next: string[]) => setValue(next),
		[],
	);
	const params: RenderParams<string[]> = {
		field: "colors",
		id: "colors",
		messageId: "colors-message",
		value,
		initialValue: value,
		label: "Colors",
		touched: false,
		dirty: false,
		autoFocus: false,
		visibility: {
			disabled: false,
			hidden: false,
			editable: true,
			readOnly: false,
			required: false,
			grid: false,
		},
		handleChange,
		handleBlur: noop,
		errorMsg: null,
		warningMsg: null,
		setError: noop,
		setFieldTouched: noop,
		setFieldValue: noop,
		values: {},
	};
	return renderer.render(params);
};

export const Issue3501Item43EntriesNamed: StoryObj = {
	render: () => <StringListDemo />,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3501-ITEM-43: every entry of a string list, and the empty one at the end for a new entry, is named by the field's label and its position. Fails the axe rule `label` while they have no name.",
			},
		},
		a11y: { test: "error" },
	},
	play: async ({ canvas, userEvent }) => {
		await expect(
			await canvas.findByRole("textbox", { name: "Colors 1" }),
		).toHaveValue("Red");
		await expect(canvas.getByRole("textbox", { name: "Colors 2" })).toHaveValue(
			"Blue",
		);
		await userEvent.type(
			canvas.getByRole("textbox", { name: "Colors: new entry" }),
			"Green",
		);
		await expect(canvas.getByRole("textbox", { name: "Colors 3" })).toHaveValue(
			"Green",
		);
		await expect(
			canvas.getByRole("textbox", { name: "Colors: new entry" }),
		).toHaveValue("");
	},
};

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn } from "storybook/test";
import { Stack } from "@mui/material";
import IntegerInputField from "./IntegerInputField";

type Props = React.ComponentProps<typeof IntegerInputField>;

/** Holds the value the way a form does, so every keystroke shows in the field */
const StatefulIntegerInputField = function StatefulIntegerInputField(
	props: Props,
) {
	const { value: initial, onChange, ...other } = props;
	const [value, setValue] = useState(initial);
	return (
		<IntegerInputField
			{...other}
			value={value}
			onChange={(evt, next) => {
				onChange?.(evt, next);
				setValue(next);
			}}
		/>
	);
};

/**
 * A whole number as a text field, grouped for the components-care language
 * unless `noFormat`. It is fully controlled: every keystroke reports the
 * digits of the text. The stories hold the value in state, as a form would;
 * `value` in the controls sets the starting number.
 *
 * Apps render TextFieldWithHelp with `variant="standard"` (theme default in SCF
 * and IMF); the stories pass it.
 */
const meta: Meta<typeof IntegerInputField> = {
	title: "Standalone/UIKit/InputControls/IntegerInputField",
	component: IntegerInputField,
	parameters: {
		layout: "padded",
		// every story of this file must pass axe
		a11y: { test: "error" },
	},
	args: {
		label: "Count",
		value: 1234,
		variant: "standard",
		onChange: fn(),
	},
	argTypes: {
		value: { description: "The whole number, or null", control: "number" },
		noFormat: {
			description: "Shows the digits without grouping (2026, not 2,026)",
			control: "boolean",
		},
		onChange: {
			description:
				"(event, number) on every keystroke with the digits of the text; null when there are none",
		},
	},
	render: (args) => (
		<StatefulIntegerInputField key={`${args.value}`} {...args} />
	),
};
export default meta;

type Story = StoryObj<typeof IntegerInputField>;

/** ISSUE-3484-ITEM-18: a fullWidth field fills a flex row, as its root is the TextField itself */
export const Issue3484Item18FullWidthInARow: Story = {
	render: (args) => (
		<Stack direction="row" sx={{ width: 400 }} data-testid="row">
			<StatefulIntegerInputField {...args} fullWidth />
		</Stack>
	),
	play: async ({ canvas }) => {
		const input = canvas.getByRole("textbox", { name: "Count" });
		const field = input.closest(".MuiFormControl-root")!;
		await expect(field.getBoundingClientRect().width).toBe(
			canvas.getByTestId("row").getBoundingClientRect().width,
		);
	},
};

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { fn, expect } from "storybook/test";
import InlineSwitch from "./index";

const meta: Meta<typeof InlineSwitch> = {
	title: "Standalone/InlineSwitch",
	component: InlineSwitch,
	parameters: { layout: "centered" },
	args: {
		value: false,
		visible: true,
		onChange: fn(),
	},
};
export default meta;

type Story = StoryObj<typeof InlineSwitch>;

export const Unchecked: Story = {
	args: {
		value: false,
		visible: true,
		label: "Enable feature",
	},
	play: async ({ canvas, userEvent, args }) => {
		// Click the switch via its label
		await userEvent.click(await canvas.findByText("Enable feature"));
		await expect(args.onChange).toHaveBeenCalledWith(true);
	},
};

export const Checked: Story = {
	args: {
		value: true,
		visible: true,
		label: "Enable feature",
	},
	play: async ({ canvas, userEvent, args }) => {
		// Click the switch via its label
		await userEvent.click(await canvas.findByText("Enable feature"));
		await expect(args.onChange).toHaveBeenCalledWith(false);
	},
};

export const WithChildren: Story = {
	args: {
		value: true,
		visible: true,
		label: "Show panel",
		children: (
			<div
				style={{
					marginTop: 8,
					padding: 8,
					border: "1px solid #ccc",
					borderRadius: 4,
				}}
			>
				Panel content is rendered here.
			</div>
		),
	},
};

export const SwitchHidden: Story = {
	args: {
		value: false,
		visible: false,
		label: "Hidden switch",
		children: <div style={{ padding: 8 }}>Only the children are visible.</div>,
	},
};

export const NoLabel: Story = {
	args: {
		value: false,
		visible: true,
	},
};

// Controlled interactive story
const ControlledTemplate = () => {
	const [checked, setChecked] = useState(false);
	return (
		<InlineSwitch
			value={checked}
			onChange={setChecked}
			visible
			label={checked ? "On" : "Off"}
		/>
	);
};

export const Controlled: Story = {
	render: () => <ControlledTemplate />,
};

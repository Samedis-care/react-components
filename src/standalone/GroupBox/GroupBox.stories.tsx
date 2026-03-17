import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import GroupBox from "./index";

const meta: Meta<typeof GroupBox> = {
	title: "Standalone/GroupBox",
	component: GroupBox,
	parameters: { layout: "centered" },
	args: {
		label: "Group Label",
	},
};
export default meta;

type Story = StoryObj<typeof GroupBox>;

export const Default: Story = {
	args: {
		label: "Personal Information",
		children: (
			<div>
				<p style={{ margin: 0 }}>Name: Alice Müller</p>
				<p style={{ margin: 0 }}>Age: 32</p>
			</div>
		),
	},
};

export const SmallLabel: Story = {
	args: {
		label: "Settings",
		smallLabel: true,
		children: <p style={{ margin: 0 }}>Some settings content here.</p>,
	},
};

export const NoLabel: Story = {
	args: {
		label: undefined,
		children: <p style={{ margin: 0 }}>Content without a legend.</p>,
	},
};

export const ReactNodeLabel: Story = {
	args: {
		label: <strong>Rich Label</strong>,
		children: <p style={{ margin: 0 }}>Content with a ReactNode label.</p>,
	},
};

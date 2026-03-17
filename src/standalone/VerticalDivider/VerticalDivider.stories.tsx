import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Typography } from "@mui/material";
import VerticalDivider from "./index";

const meta: Meta = {
	title: "Standalone/VerticalDivider",
	parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj;

export const InlineWithText: Story = {
	render: () => (
		<div style={{ display: "flex", alignItems: "center", height: 32 }}>
			<Typography variant="body2">Left</Typography>
			<VerticalDivider />
			<Typography variant="body2">Right</Typography>
		</div>
	),
};

export const MultipleItems: Story = {
	render: () => (
		<div style={{ display: "flex", alignItems: "center", height: 32 }}>
			<Typography variant="body2">File</Typography>
			<VerticalDivider />
			<Typography variant="body2">Edit</Typography>
			<VerticalDivider />
			<Typography variant="body2">View</Typography>
			<VerticalDivider />
			<Typography variant="body2">Help</Typography>
		</div>
	),
};

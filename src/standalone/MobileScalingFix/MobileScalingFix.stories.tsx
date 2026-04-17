import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
import MobileScalingFix, { MobileScalingFixProps } from "./MobileScalingFix";

const WrappedMobileScalingFix = (props: MobileScalingFixProps) => (
	<Box sx={{ textAlign: "center", padding: 2 }}>
		<MobileScalingFix {...props} />
		<Typography variant="body2" sx={{ color: "text.secondary" }}>
			MobileScalingFix renders nothing visible. It sets the viewport meta tag on
			mount.
		</Typography>
	</Box>
);

const meta: Meta<typeof WrappedMobileScalingFix> = {
	title: "Standalone/MobileScalingFix",
	component: WrappedMobileScalingFix,
	parameters: { layout: "centered" },
	argTypes: {
		minWidth: { control: { type: "number" } },
	},
};
export default meta;

type Story = StoryObj<typeof WrappedMobileScalingFix>;

export const Default: Story = {
	args: {},
};

export const WithMinWidth: Story = {
	args: {
		minWidth: 1024,
	},
};

export const DeviceWidth: Story = {
	render: () => (
		<Box sx={{ textAlign: "center", padding: 2 }}>
			<MobileScalingFix />
			<Typography variant="body2" sx={{ color: "text.secondary" }}>
				Sets viewport width to device-width (no minWidth prop).
			</Typography>
		</Box>
	),
};

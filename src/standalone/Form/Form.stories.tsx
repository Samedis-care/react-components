import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Typography } from "@mui/material";
import FormLoaderOverlay, { FormLoaderOverlayProps } from "./FormLoaderOverlay";

// --- FormLoaderOverlay ---

const WrappedFormLoaderOverlay = (props: FormLoaderOverlayProps) => (
	<Box
		sx={{
			position: "relative",
			width: 300,
			height: 200,
			border: "1px solid #ccc",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
		}}
	>
		<Typography>Form Content</Typography>
		<FormLoaderOverlay {...props} />
	</Box>
);

const overlayMeta: Meta<typeof WrappedFormLoaderOverlay> = {
	title: "Standalone/Form/FormLoaderOverlay",
	component: WrappedFormLoaderOverlay,
	parameters: { layout: "centered" },
	argTypes: {
		visible: { control: "boolean" },
	},
};
export default overlayMeta;

type OverlayStory = StoryObj<typeof WrappedFormLoaderOverlay>;

export const Visible: OverlayStory = {
	args: { visible: true },
};

export const Hidden: OverlayStory = {
	args: { visible: false },
};

export const Controllable: OverlayStory = {
	args: { visible: false },
};

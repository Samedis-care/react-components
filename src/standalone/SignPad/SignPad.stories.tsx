import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
import SignPad, { SignPadProps } from "./index";

const SAMPLE_SIGNATURE =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const WrappedSignPad = (props: SignPadProps) => (
	<Box sx={{ width: 300, height: 150 }}>
		<SignPad {...props} />
	</Box>
);

const meta: Meta<typeof WrappedSignPad> = {
	title: "Standalone/SignPad",
	component: WrappedSignPad,
	parameters: { layout: "centered" },
	argTypes: {
		disabled: { control: "boolean" },
		signature: { control: "text" },
		signerName: { control: "text" },
	},
};
export default meta;

type Story = StoryObj<typeof WrappedSignPad>;

export const Empty: Story = {
	args: {
		signature: "",
		disabled: false,
	},
};

export const WithSignature: Story = {
	args: {
		signature: SAMPLE_SIGNATURE,
		disabled: false,
		signerName: "Alice Müller",
	},
};

export const Disabled: Story = {
	args: {
		signature: "",
		disabled: true,
	},
};

export const DisabledWithSignature: Story = {
	args: {
		signature: SAMPLE_SIGNATURE,
		disabled: true,
		signerName: "Bob Smith",
	},
};

export const WithInfoButton: Story = {
	args: {
		signature: SAMPLE_SIGNATURE,
		disabled: false,
		openInfo: () => alert("Info clicked"),
		openSignPad: () => alert("SignPad clicked"),
	},
};

import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect } from "storybook/test";
import InfoBox from "./index";

const meta: Meta<typeof InfoBox> = {
	title: "Standalone/InfoBox",
	component: InfoBox,
	parameters: { layout: "centered" },
	args: {
		heading: "InfoBox heading",
		message: "This is the detail message shown when expanded.",
		expanded: false,
	},
	argTypes: {
		status: {
			control: "select",
			options: ["info", "warning", "success", "error"],
		},
		headingVariant: {
			control: "select",
			options: ["caption", "body1", "body2", "subtitle1", "subtitle2", "h6"],
		},
	},
};
export default meta;

type Story = StoryObj<typeof InfoBox>;

export const Info: Story = {
	args: {
		status: "info",
		heading: "Did you know?",
		message: "This panel shows general informational content.",
		expanded: true,
	},
};

export const Warning: Story = {
	args: {
		status: "warning",
		heading: "Please review",
		message: "Some values may be incorrect. Double-check before saving.",
		expanded: true,
	},
};

export const Success: Story = {
	args: {
		status: "success",
		heading: "Operation complete",
		message: "Your data has been saved successfully.",
		expanded: true,
	},
};

export const Error: Story = {
	args: {
		status: "error",
		heading: "An error occurred",
		message: "Could not connect to the server. Please try again later.",
		expanded: true,
	},
};

export const Collapsed: Story = {
	args: {
		status: "info",
		heading: "Click to expand",
		message: "This message is only visible when expanded.",
		expanded: false,
	},
	play: async ({ canvas, userEvent }) => {
		// Message should not be visible when collapsed
		const heading = canvas.getByText("Click to expand");
		await expect(
			canvas.queryByText("This message is only visible when expanded."),
		).not.toBeVisible();
		// Click heading to expand
		await userEvent.click(heading);
		await expect(
			canvas.getByText("This message is only visible when expanded."),
		).toBeVisible();
	},
};

export const AlwaysExpanded: Story = {
	args: {
		status: "success",
		heading: "Always visible",
		message: "This panel cannot be collapsed by the user.",
		expanded: true,
		alwaysExpanded: true,
	},
};

export const CustomHeadingVariant: Story = {
	args: {
		status: "info",
		heading: "Large heading",
		message: "Heading uses h6 typography variant.",
		expanded: true,
		headingVariant: "h6",
	},
};

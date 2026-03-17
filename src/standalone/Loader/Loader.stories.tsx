import type { Meta, StoryObj } from "@storybook/react-vite";
import Loader from "./index";

const meta: Meta<typeof Loader> = {
	title: "Standalone/Loader",
	component: Loader,
	parameters: { layout: "centered" },
	argTypes: {
		typographyVariant: {
			control: "select",
			options: [
				"h4",
				"h5",
				"h6",
				"subtitle1",
				"subtitle2",
				"body1",
				"body2",
				"caption",
			],
		},
	},
};
export default meta;

type Story = StoryObj<typeof Loader>;

export const NoText: Story = {
	args: {},
};

export const WithText: Story = {
	args: {
		text: "Loading, please wait…",
	},
};

export const WithTextBodyVariant: Story = {
	args: {
		text: "Fetching data…",
		typographyVariant: "body1",
	},
};

export const WithTextCaptionVariant: Story = {
	args: {
		text: "Almost there…",
		typographyVariant: "caption",
	},
};

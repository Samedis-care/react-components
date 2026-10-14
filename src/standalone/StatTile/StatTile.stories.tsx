import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn } from "storybook/test";
import StatTile from "./index";

const meta: Meta<typeof StatTile> = {
	title: "Standalone/StatTile",
	component: StatTile,
	parameters: { layout: "padded" },
	args: {
		title: "Active contracts",
		value: 42,
		subtitle: "128 tenants",
	},
	argTypes: {
		tone: {
			control: "select",
			options: ["neutral", "info", "success", "warning", "error"],
		},
	},
};
export default meta;

type Story = StoryObj<typeof StatTile>;

export const Default: Story = {};

export const WithSecondaryValue: Story = {
	args: {
		title: "Due",
		value: 11,
		secondaryValue: "42,180 €",
		subtitle: "in 30 days · next: 21.10.2026",
		subtitleUppercase: false,
		subtitleNoWrap: true,
		tone: "warning",
		outlined: true,
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText(/42,180 €/)).toBeVisible();
	},
};

export const Error: Story = {
	args: {
		title: "Overdue",
		value: 3,
		secondaryValue: "9,600 €",
		subtitle: "oldest outstanding: 14 days",
		subtitleUppercase: false,
		subtitleNoWrap: true,
		tone: "error",
		outlined: true,
	},
};

export const FormattedValue: Story = {
	args: {
		title: "ARR active",
		value: "1,284,000 €",
		subtitle: "+ project 48,000 € (3)",
		subtitleUppercase: false,
		outlined: true,
	},
};

export const WithUnit: Story = {
	args: { title: "Quota", value: 87, valueSuffix: "%", centered: true },
};

export const Loading: Story = {
	args: { value: null },
};

export const NoValue: Story = {
	args: { value: null, noValuePlaceholder: "—" },
};

export const Clickable: Story = {
	args: { onClick: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByText("42"));
		await expect(args.onClick).toHaveBeenCalled();
	},
};

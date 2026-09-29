import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor, within } from "storybook/test";
import { Toast } from "./Toast";

// The toast renders in a portal, so query from the document body
const body = within(document.body);

const meta: Meta<typeof Toast> = {
	title: "Standalone/Toast",
	component: Toast,
	args: {
		open: true,
		severity: "info",
		title: undefined,
		message: "3 devices were added to the project.",
		// stays open, so the docs page keeps showing it
		autoHideDuration: null,
		variant: "filled",
		onClose: fn(),
		onExited: fn(),
	},
	argTypes: {
		severity: {
			control: "select",
			options: ["success", "info", "warning", "error"],
		},
		variant: {
			control: "select",
			options: ["filled", "outlined", "standard"],
		},
		title: { control: "text" },
		message: { control: "text" },
		autoHideDuration: { control: "number" },
		// left unset, so the stories show the default position
		anchorOrigin: { control: "object" },
	},
};
export default meta;

type Story = StoryObj<typeof Toast>;

export const Info: Story = {
	play: async ({ args, userEvent }) => {
		const toast = await body.findByRole("status");
		await expect(toast).toHaveTextContent(
			"3 devices were added to the project.",
		);
		// bottom right unless the theme says otherwise
		await expect(toast.parentElement).toHaveClass(
			"MuiSnackbar-anchorOriginBottomRight",
		);
		await userEvent.click(within(toast).getByRole("button", { name: "Close" }));
		await expect(args.onClose).toHaveBeenCalledTimes(1);
	},
};

export const Success: Story = {
	args: {
		severity: "success",
		message: "Saved.",
	},
};

export const Warning: Story = {
	args: {
		severity: "warning",
		title: "Device left open",
		message: "Device 1042 is still open and can be finished later.",
	},
	play: async () => {
		await expect(await body.findByRole("alert")).toHaveTextContent(
			"Device left open",
		);
	},
};

export const Error: Story = {
	args: {
		severity: "error",
		message: "This label belongs to another project.",
	},
	play: async () => {
		await expect(await body.findByRole("alert")).toHaveTextContent(
			"This label belongs to another project.",
		);
	},
};

export const ClosesAfterTimeout: Story = {
	args: {
		autoHideDuration: 50,
	},
	play: async ({ args }) => {
		await body.findByRole("status");
		await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
	},
};

export const EscapeOnlyWhenFocused: Story = {
	play: async ({ args, userEvent }) => {
		const toast = await body.findByRole("status");

		// Escape elsewhere (e.g. closing a dialog) leaves the toast alone
		await userEvent.keyboard("{Escape}");
		await expect(args.onClose).not.toHaveBeenCalled();

		within(toast).getByRole("button", { name: "Close" }).focus();
		await userEvent.keyboard("{Escape}");
		await expect(args.onClose).toHaveBeenCalledTimes(1);
	},
};

export const StaysOnClickElsewhere: Story = {
	play: async ({ args, userEvent }) => {
		await body.findByRole("status");
		await userEvent.click(document.body);
		await expect(args.onClose).not.toHaveBeenCalled();
	},
};

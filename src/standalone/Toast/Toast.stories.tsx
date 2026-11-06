import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor, within } from "storybook/test";
import { Toast, ToastProps } from "./Toast";

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

/** waits until the toast's enter animation (scale and fade in) has finished */
const entered = (alert: HTMLElement) =>
	waitFor(() =>
		expect({
			transform: alert.style.transform,
			transitions: alert
				.getAnimations()
				.filter((a) => a instanceof CSSTransition).length,
		}).toEqual({ transform: "none", transitions: 0 }),
	);

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

// ─── Bugs ─────────────────────────────────────────────────────────────────────

const UNDER_TOAST_SX = { position: "fixed", right: 40, bottom: 32 } as const;

/** Rendered without onExited, as a plain controlled component */
const WithoutOnExited = (props: Pick<ToastProps, "onClose">) => {
	const { onClose } = props;
	const [open, setOpen] = useState(true);
	const close = useCallback(() => {
		setOpen(false);
		onClose();
	}, [onClose]);
	return (
		<>
			<Box sx={UNDER_TOAST_SX}>
				<Button variant={"outlined"}>Next page</Button>
			</Box>
			<Toast
				open={open}
				severity={"success"}
				message={"Saved."}
				autoHideDuration={null}
				onClose={close}
			/>
		</>
	);
};

export const Issue3470Item2ClosedToastLetsClicksThrough: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'Rendered without `onExited`, a closed toast leaves the page after its close animation, so clicks reach what lies under it, here "Next page".',
			},
		},
	},
	render: (args) => <WithoutOnExited onClose={args.onClose} />,
	play: async ({ args, canvas, userEvent }) => {
		const next = canvas.getByRole("button", { name: "Next page" });
		const r = next.getBoundingClientRect();
		const hit = () => {
			const el = document.elementFromPoint(
				r.left + r.width / 2,
				r.top + r.height / 2,
			);
			return el?.closest("button")?.textContent ?? el?.className ?? "nothing";
		};
		const toast = await body.findByRole("status");
		await entered(toast);
		// while it is shown, the toast lies over the button
		await expect(hit()).not.toBe("Next page");
		await userEvent.click(within(toast).getByRole("button", { name: "Close" }));
		await expect(args.onClose).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(body.queryByRole("status")).toBeNull());
		await waitFor(() =>
			expect(hit(), "what a click there hits").toBe("Next page"),
		);
	},
};

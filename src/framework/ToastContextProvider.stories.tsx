import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor, within } from "storybook/test";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	Stack,
} from "@mui/material";
import ToastContextProvider, { useToastContext } from "./ToastContextProvider";

// The toast renders in a portal, so query from the document body
const body = within(document.body);

const ToastDecorator = (Story: React.ComponentType) => (
	<ToastContextProvider>
		<Story />
	</ToastContextProvider>
);

const meta: Meta = {
	title: "Framework/ToastContext",
	decorators: [ToastDecorator],
	parameters: { layout: "centered" },
};
export default meta;

const ToastDemo = () => {
	const [showToast, closeToast] = useToastContext();
	const showSuccess = useCallback(
		() => showToast({ severity: "success", message: "Saved." }),
		[showToast],
	);
	const showError = useCallback(
		() =>
			showToast({
				severity: "error",
				title: "Not saved",
				message: "The server refused the change.",
			}),
		[showToast],
	);
	return (
		<Stack direction={"row"} spacing={2}>
			<Button variant={"contained"} color={"success"} onClick={showSuccess}>
				Show success
			</Button>
			<Button variant={"contained"} color={"error"} onClick={showError}>
				Show error
			</Button>
			<Button variant={"outlined"} onClick={closeToast}>
				Close toast
			</Button>
		</Stack>
	);
};

export const Default: StoryObj = {
	render: () => <ToastDemo />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Show success" }));
		await expect(await body.findByRole("status")).toHaveTextContent("Saved.");

		// a new toast replaces the one shown
		await userEvent.click(canvas.getByRole("button", { name: "Show error" }));
		await expect(await body.findByRole("alert")).toHaveTextContent(
			"The server refused the change.",
		);
		await waitFor(() => expect(body.queryByRole("status")).toBeNull());

		await userEvent.click(
			within(body.getByRole("alert")).getByRole("button", { name: "Close" }),
		);
		await waitFor(() => expect(body.queryByRole("alert")).toBeNull());
	},
};

export const ClosedByTheApp: StoryObj = {
	render: () => <ToastDemo />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Show success" }));
		await body.findByRole("status");
		await userEvent.click(canvas.getByRole("button", { name: "Close toast" }));
		await waitFor(() => expect(body.queryByRole("status")).toBeNull());
	},
};

const DialogDemo = () => {
	const [showToast] = useToastContext();
	const [open, setOpen] = useState(false);
	const openDialog = useCallback(() => setOpen(true), []);
	const closeDialog = useCallback(() => setOpen(false), []);
	const copy = useCallback(
		() => showToast({ severity: "success", message: "Link copied." }),
		[showToast],
	);
	return (
		<>
			<Button variant={"contained"} onClick={openDialog}>
				Open dialog
			</Button>
			<Dialog open={open} onClose={closeDialog}>
				<DialogContent>The toast shows above this dialog.</DialogContent>
				<DialogActions>
					<Button onClick={copy}>Copy link</Button>
					<Button onClick={closeDialog}>Close dialog</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export const FromADialog: StoryObj = {
	render: () => <DialogDemo />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
		const dialog = await body.findByRole("dialog");
		await userEvent.click(
			within(dialog).getByRole("button", { name: "Copy link" }),
		);
		// the dialog hides the app from screen readers, the toast stays reachable
		await expect(await body.findByRole("status")).toHaveTextContent(
			"Link copied.",
		);
	},
};

const TOP_CENTER = { vertical: "top", horizontal: "center" } as const;

const PlacedDemo = () => {
	const [showToast] = useToastContext();
	const showAtTop = useCallback(
		() =>
			showToast({
				message: "Label scanned.",
				anchorOrigin: TOP_CENTER,
			}),
		[showToast],
	);
	const showDefault = useCallback(
		() => showToast({ message: "Saved." }),
		[showToast],
	);
	return (
		<Stack direction={"row"} spacing={2}>
			<Button variant={"contained"} onClick={showAtTop}>
				Show at the top
			</Button>
			<Button variant={"outlined"} onClick={showDefault}>
				Show where the theme says
			</Button>
		</Stack>
	);
};

/**
 * A toast can be placed where it doesn't cover the page's controls, e.g. at the
 * top of a screen whose controls sit at the bottom. The next toast without a
 * placement of its own is shown where the theme says again.
 */
export const Placed: StoryObj = {
	render: () => <PlacedDemo />,
	play: async ({ canvas, userEvent }) => {
		const snackbarOf = (element: HTMLElement) =>
			element.closest(".MuiSnackbar-root");

		await userEvent.click(
			canvas.getByRole("button", { name: "Show at the top" }),
		);
		const top = snackbarOf(await body.findByRole("status"));
		await expect(top).toHaveClass("MuiSnackbar-anchorOriginTopCenter");

		await userEvent.click(
			canvas.getByRole("button", { name: "Show where the theme says" }),
		);
		await waitFor(() =>
			expect(body.getByRole("status")).toHaveTextContent("Saved."),
		);
		await expect(snackbarOf(body.getByRole("status"))).toHaveClass(
			"MuiSnackbar-anchorOriginBottomRight",
		);
	},
};

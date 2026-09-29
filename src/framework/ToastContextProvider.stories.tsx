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

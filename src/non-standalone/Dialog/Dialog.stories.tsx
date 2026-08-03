import React, { useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button, TextField, Box } from "@mui/material";
import DialogContextProvider from "../../framework/DialogContextProvider";
import { useDialogContext } from "../../framework";
import { ErrorDialog } from "./ErrorDialog";
import { InfoDialog } from "./InfoDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { InputDialog } from "./InputDialog";
import { FormDialog } from "./FormDialog";
import { DialogTitle } from "./DialogTitle";
import { setFrameworkHistory } from "../../framework/History";
import { createMemoryHistory } from "history";

// Framework needs a history to be set for DialogContextProvider to work
setFrameworkHistory(createMemoryHistory());

// ─── Decorator ───────────────────────────────────────────────────────────────

const DialogDecorator = (Story: React.ComponentType) => (
	<DialogContextProvider>
		<Story />
	</DialogContextProvider>
);

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta: Meta = {
	title: "non-standalone/Dialog",
	decorators: [DialogDecorator],
	parameters: { layout: "centered" },
};

export default meta;

// ─── ErrorDialog ─────────────────────────────────────────────────────────────

const ErrorDialogDemo = () => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(
			<ErrorDialog
				title="Error"
				message="Something went wrong. Please try again later."
				buttons={[{ text: "OK", autoFocus: true }]}
			/>,
		);
	}, [pushDialog]);
	return (
		<Button variant="contained" color="error" onClick={open}>
			Open Error Dialog
		</Button>
	);
};

export const ErrorDialogStory: StoryObj = {
	name: "ErrorDialog",
	render: () => <ErrorDialogDemo />,
};

// ─── InfoDialog ──────────────────────────────────────────────────────────────

const InfoDialogDemo = () => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(
			<InfoDialog
				title="Information"
				message="Your changes have been saved successfully."
				buttons={[{ text: "OK", autoFocus: true }]}
			/>,
		);
	}, [pushDialog]);
	return (
		<Button variant="contained" color="info" onClick={open}>
			Open Info Dialog
		</Button>
	);
};

export const InfoDialogStory: StoryObj = {
	name: "InfoDialog",
	render: () => <InfoDialogDemo />,
};

// ─── ConfirmDialog ───────────────────────────────────────────────────────────

const ConfirmDialogDemo = () => {
	const [pushDialog] = useDialogContext();
	const onYes = fn();
	const onNo = fn();
	const open = useCallback(() => {
		pushDialog(
			<ConfirmDialog
				title="Confirm Action"
				message="Are you sure you want to delete this item?"
				textButtonYes="Yes, Delete"
				textButtonNo="Cancel"
				handlerButtonYes={onYes}
				handlerButtonNo={onNo}
			/>,
		);
	}, [pushDialog, onYes, onNo]);
	return (
		<Button variant="contained" color="warning" onClick={open}>
			Open Confirm Dialog
		</Button>
	);
};

export const ConfirmDialogStory: StoryObj = {
	name: "ConfirmDialog",
	render: () => <ConfirmDialogDemo />,
};

// ─── Async button handler ────────────────────────────────────────────────────

const AsyncConfirmDialogDemo = (props: { onYes: () => Promise<void> }) => {
	const [pushDialog] = useDialogContext();
	const { onYes } = props;
	const open = useCallback(() => {
		pushDialog(
			<InfoDialog
				title="Confirm Action"
				message="This action takes a while to complete."
				buttons={[
					{ text: "Yes", onClick: onYes, autoFocus: true },
					{ text: "Cancel", color: "secondary" },
				]}
			/>,
		);
	}, [pushDialog, onYes]);
	return (
		<Button variant="contained" color="warning" onClick={open}>
			Open Async Confirm Dialog
		</Button>
	);
};

interface AsyncButtonHandlerArgs {
	onYes: () => Promise<void>;
}

export const AsyncButtonHandlerStory: StoryObj<AsyncButtonHandlerArgs> = {
	name: "Async button handler",
	args: {
		onYes: fn(async () => {
			await new Promise((resolve) => setTimeout(resolve, 300));
		}),
	},
	render: (args) => <AsyncConfirmDialogDemo onYes={args.onYes} />,
	play: async ({ args }) => {
		const body = within(document.body);

		await userEvent.click(
			body.getByRole("button", { name: "Open Async Confirm Dialog" }),
		);

		// Double-clicking the yes button must not start the handler twice and
		// must not pop the dialog twice (which used to throw
		// "[Components-Care] Trying to close non-existing dialog").
		const yesButton = await body.findByRole("button", { name: "Yes" });
		await userEvent.dblClick(yesButton);

		await expect(yesButton).toBeDisabled();
		await expect(args.onYes).toHaveBeenCalledTimes(1);

		// dialog closes once the handler resolves
		await waitFor(() => expect(body.queryByRole("dialog")).toBeNull(), {
			timeout: 3000,
		});
	},
};

// ─── InputDialog ─────────────────────────────────────────────────────────────

const InputDialogDemo = () => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(
			<InputDialog
				title="Rename Item"
				message="Enter a new name for this item:"
				textButtonYes="Rename"
				textButtonNo="Cancel"
				textFieldLabel="New Name"
				textFieldPlaceholder="e.g. My Document"
				textFieldValidator={(value: string) => value.trim().length > 0}
				handlerButtonYes={() => {}}
				handlerButtonNo={() => {}}
			/>,
		);
	}, [pushDialog]);
	return (
		<Button variant="contained" color="primary" onClick={open}>
			Open Input Dialog
		</Button>
	);
};

export const InputDialogStory: StoryObj = {
	name: "InputDialog",
	render: () => <InputDialogDemo />,
};

// ─── FormDialog ──────────────────────────────────────────────────────────────

const FormDialogDemo = () => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(
			<FormDialog
				title="Create User"
				message="Fill in the details below to create a new user."
				inputs={
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
						<TextField label="First Name" fullWidth />
						<TextField label="Last Name" fullWidth />
						<TextField label="Email" type="email" fullWidth />
					</Box>
				}
				buttons={[
					{ text: "Submit", autoFocus: true },
					{ text: "Cancel", color: "secondary" },
				]}
			/>,
		);
	}, [pushDialog]);
	return (
		<Button variant="contained" color="success" onClick={open}>
			Open Form Dialog
		</Button>
	);
};

export const FormDialogStory: StoryObj = {
	name: "FormDialog",
	render: () => <FormDialogDemo />,
};

// ─── DialogTitle ─────────────────────────────────────────────────────────────

export const DialogTitleStory: StoryObj = {
	name: "DialogTitle",
	render: () => (
		<Box sx={{ width: 400, border: "1px solid #ccc", borderRadius: 1 }}>
			<DialogTitle onClose={() => {}}>Sample Dialog Title</DialogTitle>
		</Box>
	),
};

export const DialogTitleNoClose: StoryObj = {
	name: "DialogTitle (no close button)",
	render: () => (
		<Box sx={{ width: 400, border: "1px solid #ccc", borderRadius: 1 }}>
			<DialogTitle>Title Without Close</DialogTitle>
		</Box>
	),
};

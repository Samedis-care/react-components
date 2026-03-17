import React, { useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { fn } from "storybook/test";
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

import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, mocked, userEvent, waitFor, within } from "storybook/test";
import {
	Box,
	Button,
	createTheme,
	Dialog,
	DialogContent,
	DialogContentText,
	getContrastRatio,
	paperClasses,
	Stack,
	TextField,
	ThemeProvider,
	Typography,
} from "@mui/material";
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
import FullFormDialog from "../../backend-components/Form/FormDialog";
import HistoryRouter from "../../standalone/Routes/HistoryRouter";
import Routes from "../../standalone/Routes/Routes";
import Route from "../../standalone/Routes/Route";
import Link from "../../standalone/Routes/Link";
import PageTitle from "../PageTitle/PageTitle";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const page = () => within(document.body);

const nextFrame = () =>
	new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** A button that pushes the given dialog element */
const Opener = (props: { label: string; dialog: React.ReactNode }) => {
	const { label, dialog } = props;
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => pushDialog(dialog), [pushDialog, dialog]);
	return (
		<Button variant="contained" onClick={open}>
			{label}
		</Button>
	);
};

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

interface ConfirmDialogArgs {
	onYes: () => void;
	onNo: () => void;
}

const ConfirmDialogDemo = (props: ConfirmDialogArgs) => {
	const { onYes, onNo } = props;
	const [pushDialog] = useDialogContext();
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
		<Button variant="contained" color="primary" onClick={open}>
			Open Confirm Dialog
		</Button>
	);
};

export const ConfirmDialogStory: StoryObj<ConfirmDialogArgs> = {
	name: "ConfirmDialog",
	args: { onYes: fn(), onNo: fn() },
	argTypes: {
		onYes: { description: "`handlerButtonYes`: called when Yes is clicked" },
		onNo: { description: "`handlerButtonNo`: called when No is clicked" },
	},
	render: (args) => <ConfirmDialogDemo {...args} />,
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
		// the handler runs until the play function ends it: the 300ms of the canvas can
		// pass between the two clicks on a loaded machine, and the second one starts it again
		let finish = () => {};
		mocked(args.onYes).mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					finish = resolve;
				}),
		);

		await userEvent.click(
			body.getByRole("button", { name: "Open Async Confirm Dialog" }),
		);

		// Double-clicking the yes button must not start the handler twice and
		// must not pop the dialog twice (which used to throw
		// "[Components-Care] Trying to close non-existing dialog").
		const yesButton = await body.findByRole("button", { name: "Yes" });
		await userEvent.dblClick(yesButton);

		await expect(yesButton).toHaveAttribute("aria-disabled", "true");
		await expect(args.onYes).toHaveBeenCalledTimes(1);

		// dialog closes once the handler resolves
		finish();
		await waitFor(() => expect(body.queryByRole("dialog")).toBeNull(), {
			timeout: 3000,
		});
	},
};

// ─── InputDialog ─────────────────────────────────────────────────────────────

interface InputDialogArgs {
	textFieldErrorText?: string;
	onYes: (value: string) => void;
	onNo: () => void;
}

const validateName = (value: string) => value.trim().length > 0;

const InputDialogDemo = (props: InputDialogArgs) => {
	const { textFieldErrorText, onYes, onNo } = props;
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
				textFieldValidator={validateName}
				textFieldErrorText={textFieldErrorText}
				handlerButtonYes={onYes}
				handlerButtonNo={onNo}
			/>,
		);
	}, [pushDialog, textFieldErrorText, onYes, onNo]);
	return (
		<Button variant="contained" color="primary" onClick={open}>
			Open Input Dialog
		</Button>
	);
};

export const InputDialogStory: StoryObj<InputDialogArgs> = {
	name: "InputDialog",
	args: { textFieldErrorText: "Enter a name", onYes: fn(), onNo: fn() },
	render: (args) => <InputDialogDemo {...args} />,
};

export const Issue3497Item16RejectedValueIsDescribed: StoryObj<InputDialogArgs> =
	{
		args: { textFieldErrorText: "Enter a name", onYes: fn(), onNo: fn() },
		parameters: {
			a11y: { test: "error" },
			docs: {
				description: {
					story:
						"ISSUE-3497-ITEM-16: Rename with an empty field. The dialog stays open, focus moves to the field, and the field is marked invalid and described by the error text below it.",
				},
			},
		},
		render: (args) => <InputDialogDemo {...args} />,
		play: async ({ args }) => {
			await userEvent.click(
				page().getByRole("button", { name: "Open Input Dialog" }),
			);
			const input = await page().findByRole("textbox", { name: "New Name" });
			await userEvent.click(page().getByRole("button", { name: "Rename" }));
			await expect(input).toHaveFocus();
			await expect(input).toHaveAttribute("aria-invalid", "true");
			await expect(input).toHaveAccessibleDescription("Enter a name");
			// the dialog may still be fading in under load (opacity below 1 counts as not visible)
			await waitFor(() =>
				expect(page().getByText("Enter a name")).toBeVisible(),
			);
			await expect(args.onYes).not.toHaveBeenCalled();
		},
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

interface FormDialogBusyArgs {
	onSave: () => Promise<void>;
	onCancel: () => void;
}

export const Issue3497Item10FormDialogBusyKeepsFocus: StoryObj<FormDialogBusyArgs> =
	{
		args: {
			// never settles: the story ends with the dialog busy, so axe checks that state
			onSave: fn(() => new Promise<void>(() => {})),
			onCancel: fn(),
		},
		parameters: {
			a11y: { test: "error" },
			docs: {
				description: {
					story:
						"ISSUE-3497-ITEM-10: Enter on Save (an async `dontClose` button) starts a handler that does not end. While it runs, the dialog is `aria-busy`, its buttons are `aria-disabled` and ignore Enter, Save shows a spinner before its label, and Escape does nothing. Focus stays on Save, and Tab still moves between the busy buttons.",
				},
			},
		},
		render: (args) => (
			<Opener
				label="Open busy form dialog"
				dialog={
					<FormDialog
						title="Rename device"
						message="Enter the new name of the device."
						inputs={
							<TextField
								label="Name"
								defaultValue="Infusion pump 3"
								fullWidth
								sx={{ mt: 1 }}
							/>
						}
						buttons={[
							{
								text: "Save",
								autoFocus: true,
								dontClose: true,
								onClick: args.onSave,
							},
							{ text: "Cancel", color: "secondary", onClick: args.onCancel },
						]}
					/>
				}
			/>
		),
		play: async ({ args, canvas }) => {
			await userEvent.click(
				canvas.getByRole("button", { name: "Open busy form dialog" }),
			);
			const dialog = await page().findByRole("dialog", {
				name: "Rename device",
			});
			const save = within(dialog).getByRole("button", { name: "Save" });
			const cancel = within(dialog).getByRole("button", { name: "Cancel" });
			await waitFor(() => expect(save).toHaveFocus());
			await userEvent.keyboard("{Enter}");
			await expect(args.onSave).toHaveBeenCalledTimes(1);
			await waitFor(() => expect(dialog).toHaveAttribute("aria-busy", "true"));
			// two rendering updates: the browser's focus fixup for a disabled
			// button has run
			await nextFrame();
			await nextFrame();
			await expect(save).toHaveFocus();
			await expect(save).toHaveAttribute("aria-disabled", "true");
			await expect(
				within(save).queryByRole("progressbar", { hidden: true }),
			).not.toBeNull();
			await userEvent.keyboard("{Enter}");
			await userEvent.tab();
			await expect(cancel).toHaveFocus();
			await expect(cancel).toHaveAttribute("aria-disabled", "true");
			await userEvent.keyboard("{Enter}");
			await userEvent.keyboard("{Escape}");
			await nextFrame();
			await expect(args.onSave).toHaveBeenCalledTimes(1);
			await expect(args.onCancel).not.toHaveBeenCalled();
			await expect(dialog).toBeInTheDocument();
			await expect(cancel).toHaveFocus();
		},
	};

// ─── DialogTitle ─────────────────────────────────────────────────────────────

interface DialogTitleArgs {
	onClose: () => void;
}

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

// ─── Bugs ────────────────────────────────────────────────────────────────────

export const Issue3497Item13TitleIsOneHeading: StoryObj<DialogTitleArgs> = {
	args: { onClose: fn() },
	parameters: {
		// no exception: axe fails "heading-order" (an h6 inside the dialog's h2)
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3497-ITEM-13: DialogTitle inside a Dialog. The close button and an `h6` with the text sit inside the `h2` that names the dialog: Chromium names the dialog and the heading "My Title Close", and axe reports `heading-order`.',
			},
		},
	},
	render: (args) => (
		<Dialog open>
			<DialogTitle onClose={args.onClose}>My Title</DialogTitle>
			<DialogContent>
				<DialogContentText>Dialog content.</DialogContentText>
			</DialogContent>
		</Dialog>
	),
	play: async () => {
		const dialog = await page().findByRole("dialog");
		await waitFor(() => expect(dialog).toBeVisible());
	},
};

export const Issue3497Item13CloseButtonBesideHeading: StoryObj<DialogTitleArgs> =
	{
		args: { onClose: fn() },
		parameters: {
			a11y: { test: "error" },
			docs: {
				description: {
					story:
						"ISSUE-3497-ITEM-13: the close button sits next to the heading that names the dialog, not inside it, centered on the title row. The content starts right below the title, as after MUI's `DialogTitle`.",
				},
			},
		},
		render: (args) => (
			<Dialog open>
				<DialogTitle onClose={args.onClose}>My Title</DialogTitle>
				<DialogContent>
					<DialogContentText>Dialog content.</DialogContentText>
				</DialogContent>
			</Dialog>
		),
		play: async ({ args }) => {
			const dialog = await page().findByRole("dialog");
			await waitFor(() => expect(dialog).toBeVisible());
			const heading = within(dialog).getByRole("heading");
			const close = within(dialog).getByRole("button", { name: "Close" });
			await expect(heading).toHaveTextContent(/^My Title$/);
			await expect(heading).not.toContainElement(close);
			const headingBox = heading.getBoundingClientRect();
			const closeBox = close.getBoundingClientRect();
			await expect(closeBox.left).toBeGreaterThanOrEqual(headingBox.right);
			await expect(
				Math.abs(
					closeBox.top +
						closeBox.height / 2 -
						(headingBox.top + headingBox.height / 2),
				),
			).toBeLessThan(1);
			const content = dialog.querySelector<HTMLElement>(
				".MuiDialogContent-root",
			);
			await expect(content && getComputedStyle(content).paddingTop).toBe("0px");
			await userEvent.click(close);
			await expect(args.onClose).toHaveBeenCalledTimes(1);
		},
	};

const noTitleDialogSlotProps = { paper: { "aria-label": "Edit device" } };

export const Issue3497Item14NoTitleDialogHasName: StoryObj<DialogTitleArgs> = {
	args: { onClose: fn() },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3497-ITEM-14: `noTitle` with no children, as FullFormDialog renders it without a title. It renders no heading, only the close button, and does not name the dialog: the dialog is named the MUI way, here by an `aria-label` on its paper (FullFormDialog's `aria-label` prop).",
			},
		},
	},
	render: (args) => (
		<Dialog open maxWidth="sm" fullWidth slotProps={noTitleDialogSlotProps}>
			<DialogTitle noTitle onClose={args.onClose}>
				{null}
			</DialogTitle>
			<DialogContent>
				<TextField label="First field" fullWidth />
			</DialogContent>
		</Dialog>
	),
	play: async ({ args }) => {
		const dialog = await page().findByRole("dialog");
		await waitFor(() => expect(dialog).toBeVisible());
		await expect(dialog).toHaveAccessibleName("Edit device");
		await expect(within(dialog).queryAllByRole("heading")).toHaveLength(0);
		await userEvent.click(
			within(dialog).getByRole("button", { name: "Close" }),
		);
		await expect(args.onClose).toHaveBeenCalledTimes(1);
	},
};

let releaseCopy: () => void = () => {};

interface BusyArgs {
	onCopy: () => Promise<void>;
}

export const Issue3497Item17BusyButtonKeepsFocus: StoryObj<BusyArgs> = {
	args: {
		onCopy: fn(
			() =>
				new Promise<void>((resolve) => {
					releaseCopy = resolve;
				}),
		),
	},
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3497-ITEM-17: activate Copy (an async `dontClose` button). While its handler runs, the dialog is `aria-busy`, its buttons are `aria-disabled` and ignore clicks, and Copy shows a spinner before its label. The buttons stay focusable, so focus stays on Copy while the handler runs and after it.",
			},
		},
	},
	render: (args) => (
		<Opener
			label="Open busy dialog"
			dialog={
				<InfoDialog
					title="Backup codes"
					message="Copy the codes before you close this dialog."
					buttons={[
						{
							text: "Copy",
							autoFocus: true,
							dontClose: true,
							onClick: args.onCopy,
						},
						{ text: "Close" },
					]}
				/>
			}
		/>
	),
	play: async ({ args, canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: "Open busy dialog" }),
		);
		const dialog = await page().findByRole("dialog", { name: "Backup codes" });
		const copy = within(dialog).getByRole("button", { name: "Copy" });
		const close = within(dialog).getByRole("button", { name: "Close" });
		const focused = () => {
			const active = document.activeElement;
			return active === copy
				? "Copy"
				: `${active?.tagName} ${active?.getAttribute("role") ?? ""} ${active?.className ?? ""}`;
		};
		const spinner = (button: HTMLElement) =>
			within(button).queryByRole("progressbar", { hidden: true });
		await waitFor(() => expect(copy).toHaveFocus());
		copy.click();
		await expect(args.onCopy).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(copy).toHaveAttribute("aria-disabled", "true"));
		// two rendering updates: the browser's focus fixup for a disabled
		// button has run
		await nextFrame();
		await nextFrame();
		const focusWhileRunning = focused();
		const busyWhileRunning = dialog.getAttribute("aria-busy");
		await expect(close).toHaveAttribute("aria-disabled", "true");
		await expect(spinner(copy)).not.toBeNull();
		await expect(spinner(close)).toBeNull();
		// the busy buttons stay clickable for the browser, the dialog ignores them
		copy.click();
		close.click();
		await nextFrame();
		await expect(args.onCopy).toHaveBeenCalledTimes(1);
		await expect(dialog).toBeInTheDocument();
		releaseCopy();
		await waitFor(() => expect(copy).not.toHaveAttribute("aria-disabled"));
		await expect(dialog).not.toHaveAttribute("aria-busy");
		await expect(spinner(copy)).toBeNull();
		// MUI's focus trap checks every 50ms for focus on the page body and
		// moves it into the dialog: measure after that has settled
		await new Promise((resolve) => setTimeout(resolve, 200));
		await expect({
			busyWhileRunning,
			focusWhileRunning,
			focusAfter: focused(),
		}).toEqual({
			busyWhileRunning: "true",
			focusWhileRunning: "Copy",
			focusAfter: "Copy",
		});
	},
};

interface BusyKeyboardArgs {
	onYes: () => Promise<void>;
	onNo: () => void;
}

export const Issue3497Item17BusyDialogWithKeyboard: StoryObj<BusyKeyboardArgs> =
	{
		args: {
			// never settles: the story ends with the dialog busy, so axe checks that state
			onYes: fn(() => new Promise<void>(() => {})),
			onNo: fn(),
		},
		parameters: {
			a11y: { test: "error" },
			docs: {
				description: {
					story:
						"ISSUE-3497-ITEM-17: Enter on Yes starts a handler that does not end. Focus stays on Yes, Tab still moves between the busy buttons, and Enter on No and Escape do nothing while the handler runs.",
				},
			},
		},
		render: (args) => (
			<Opener
				label="Open busy confirmation"
				dialog={
					<InfoDialog
						title="Create data export?"
						message="The export is prepared on the server."
						buttons={[
							{ text: "Yes", autoFocus: true, onClick: args.onYes },
							{ text: "No", color: "secondary", onClick: args.onNo },
						]}
					/>
				}
			/>
		),
		play: async ({ args, canvas }) => {
			await userEvent.click(
				canvas.getByRole("button", { name: "Open busy confirmation" }),
			);
			const dialog = await page().findByRole("dialog", {
				name: "Create data export?",
			});
			const yes = within(dialog).getByRole("button", { name: "Yes" });
			const no = within(dialog).getByRole("button", { name: "No" });
			await waitFor(() => expect(yes).toHaveFocus());
			await userEvent.keyboard("{Enter}");
			await expect(args.onYes).toHaveBeenCalledTimes(1);
			await waitFor(() => expect(dialog).toHaveAttribute("aria-busy", "true"));
			// two rendering updates: the browser's focus fixup for a disabled
			// button has run
			await nextFrame();
			await nextFrame();
			await expect(yes).toHaveFocus();
			await userEvent.tab();
			await expect(no).toHaveFocus();
			await expect(no).toHaveAttribute("aria-disabled", "true");
			await userEvent.keyboard("{Enter}");
			await userEvent.keyboard("{Escape}");
			await nextFrame();
			await expect(args.onNo).not.toHaveBeenCalled();
			await expect(dialog).toBeInTheDocument();
			await expect(no).toHaveFocus();
		},
	};

export const Issue3497Item18FocusShowsVisibleRing: StoryObj<ConfirmDialogArgs> =
	{
		args: { onYes: fn(), onNo: fn() },
		parameters: {
			a11y: { test: "error" },
			docs: {
				description: {
					story:
						"ISSUE-3497-ITEM-18: Tab to Cancel in a ConfirmDialog. The only focus cue is MUI's 30% ripple (about 1.65:1 for the secondary button), no outline, and nothing at all in forced-colors mode. Expected: a static focus ring of at least 2px and 3:1.",
				},
			},
		},
		render: (args) => <ConfirmDialogDemo {...args} />,
		play: async ({ canvas, userEvent: user }) => {
			await user.click(
				canvas.getByRole("button", { name: "Open Confirm Dialog" }),
			);
			const dialog = await page().findByRole("dialog", {
				name: "Confirm Action",
			});
			const yes = within(dialog).getByRole("button", { name: "Yes, Delete" });
			const no = within(dialog).getByRole("button", { name: "Cancel" });
			await waitFor(() => expect(yes).toHaveFocus());
			await user.tab();
			await expect(no).toHaveFocus();
			await waitFor(() => expect(no).toHaveClass("Mui-focusVisible"));
			const cs = getComputedStyle(no);
			const ring =
				(cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) ||
				cs.boxShadow !== "none";
			await expect(
				ring,
				`outline ${cs.outlineStyle} ${cs.outlineWidth}, box-shadow ${cs.boxShadow}`,
			).toBe(true);
		},
	};

const noop = () => {};

/** The simple dialogs whose buttons and paper ISSUE-3497-ITEM-18 checks */
const simpleDialogs = [
	{
		opener: "Open confirmation",
		title: "Delete device?",
		dialog: (
			<ConfirmDialog
				title="Delete device?"
				message="The device and its history are deleted."
				textButtonYes="Delete"
				textButtonNo="Cancel"
				handlerButtonYes={noop}
				handlerButtonNo={noop}
			/>
		),
	},
	{
		opener: "Open input",
		title: "Rename device",
		dialog: (
			<InputDialog
				title="Rename device"
				message="Enter the new name of the device."
				textButtonYes="Rename"
				textButtonNo="Cancel"
				textFieldLabel="Name"
				textFieldValidator={validateName}
				handlerButtonYes={noop}
				handlerButtonNo={noop}
			/>
		),
	},
	{
		opener: "Open form",
		title: "Export devices",
		dialog: (
			<FormDialog
				title="Export devices"
				message="Name the file of the export."
				inputs={<TextField label="File name" fullWidth />}
				buttons={[
					{ text: "Export", autoFocus: true },
					{ text: "Cancel", color: "secondary" },
				]}
			/>
		),
	},
];

const SimpleDialogOpeners = () => (
	<Stack direction="row" spacing={1}>
		{simpleDialogs.map((entry) => (
			<Opener key={entry.opener} label={entry.opener} dialog={entry.dialog} />
		))}
	</Stack>
);

/**
 * "ok" for a solid outline of at least 2px with 3:1 against the dialog's
 * paper, else what is there
 */
const focusRingOf = (button: Element) => {
	const cs = getComputedStyle(button);
	if (cs.outlineStyle !== "solid" || parseFloat(cs.outlineWidth) < 2)
		return `outline ${cs.outlineStyle} ${cs.outlineWidth}, box-shadow ${cs.boxShadow}`;
	// getContrastRatio ignores the alpha channel
	if (cs.outlineColor.startsWith("rgba")) return `outline ${cs.outlineColor}`;
	const paper = button.closest(`.${paperClasses.root}`);
	if (!paper) return "no paper around the button";
	const ratio = getContrastRatio(
		cs.outlineColor,
		getComputedStyle(paper).backgroundColor,
	);
	return ratio >= 3 ? "ok" : `outline at ${ratio.toFixed(2)}:1`;
};

/**
 * Tabs from where the dialog put focus to the first of its two buttons, then
 * to the second and back. Returns the focus ring of each, by label.
 */
const ringsOfDialogButtons = async (
	dialog: HTMLElement,
	user: { tab: (options?: { shift?: boolean }) => Promise<void> },
) => {
	const [first, second] = within(
		dialog.querySelector<HTMLElement>(".MuiDialogActions-root") ?? dialog,
	).getAllByRole("button");
	await waitFor(() =>
		expect(dialog).toContainElement(document.activeElement as HTMLElement),
	);
	for (let i = 0; i < 3 && document.activeElement !== first; i++)
		await user.tab();
	await expect(first).toHaveFocus();
	const rings: Record<string, string> = {};
	await user.tab();
	await expect(second).toHaveFocus();
	await waitFor(() => expect(second).toHaveClass("Mui-focusVisible"));
	rings[second.textContent ?? ""] = focusRingOf(second);
	await user.tab({ shift: true });
	await expect(first).toHaveFocus();
	await waitFor(() => expect(first).toHaveClass("Mui-focusVisible"));
	rings[first.textContent ?? ""] = focusRingOf(first);
	return rings;
};

export const Issue3497Item18EveryDialogButtonShowsRing: StoryObj = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3497-ITEM-18: a keyboard-focused button of ConfirmDialog (and so of ErrorDialog and InfoDialog), InputDialog and FormDialog draws a 2px solid outline in `palette.primary.main`, 2px outside the button, as MUI's own ring sits: at least 3:1 against the dialog. Forced-colors mode keeps outlines. MUI's focus ripple stays, and a click shows no ring.",
			},
		},
	},
	render: () => <SimpleDialogOpeners />,
	play: async ({ canvas, userEvent: user }) => {
		const rings: Record<string, Record<string, string>> = {};
		for (const { opener, title } of simpleDialogs) {
			await user.click(canvas.getByRole("button", { name: opener }));
			const dialog = await page().findByRole("dialog", { name: title });
			rings[title] = await ringsOfDialogButtons(dialog, user);
			await user.keyboard("{Escape}");
			await waitFor(() => expect(page().queryByRole("dialog")).toBeNull());
		}
		await expect(rings, "focus ring of each dialog button").toEqual({
			"Delete device?": { Delete: "ok", Cancel: "ok" },
			"Rename device": { Cancel: "ok", Rename: "ok" },
			"Export devices": { Export: "ok", Cancel: "ok" },
		});
	},
};

/** `width style color` of the border of `element`, or of each side when they differ */
const borderOf = (element: Element) => {
	const cs = getComputedStyle(element);
	const sides = ["Top", "Right", "Bottom", "Left"].map((side) =>
		["Width", "Style", "Color"]
			.map((part) => cs.getPropertyValue(`border-${side}-${part}`))
			.join(" "),
	);
	return new Set(sides).size === 1 ? sides[0] : sides.join(" / ");
};

/**
 * The border of `element` in forced colors, as far as the page's styles give
 * it one: the rules of every `@media (forced-colors: active)` block are
 * applied as if it matched. The browser's own forcing of colors is not
 * emulated.
 */
const forcedColorsBorderOf = (element: Element) => {
	const rules = Array.from(document.styleSheets)
		.flatMap((sheet) => {
			try {
				return Array.from(sheet.cssRules);
			} catch {
				// a cross-origin sheet
				return [];
			}
		})
		.filter(
			(rule): rule is CSSMediaRule =>
				rule instanceof CSSMediaRule &&
				rule.media.mediaText.includes("forced-colors: active"),
		)
		.flatMap((rule) => Array.from(rule.cssRules, (inner) => inner.cssText));
	const sheet = document.createElement("style");
	sheet.textContent = rules.join("\n");
	document.head.append(sheet);
	try {
		return borderOf(element);
	} finally {
		sheet.remove();
	}
};

/** A CSS system color, as getComputedStyle resolves it */
const systemColor = (name: string) => {
	const probe = document.createElement("div");
	probe.style.color = name;
	document.body.append(probe);
	try {
		return getComputedStyle(probe).color;
	} finally {
		probe.remove();
	}
};

export const Issue3497Item18PaperHasEdgeInForcedColors: StoryObj = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3497-ITEM-18: forced-colors mode drops the paper's shadow, so the paper of ConfirmDialog (and ErrorDialog, InfoDialog), InputDialog and FormDialog draws a 1px `CanvasText` border there, and the dialog keeps its edge over the page. Without forced colors the paper has no border.",
			},
		},
	},
	render: () => <SimpleDialogOpeners />,
	play: async ({ canvas, userEvent: user }) => {
		const edges: Record<string, { normal: string; forced: string }> = {};
		for (const { opener, title } of simpleDialogs) {
			await user.click(canvas.getByRole("button", { name: opener }));
			const dialog = await page().findByRole("dialog", { name: title });
			edges[title] = {
				normal: getComputedStyle(dialog).borderTopStyle,
				forced: forcedColorsBorderOf(dialog),
			};
			await user.keyboard("{Escape}");
			await waitFor(() => expect(page().queryByRole("dialog")).toBeNull());
		}
		const edge = {
			normal: "none",
			forced: `1px solid ${systemColor("CanvasText")}`,
		};
		await expect(edges, "border of each dialog's paper").toEqual({
			"Delete device?": edge,
			"Rename device": edge,
			"Export devices": edge,
		});
	},
};

export const Issue3497Item18CloseButtonShowsRing: StoryObj<DialogTitleArgs> = {
	args: { onClose: fn() },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3497-ITEM-18: the keyboard-focused close button of DialogTitle draws a 2px ring in `palette.primary.main` around its circle, as FullFormDialog's open-in-new button beside it does, at least 3:1 against the dialog.",
			},
		},
	},
	render: (args) => (
		<Dialog open>
			<DialogTitle onClose={args.onClose}>Device details</DialogTitle>
			<DialogContent>
				<DialogContentText>Serial number 4711.</DialogContentText>
			</DialogContent>
		</Dialog>
	),
	play: async ({ userEvent: user }) => {
		const dialog = await page().findByRole("dialog", {
			name: "Device details",
		});
		await waitFor(() => expect(dialog).toBeVisible());
		const close = within(dialog).getByRole("button", { name: "Close" });
		await user.tab();
		await expect(close).toHaveFocus();
		await waitFor(() => expect(close).toHaveClass("Mui-focusVisible"));
		await expect(focusRingOf(close), "focus ring of the close button").toBe(
			"ok",
		);
	},
};

/** A theme with a ring of its own: 3px in purple */
const themeRingTheme = createTheme({
	focusVisible: { outlineColor: "#9c27b0", outlineWidth: "3px" },
});

export const Issue3497Item18KeepsThemeFocusRing: StoryObj<ConfirmDialogArgs> = {
	args: { onYes: fn(), onNo: fn() },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3497-ITEM-18: with the theme's `focusVisible` option MUI draws the theme's ring (here 3px in purple) on the dialog buttons, and the dialog adds none of its own. The close button of DialogTitle leaves it to the theme the same way.",
			},
		},
	},
	render: (args) => (
		<ThemeProvider theme={themeRingTheme}>
			<ConfirmDialog
				title="Delete device?"
				message="The device and its history are deleted."
				textButtonYes="Delete"
				textButtonNo="Cancel"
				handlerButtonYes={args.onYes}
				handlerButtonNo={args.onNo}
			/>
		</ThemeProvider>
	),
	play: async ({ userEvent: user }) => {
		const dialog = await page().findByRole("dialog", {
			name: "Delete device?",
		});
		await waitFor(() => expect(dialog).toBeVisible());
		const buttons = within(dialog).getAllByRole("button");
		const rings: Record<string, string> = {};
		for (const button of [buttons[1], buttons[0]]) {
			await user.tab({ shift: button === buttons[0] });
			await expect(button).toHaveFocus();
			await waitFor(() => expect(button).toHaveClass("Mui-focusVisible"));
			const cs = getComputedStyle(button);
			rings[button.textContent ?? ""] =
				`${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`;
		}
		await expect(rings, "focus ring of each dialog button").toEqual({
			Delete: "3px solid rgb(156, 39, 176)",
			Cancel: "3px solid rgb(156, 39, 176)",
		});
	},
};

const LONG_TITLE =
	"Hochfrequenzchirurgiegerät Modell XYZ-2000 Sicherheitsmeldung Rückruf Charge 2026-17 Ersatzteile";

export const Issue3497Item19LongTitleReadableOnPhone: StoryObj<DialogTitleArgs> =
	{
		args: { onClose: fn() },
		globals: { viewport: { value: "mobile1", isRotated: false } },
		parameters: {
			a11y: { test: "error" },
			docs: {
				description: {
					story:
						"ISSUE-3497-ITEM-19: at 320px a long title wraps onto more lines, like MUI's `DialogTitle`, and a word wider than the line breaks, so the whole title can be read. The close button stays beside it, inside the dialog.",
				},
			},
		},
		render: (args) => (
			<Dialog open fullWidth maxWidth="md">
				<DialogTitle onClose={args.onClose}>{LONG_TITLE}</DialogTitle>
				<DialogContent>
					<DialogContentText>Dialog content.</DialogContentText>
				</DialogContent>
			</Dialog>
		),
		play: async () => {
			await page().findByRole("dialog");
			const text = page().getByText(LONG_TITLE);
			const close = page().getByRole("button", { name: "Close" });
			const paper = page().getByRole("dialog");
			// the close button stays inside the paper
			await expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(
				paper.getBoundingClientRect().right,
			);
			const readable =
				text.scrollWidth <= text.clientWidth ||
				text.getAttribute("title") === LONG_TITLE;
			await expect(
				readable,
				`text scrollWidth ${text.scrollWidth} > clientWidth ${text.clientWidth}, title ${text.getAttribute("title")}`,
			).toBe(true);
		},
	};

interface OpenInNewArgs {
	onOpenInNew: () => void;
}

export const Issue3497Item19OpenInNewStaysInDialog: StoryObj<OpenInNewArgs> = {
	args: { onOpenInNew: fn() },
	argTypes: {
		onOpenInNew: {
			description:
				"FullFormDialog's `openInNewLink`: shows the open-in-new icon after the title",
		},
	},
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3497-ITEM-19: a FullFormDialog with a long title and `openInNewLink` at 320px. The title wraps, and the open-in-new button beside the close button stays inside the dialog.",
			},
		},
	},
	render: (args) => (
		<FullFormDialog
			dialogTitle={LONG_TITLE}
			openInNewLink={args.onOpenInNew}
			maxWidth="md"
		>
			<Typography>The form.</Typography>
		</FullFormDialog>
	),
	play: async () => {
		const dialog = await page().findByRole("dialog", { name: LONG_TITLE });
		await waitFor(() => expect(dialog).toBeVisible());
		const button = within(dialog).getByRole("button", {
			name: "Open in new tab",
		});
		const dialogBox = dialog.getBoundingClientRect();
		const buttonBox = button.getBoundingClientRect();
		// inside the paper
		await expect({
			left: buttonBox.left >= dialogBox.left,
			right: buttonBox.right <= dialogBox.right,
			bottom: buttonBox.bottom <= dialogBox.bottom,
		}).toEqual({ left: true, right: true, bottom: true });
		await expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
	},
};

// ─── Navigation ──────────────────────────────────────────────────────────────

/** A device page whose button shows a dialog with a link to the device's manufacturer */
const NavigationDevicePage = () => {
	const [pushDialog] = useDialogContext();
	const open = useCallback(() => {
		pushDialog(
			<InfoDialog
				title="Manufacturer"
				message={
					<>
						{"Device 4711 is made by ACME Medical. "}
						<Link to="/manufacturers/7">Open the manufacturer</Link>
					</>
				}
				buttons={[{ text: "OK" }]}
			/>,
		);
	}, [pushDialog]);
	return (
		<Box component="main" sx={{ p: 2 }}>
			<PageTitle>Device 4711</PageTitle>
			<Button variant="contained" onClick={open}>
				Show manufacturer
			</Button>
		</Box>
	);
};

const NavigationManufacturerPage = () => (
	<Box component="main" sx={{ p: 2 }}>
		<PageTitle>Manufacturer ACME Medical</PageTitle>
		<Typography>Address, contacts, devices</Typography>
	</Box>
);

/** Two pages in a router of their own, whose DialogContextProvider follows its history */
const NavigationDemo = () => {
	const [history] = useState(() =>
		createMemoryHistory({ initialEntries: ["/devices/4711"] }),
	);
	return (
		<HistoryRouter history={history}>
			<DialogContextProvider>
				<Routes>
					<Route path="/devices/:id" element={<NavigationDevicePage />} />
					<Route
						path="/manufacturers/:id"
						element={<NavigationManufacturerPage />}
					/>
				</Routes>
			</DialogContextProvider>
		</HistoryRouter>
	);
};

export const Issue3475Item21LinkInDialogOpensItsPage: StoryObj = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3475-ITEM-21: a link in a pushed dialog. A navigation to another path closes the dialogs, so the new page shows, and the focus moves to its heading.",
			},
		},
	},
	render: () => <NavigationDemo />,
	play: async () => {
		await userEvent.click(
			await page().findByRole("button", { name: "Show manufacturer" }),
		);
		const dialog = await page().findByRole("dialog", { name: "Manufacturer" });
		await waitFor(() => expect(dialog).toBeVisible());
		await userEvent.click(
			within(dialog).getByRole("link", { name: "Open the manufacturer" }),
		);
		await waitFor(() => expect(page().queryByRole("dialog")).toBeNull());
		const heading = await page().findByRole("heading", {
			name: "Manufacturer ACME Medical",
		});
		await waitFor(() => expect(heading).toHaveFocus());
	},
};

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, within } from "storybook/test";
import i18next from "i18next";
import LocalizedKeyboardDatePicker from "./LocalizedKeyboardDatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Dialog, DialogContent } from "@mui/material";
import type { Moment } from "moment";

if (!i18next.isInitialized) {
	void i18next.init({ lng: "en", resources: {} });
}

const WithAdapter = ({ children }: { children: React.ReactNode }) => (
	<LocalizationProvider dateAdapter={AdapterMoment}>
		{children}
	</LocalizationProvider>
);

const meta: Meta = {
	title: "standalone/DatePickerInDialog",
	parameters: { layout: "centered" },
	decorators: [
		(Story) => (
			<WithAdapter>
				<Story />
			</WithAdapter>
		),
	],
};
export default meta;

// ---------------------------------------------------------------------------
// Standalone — Enter key should work
// ---------------------------------------------------------------------------

export const EnterKeyStandalone: StoryObj = {
	name: "Enter key selects date (standalone)",
	args: {
		onChange: fn(),
	},
	render: (args) => {
		const [value, setValue] = useState<Moment | null>(null);
		return (
			<LocalizedKeyboardDatePicker
				label="Date"
				value={value}
				onChange={(v) => {
					setValue(v);
					(args.onChange as (v: Moment | null) => void)(v);
				}}
			/>
		);
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement.ownerDocument.body);

		// Click the calendar icon to open the popover
		const openButton = canvas.getByRole("button", {
			name: /choose date/i,
		});
		await userEvent.click(openButton);

		// Wait for the calendar grid to appear
		await canvas.findByRole("grid", {}, { timeout: 3000 });

		// Press Enter to select the currently focused date (today)
		await userEvent.keyboard("{Enter}");

		// Verify onChange was called
		await expect(args.onChange).toHaveBeenCalled();
	},
};

// ---------------------------------------------------------------------------
// Inside Dialog — Enter key should also work
// ---------------------------------------------------------------------------

export const EnterKeyInDialog: StoryObj = {
	name: "Enter key selects date (inside Dialog)",
	args: {
		onChange: fn(),
	},
	render: (args) => {
		const [value, setValue] = useState<Moment | null>(null);
		return (
			<Dialog open={true}>
				<DialogContent>
					<LocalizedKeyboardDatePicker
						label="Date"
						value={value}
						onChange={(v) => {
							setValue(v);
							(args.onChange as (v: Moment | null) => void)(v);
						}}
					/>
				</DialogContent>
			</Dialog>
		);
	},
	play: async ({ args }) => {
		const body = within(document.body);

		// Click the calendar icon to open the popover
		const openButton = body.getByRole("button", {
			name: /choose date/i,
		});
		await userEvent.click(openButton);

		// Wait for the calendar grid to appear
		await body.findByRole("grid", {}, { timeout: 3000 });

		// Wait to allow the Dialog's focus trap enforcement interval to fire.
		await new Promise((r) => setTimeout(r, 200));

		// Press Enter to select the currently focused date (today).
		// Without disablePortal, the calendar popover renders outside the
		// Dialog's DOM via Portal, which can cause the Dialog's focus trap
		// to steal focus and prevent keyboard interaction.
		await userEvent.keyboard("{Enter}");

		// Verify onChange was called
		await expect(args.onChange).toHaveBeenCalled();
	},
};

// ---------------------------------------------------------------------------
// Structural test: verify popover is inside Dialog DOM (disablePortal)
// ---------------------------------------------------------------------------

export const PopoverInsideDialogDom: StoryObj = {
	name: "Calendar popover renders inside Dialog DOM",
	render: () => {
		const [value, setValue] = useState<Moment | null>(null);
		return (
			<Dialog open={true}>
				<DialogContent>
					<LocalizedKeyboardDatePicker
						label="Date"
						value={value}
						onChange={setValue}
					/>
				</DialogContent>
			</Dialog>
		);
	},
	play: async () => {
		const body = within(document.body);

		// Open the calendar popover
		const openButton = body.getByRole("button", {
			name: /choose date/i,
		});
		await userEvent.click(openButton);

		// Wait for the calendar grid
		await body.findByRole("grid", {}, { timeout: 3000 });

		// The Dialog root and the Popper root should share a DOM ancestor.
		// With disablePortal, the Popper is a child of the DatePicker which
		// is inside the Dialog. Without it, the Popper is a sibling at <body>.
		const dialogRoot = document.querySelector(".MuiDialog-root");
		const popperRoot = document.querySelector(".MuiPickerPopper-root");

		await expect(dialogRoot).toBeTruthy();
		await expect(popperRoot).toBeTruthy();

		// The popper should be inside the dialog's DOM tree
		await expect(dialogRoot?.contains(popperRoot ?? null)).toBe(true);
	},
};

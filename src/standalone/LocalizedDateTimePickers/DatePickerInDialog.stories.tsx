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
		// The calendar popover renders via Portal at <body>, outside the
		// Dialog's DOM. This guards against the Dialog's focus trap stealing
		// focus and preventing keyboard interaction (regression guard).
		await userEvent.keyboard("{Enter}");

		// Verify onChange was called
		await expect(args.onChange).toHaveBeenCalled();
	},
};

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	waitFor,
	act,
} from "@testing-library/react";
import {
	ThemeProvider,
	createTheme,
	Dialog,
	DialogContent,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import DateInput from "../../src/standalone/UIKit/InputControls/DateInput";

const theme = createTheme();

const wrap = (ui: React.ReactNode) =>
	render(
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				{ui}
			</LocalizationProvider>
		</ThemeProvider>,
	);

afterEach(() => {
	cleanup();
});

/**
 * Helper: open the date picker popover, find a day cell, press Enter.
 */
async function openAndPressEnterOnDay(onChange: ReturnType<typeof vi.fn>) {
	// Click the calendar icon button to open the popover
	const openButton = screen.getByRole("button", {
		name: /choose date/i,
	});
	await act(async () => {
		fireEvent.click(openButton);
	});

	// Wait for calendar grid cells to render
	await waitFor(() => {
		const gridcells = screen.queryAllByRole("gridcell");
		expect(gridcells.length).toBeGreaterThan(0);
	});

	// Find today's cell or first available day cell
	const todayCell =
		document.querySelector('[aria-current="date"]') ??
		screen.getAllByRole("gridcell")[0];
	const dayButton =
		todayCell.querySelector("button") ?? (todayCell as HTMLElement);
	expect(dayButton).toBeTruthy();

	await act(async () => {
		(dayButton as HTMLElement).focus();
		fireEvent.keyDown(dayButton as HTMLElement, {
			key: "Enter",
			code: "Enter",
		});
	});
}

describe("DateInput Enter key in popover", () => {
	it("selects a date with Enter when mounted standalone", async () => {
		const onChange = vi.fn();
		wrap(<DateInput value={null} onChange={onChange} label="Date" />);

		await openAndPressEnterOnDay(onChange);

		await waitFor(() => {
			expect(onChange).toHaveBeenCalled();
		});
	});

	it("selects a date with Enter when inside a MUI Dialog", async () => {
		const onChange = vi.fn();
		wrap(
			<Dialog open={true}>
				<DialogContent>
					<DateInput value={null} onChange={onChange} label="Date" />
				</DialogContent>
			</Dialog>,
		);

		await openAndPressEnterOnDay(onChange);

		// onChange should have been called — this is the key assertion
		// that fails when the Dialog's focus trap interferes with the popover
		await waitFor(() => {
			expect(onChange).toHaveBeenCalled();
		});
	});

	it("renders the calendar popover inside the Dialog DOM (disablePortal)", async () => {
		wrap(
			<Dialog open={true}>
				<DialogContent>
					<DateInput value={null} onChange={() => {}} label="Date" />
				</DialogContent>
			</Dialog>,
		);

		// Open the calendar popover
		const openButton = screen.getByRole("button", {
			name: /choose date/i,
		});
		await act(async () => {
			fireEvent.click(openButton);
		});

		// Wait for calendar to render
		await waitFor(() => {
			const gridcells = screen.queryAllByRole("gridcell");
			expect(gridcells.length).toBeGreaterThan(0);
		});

		// With disablePortal on the Popper, the calendar should be INSIDE
		// the Dialog's DOM tree, not as a separate portal sibling at body level.
		// The Dialog uses role="presentation" on its root.
		const dialogPresentation = document.querySelector(
			".MuiDialog-root",
		);
		expect(dialogPresentation).toBeTruthy();

		// The Popper (contains the calendar grid) should be a descendant.
		// With disablePortal, it renders inline. Without it, it's a body-level sibling.
		const popperInDialog = dialogPresentation!.querySelector(
			'[role="dialog"].MuiPopper-root',
		);
		expect(popperInDialog).toBeTruthy();
	});
});

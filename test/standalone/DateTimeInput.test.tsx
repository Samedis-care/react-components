import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import DateTimeInput from "../../src/standalone/UIKit/InputControls/DateTimeInput";

/**
 * DateTimeInput: LocalizedDateTimePicker with PickersTextFieldWithHelp as its
 * text field. Its value is a local Moment, unlike DateInput's date-only Date.
 */

// jsdom has "ontouchstart" on window, so isTouchDevice() is true unless mocked
const env = vi.hoisted(() => ({ touch: false }));
vi.mock("../../src/utils/isTouchDevice", () => ({
	default: () => env.touch,
}));

const theme = createTheme();
const tree = (node: React.ReactNode) => (
	<ThemeProvider theme={theme}>
		<LocalizationProvider dateAdapter={AdapterMoment}>
			{node}
		</LocalizationProvider>
	</ThemeProvider>
);
const wrap = (ui: React.ReactNode) => {
	const result = render(tree(ui));
	return {
		...result,
		rerender: (node: React.ReactNode) => result.rerender(tree(node)),
	};
};

afterEach(() => {
	cleanup();
	env.touch = false;
});

const noop = () => {};

const openButton = () => screen.findByRole("button", { name: /choose date/i });

describe("DateTimeInput", () => {
	describe("bugs", () => {
		it("[ISSUE-3485-ITEM-13] links a helperText prop to the field group", async () => {
			wrap(
				<DateTimeInput
					label="At"
					value={null}
					onChange={noop}
					error
					helperText="Time is required"
				/>,
			);
			await openButton();
			expect(
				screen.getByRole("group", { name: "At" }),
			).toHaveAccessibleDescription("Time is required");
		});

		it("[ISSUE-3485-ITEM-13] shows helperText in place of slotProps.textField.helperText, which stays without it", async () => {
			const hint = { textField: { helperText: "Local time" } };
			const { rerender } = wrap(
				<DateTimeInput
					label="At"
					value={null}
					onChange={noop}
					error
					helperText="Time is required"
					slotProps={hint}
				/>,
			);
			await openButton();
			expect(
				screen.getByRole("group", { name: "At" }),
			).toHaveAccessibleDescription("Time is required");
			expect(screen.queryByText("Local time")).toBeNull();

			rerender(
				<DateTimeInput
					label="At"
					value={null}
					onChange={noop}
					slotProps={hint}
				/>,
			);
			expect(
				screen.getByRole("group", { name: "At" }),
			).toHaveAccessibleDescription("Local time");
		});
	});
});

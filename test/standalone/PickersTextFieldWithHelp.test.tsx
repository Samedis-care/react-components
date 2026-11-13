import { afterEach, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import DateInput from "../../src/standalone/UIKit/InputControls/DateInput";

/**
 * PickersTextFieldWithHelp is the text field slot of DateInput and
 * DateTimeInput; it cannot render without a picker around it.
 */

// jsdom has "ontouchstart" on window, so isTouchDevice() is true unless mocked
const env = vi.hoisted(() => ({ touch: true }));
vi.mock("../../src/utils/isTouchDevice", () => ({
	default: () => env.touch,
}));

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
	env.touch = true;
});

const DAY = new Date("2026-08-01T12:00:00.000Z");
const noop = () => {};

describe("PickersTextFieldWithHelp", () => {
	describe("touch Clear in DateInput", () => {
		it("[ISSUE-3483-ITEM-2] shows no Clear while the date is read-only", async () => {
			const onChange = vi.fn();
			wrap(<DateInput label="Day" value={DAY} onChange={onChange} readOnly />);
			await screen.findByRole("button", { name: /choose date/i });
			expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
		});

		it("[ISSUE-3483-ITEM-2] shows Clear once the date is no longer read-only", async () => {
			const Host = () => {
				const [readOnly, setReadOnly] = useState(true);
				return (
					<>
						<button type="button" onClick={() => setReadOnly(false)}>
							Edit
						</button>
						<DateInput
							label="Day"
							value={DAY}
							onChange={noop}
							readOnly={readOnly}
						/>
					</>
				);
			};
			wrap(<Host />);
			await screen.findByRole("button", { name: /choose date/i });
			expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
			fireEvent.click(screen.getByRole("button", { name: "Edit" }));
			expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
		});
	});
});

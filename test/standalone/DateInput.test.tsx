import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import DateInput from "../../src/standalone/UIKit/InputControls/DateInput";

/**
 * DateInput deals in date-only values (12:00 UTC, UTC parts carry the date).
 * The zones below are the ones a mismatch between the local and the UTC parts
 * shows up in: at or beyond UTC+12 the day shifts forward, behind UTC it shifts
 * backward.
 */
const ZONES = [
	"Pacific/Kiritimati", // UTC+14
	"Pacific/Auckland", // UTC+12
	"Europe/Berlin", // UTC+2
	"UTC",
	"America/New_York", // UTC-4
	"America/Los_Angeles", // UTC-7
	"Etc/GMT+12", // UTC-12
];

afterEach(() => {
	cleanup();
	vi.unstubAllEnvs();
});

const theme = createTheme();

const wrap = (ui: React.ReactNode) =>
	render(
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				{ui}
			</LocalizationProvider>
		</ThemeProvider>,
	);

/** The date the picker's text field currently shows, as MM/DD/YYYY */
const shownDate = (container: HTMLElement) =>
	container.querySelector<HTMLInputElement>("input[value]")?.value;

const openCalendar = async () => {
	act(() => {
		fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
	});
	await waitFor(() => {
		expect(screen.queryAllByRole("gridcell").length).toBeGreaterThan(0);
	});
};

const clickDay = (day: string) => {
	const cell = screen
		.getAllByRole("gridcell")
		.find((candidate) => candidate.textContent === day);
	expect(cell, `day cell ${day}`).toBeTruthy();
	act(() => {
		fireEvent.click(cell as HTMLElement);
	});
};

describe("DateInput", () => {
	it("shows the stored calendar day in every timezone", () => {
		for (const tz of ZONES) {
			vi.stubEnv("TZ", tz);
			const { container } = wrap(
				<DateInput
					value={new Date("2026-08-13T12:00:00.000Z")}
					onChange={vi.fn()}
					label="Date"
				/>,
			);
			expect(shownDate(container), tz).toBe("08/13/2026");
			cleanup();
		}
	});

	it("emits the picked day as a date-only value in every timezone", async () => {
		for (const tz of ZONES) {
			vi.stubEnv("TZ", tz);
			const onChange = vi.fn();
			wrap(
				<DateInput
					value={new Date("2026-08-13T12:00:00.000Z")}
					onChange={onChange}
					label="Date"
				/>,
			);

			await openCalendar();
			clickDay("20");

			await waitFor(() => {
				expect(onChange, tz).toHaveBeenCalled();
			});
			const emitted = onChange.mock.calls[0][0] as Date;
			expect(emitted.toISOString(), tz).toBe("2026-08-20T12:00:00.000Z");
			cleanup();
		}
	});

	it("round trips its own output without shifting the day", async () => {
		for (const tz of ZONES) {
			vi.stubEnv("TZ", tz);
			const onChange = vi.fn();
			wrap(
				<DateInput
					value={new Date("2026-08-13T12:00:00.000Z")}
					onChange={onChange}
					label="Date"
				/>,
			);
			await openCalendar();
			clickDay("20");
			await waitFor(() => {
				expect(onChange, tz).toHaveBeenCalled();
			});
			cleanup();

			// feed the emitted value straight back in, as a form would
			const { container } = wrap(
				<DateInput
					value={onChange.mock.calls[0][0] as Date}
					onChange={vi.fn()}
					label="Date"
				/>,
			);
			expect(shownDate(container), tz).toBe("08/20/2026");
			cleanup();
		}
	});

	it("emits null when cleared", () => {
		vi.stubEnv("TZ", "Pacific/Auckland");
		wrap(
			<DateInput
				value={new Date("2026-08-13T12:00:00.000Z")}
				onChange={vi.fn()}
				label="Date"
			/>,
		);
		expect(screen.getByRole("button", { name: /clear/i })).toBeTruthy();
	});
});

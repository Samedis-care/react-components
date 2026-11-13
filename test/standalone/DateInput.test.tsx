import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
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
	vi.restoreAllMocks();
});

const theme = createTheme();

/** Records the first error a render throws, so a crash fails an assertion */
class Boundary extends React.Component<
	{ children: React.ReactNode },
	{ error: string | null }
> {
	state = { error: null as string | null };
	static getDerivedStateFromError(error: Error) {
		return { error: String(error?.message ?? error) };
	}
	render() {
		return this.state.error ? (
			<div data-testid="crash">{this.state.error}</div>
		) : (
			this.props.children
		);
	}
}

const wrap = (ui: React.ReactNode, withTheme = theme) => {
	const tree = (node: React.ReactNode) => (
		<ThemeProvider theme={withTheme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<Boundary>{node}</Boundary>
			</LocalizationProvider>
		</ThemeProvider>
	);
	const result = render(tree(ui));
	return {
		...result,
		rerender: (node: React.ReactNode) => result.rerender(tree(node)),
	};
};

/** A stored date-only value: noon UTC, the UTC parts carrying the day */
const DAY = new Date("2026-08-13T12:00:00.000Z");
const noop = () => {};

type DateInputProps = React.ComponentProps<typeof DateInput>;

/** The date the picker's text field currently shows, as MM/DD/YYYY */
const shownDate = (container: HTMLElement) =>
	container.querySelector<HTMLInputElement>("input[value]")?.value;

/** The date-only value of each call of a callback (its first argument), as ISO strings */
const reportedDays = (callback: ReturnType<typeof vi.fn>) =>
	callback.mock.calls.map(
		(call) => (call[0] as Date | null)?.toISOString() ?? null,
	);

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

describe("DateInput bugs", () => {
	it("[ISSUE-3485-ITEM-2] takes minDate as a date-only value, like value, in every timezone", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		for (const tz of [
			"Pacific/Auckland",
			"Europe/Berlin",
			"America/New_York",
		]) {
			vi.stubEnv("TZ", tz);
			const onError = vi.fn();
			wrap(
				<DateInput
					label="Day"
					value={DAY}
					onChange={noop}
					// the same kind of value `value` takes
					minDate={DAY}
					onError={onError}
				/>,
			);
			expect(screen.queryByTestId("crash")?.textContent ?? null, tz).toBeNull();
			expect(
				screen.getByRole("group", { name: "Day" }),
				tz,
			).not.toHaveAttribute("aria-invalid", "true");
			expect(onError, tz).not.toHaveBeenCalledWith(
				"minDate",
				expect.anything(),
			);
			cleanup();
		}
	});

	it("[ISSUE-3485-ITEM-2] takes maxDate as a date-only value and gives onError the day it rejects as one", () => {
		for (const tz of ["Pacific/Kiritimati", "Pacific/Auckland", "Etc/GMT+12"]) {
			vi.stubEnv("TZ", tz);
			const onError = vi.fn();
			const { rerender } = wrap(
				<DateInput
					label="Day"
					value={DAY}
					onChange={noop}
					maxDate={DAY}
					onError={onError}
				/>,
			);
			expect(
				screen.getByRole("group", { name: "Day" }),
				tz,
			).not.toHaveAttribute("aria-invalid", "true");
			expect(onError, tz).not.toHaveBeenCalled();

			rerender(
				<DateInput
					label="Day"
					value={DAY}
					onChange={noop}
					maxDate={new Date("2026-08-12T12:00:00.000Z")}
					onError={onError}
				/>,
			);
			expect(screen.getByRole("group", { name: "Day" }), tz).toHaveAttribute(
				"aria-invalid",
				"true",
			);
			expect(onError, tz).toHaveBeenLastCalledWith("maxDate", DAY);
			cleanup();
		}
	});

	it("[ISSUE-3485-ITEM-2] gives onError null for an entry that is no valid day", () => {
		const onError = vi.fn();
		wrap(
			<DateInput
				label="Day"
				value={new Date("2026-01-31T12:00:00.000Z")}
				onChange={noop}
				onError={onError}
			/>,
		);
		const month = screen.getAllByRole("spinbutton")[0];
		act(() => month.focus());
		act(() => {
			fireEvent.keyDown(month, { key: "ArrowUp" });
		});
		expect(onError.mock.calls).toEqual([["invalidDate", null]]);
	});

	it("[ISSUE-3485-ITEM-2] asks shouldDisableDate about date-only days, in the calendar too", async () => {
		for (const tz of ["Pacific/Auckland", "America/New_York"]) {
			vi.stubEnv("TZ", tz);
			const onError = vi.fn();
			const isTheTwentieth = (day: Date) =>
				day.toISOString() === "2026-08-20T12:00:00.000Z";
			wrap(
				<DateInput
					label="Day"
					value={new Date("2026-08-20T12:00:00.000Z")}
					onChange={noop}
					shouldDisableDate={isTheTwentieth}
					onError={onError}
				/>,
			);
			expect(onError, tz).toHaveBeenLastCalledWith(
				"shouldDisableDate",
				new Date("2026-08-20T12:00:00.000Z"),
			);
			await openCalendar();
			const cell = (day: string) =>
				screen
					.getAllByRole("gridcell")
					.find((candidate) => candidate.textContent === day);
			expect(cell("20"), tz).toBeDisabled();
			expect(cell("19"), tz).not.toBeDisabled();
			expect(cell("21"), tz).not.toBeDisabled();
			cleanup();
		}
	});

	it("[ISSUE-3485-ITEM-2] asks shouldDisableMonth and shouldDisableYear about date-only values", () => {
		// local midnight of a month's first day is still the month before in UTC
		// here, so a value that is not converted lands in the wrong month and year
		vi.stubEnv("TZ", "Pacific/Auckland");
		const onError = vi.fn();
		const { rerender } = wrap(
			<DateInput
				label="Day"
				value={new Date("2026-09-01T12:00:00.000Z")}
				onChange={noop}
				shouldDisableMonth={(month) => month.getUTCMonth() === 8}
				onError={onError}
			/>,
		);
		expect(onError).toHaveBeenLastCalledWith(
			"shouldDisableMonth",
			new Date("2026-09-01T12:00:00.000Z"),
		);
		rerender(
			<DateInput
				label="Day"
				value={new Date("2026-01-01T12:00:00.000Z")}
				onChange={noop}
				shouldDisableYear={(year) => year.getUTCFullYear() === 2026}
				onError={onError}
			/>,
		);
		expect(onError).toHaveBeenLastCalledWith(
			"shouldDisableYear",
			new Date("2026-01-01T12:00:00.000Z"),
		);
	});

	it("[ISSUE-3485-ITEM-2] reports a calendar pick to onAccept as a date-only value", async () => {
		for (const tz of ["Pacific/Auckland", "America/New_York"]) {
			vi.stubEnv("TZ", tz);
			const onAccept = vi.fn();
			wrap(
				<DateInput
					label="Day"
					value={DAY}
					onChange={noop}
					onAccept={onAccept}
				/>,
			);
			await openCalendar();
			clickDay("20");
			await waitFor(() => {
				expect(onAccept, tz).toHaveBeenCalled();
			});
			expect(reportedDays(onAccept), tz).toEqual(["2026-08-20T12:00:00.000Z"]);
			cleanup();
		}
	});

	it("[ISSUE-3485-ITEM-2] opens the calendar of an empty field on the referenceDate's day", async () => {
		vi.stubEnv("TZ", "Pacific/Auckland");
		wrap(
			<DateInput
				label="Day"
				value={null}
				onChange={noop}
				referenceDate={new Date("2026-08-31T12:00:00.000Z")}
			/>,
		);
		await openCalendar();
		expect(screen.getByText("August 2026")).toBeInTheDocument();
	});

	it("[ISSUE-3485-ITEM-2] reports month and year changes in the calendar as date-only values", async () => {
		vi.stubEnv("TZ", "Pacific/Auckland");
		const onMonthChange = vi.fn();
		const onYearChange = vi.fn();
		wrap(
			<DateInput
				label="Day"
				value={new Date("2026-12-13T12:00:00.000Z")}
				onChange={noop}
				onMonthChange={onMonthChange}
				onYearChange={onYearChange}
			/>,
		);
		await openCalendar();
		act(() => {
			fireEvent.click(screen.getByRole("button", { name: /next month/i }));
		});
		await waitFor(() => {
			expect(onMonthChange).toHaveBeenCalled();
		});
		expect(reportedDays(onMonthChange)).toEqual(["2027-01-01T12:00:00.000Z"]);
		expect(reportedDays(onYearChange)).toEqual(["2027-01-01T12:00:00.000Z"]);
	});

	it("[ISSUE-3485-ITEM-2] formats the calendar's weekdays from date-only values", async () => {
		vi.stubEnv("TZ", "Pacific/Auckland");
		const names = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
		wrap(
			<DateInput
				label="Day"
				value={DAY}
				onChange={noop}
				dayOfWeekFormatter={(day) => names[day.getUTCDay()]}
			/>,
		);
		await openCalendar();
		expect(
			screen.getAllByRole("columnheader").map((header) => header.textContent),
		).toEqual(names);
	});

	it("[ISSUE-3485-ITEM-2] types its date props as date-only values and has no defaultValue", () => {
		expectTypeOf<DateInputProps["minDate"]>().toEqualTypeOf<Date | undefined>();
		expectTypeOf<DateInputProps["maxDate"]>().toEqualTypeOf<Date | undefined>();
		expectTypeOf<DateInputProps["referenceDate"]>().toEqualTypeOf<
			Date | undefined
		>();
		expectTypeOf<NonNullable<DateInputProps["shouldDisableDate"]>>()
			.parameter(0)
			.toEqualTypeOf<Date>();
		expectTypeOf<NonNullable<DateInputProps["onAccept"]>>()
			.parameter(0)
			.toEqualTypeOf<Date | null>();
		expectTypeOf<NonNullable<DateInputProps["onError"]>>()
			.parameter(1)
			.toEqualTypeOf<Date | null>();
		expectTypeOf<DateInputProps>().not.toHaveProperty("defaultValue");
	});

	it("[ISSUE-3485-ITEM-13] links a helperText prop to the field group", async () => {
		wrap(
			<DateInput
				label="Due"
				value={null}
				onChange={noop}
				error
				helperText="Date is required"
			/>,
		);
		await screen.findByRole("button", { name: /choose date/i });
		expect(
			screen.getByRole("group", { name: "Due" }),
		).toHaveAccessibleDescription("Date is required");
	});

	it("[ISSUE-3485-ITEM-13] shows helperText in place of slotProps.textField.helperText, which stays without it", async () => {
		const hint = { textField: { helperText: "Day of delivery" } };
		wrap(
			<DateInput
				label="Due"
				value={null}
				onChange={noop}
				error
				helperText="Date is required"
				slotProps={hint}
			/>,
		);
		await screen.findByRole("button", { name: /choose date/i });
		expect(
			screen.getByRole("group", { name: "Due" }),
		).toHaveAccessibleDescription("Date is required");
		expect(screen.queryByText("Day of delivery")).toBeNull();
		cleanup();

		wrap(
			<DateInput label="Due" value={null} onChange={noop} slotProps={hint} />,
		);
		await screen.findByRole("button", { name: /choose date/i });
		expect(
			screen.getByRole("group", { name: "Due" }),
		).toHaveAccessibleDescription("Day of delivery");
	});
});

import { afterEach, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import FilterEntry, {
	type IFilterDef,
} from "../../src/standalone/DataGrid/Content/FilterEntry";
import {
	DataGridPropsContext,
	type DataGridProps,
} from "../../src/standalone/DataGrid/DataGrid";

/**
 * The pickers as the DataGrid's column filter uses them: FilterEntry turns the
 * stored filter strings into picker values and the reported values back into
 * filter strings. A filter can come from saved grid state or a URL, so whatever
 * is stored there has to render.
 */

afterEach(cleanup);

const theme = createTheme();
const GRID_PROPS = {} as DataGridProps;

const renderFilter = (
	valueType: "date" | "datetime",
	value: IFilterDef,
	onChange = vi.fn<(def: IFilterDef) => void>(),
) => {
	render(
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<DataGridPropsContext.Provider value={GRID_PROPS}>
					<FilterEntry
						field="due"
						valueType={valueType}
						valueData={undefined}
						value={value}
						onChange={onChange}
						close={vi.fn()}
						depth={1}
					/>
				</DataGridPropsContext.Provider>
			</LocalizationProvider>
		</ThemeProvider>,
	);
	return onChange;
};

/**
 * Renders the filter as the grid holds it: every change is stored and handed
 * back as `value`, so the pickers see what they reported
 */
const renderStoredFilter = (
	valueType: "date" | "datetime",
	initial: IFilterDef,
) => {
	const onChange = vi.fn<(def: IFilterDef) => void>();
	const Stored = () => {
		const [value, setValue] = useState(initial);
		return (
			<FilterEntry
				field="due"
				valueType={valueType}
				valueData={undefined}
				value={value}
				onChange={(def) => {
					setValue(def);
					onChange(def);
				}}
				close={vi.fn()}
				depth={1}
			/>
		);
	};
	render(
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<DataGridPropsContext.Provider value={GRID_PROPS}>
					<Stored />
				</DataGridPropsContext.Provider>
			</LocalizationProvider>
		</ThemeProvider>,
	);
	return onChange;
};

/**
 * Types one digit into a field section, as MUI's field reads it: from the
 * section's text after the browser's input event
 */
const typeDigit = (section: HTMLElement, digit: string) => {
	act(() => {
		section.textContent = digit;
		fireEvent.input(section);
	});
};

/** Moves focus from the date field to the filter type select */
const leaveField = () => {
	act(() => {
		screen.getAllByRole("combobox")[0].focus();
	});
};

describe("date pickers in the DataGrid column filter", () => {
	it.each(["date", "datetime"] as const)(
		"[ISSUE-3474-ITEM-1] renders a stored %s filter value that is not a date",
		(valueType) => {
			const consoleError = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});
			const consoleWarn = vi
				.spyOn(console, "warn")
				.mockImplementation(() => {});
			try {
				renderFilter(valueType, {
					type: "equals",
					value1: "not-a-date",
					value2: "",
				});
			} finally {
				consoleError.mockRestore();
				consoleWarn.mockRestore();
			}
			expect(screen.getAllByRole("group").length).toBeGreaterThan(0);
		},
	);

	it("[ISSUE-3474-ITEM-21] names the two pickers of a date range filter", () => {
		renderFilter("date", {
			type: "inRange",
			value1: "2026-08-01T12:00:00.000Z",
			value2: "2026-08-31T12:00:00.000Z",
		});
		// the field groups of the two pickers come first; the chained filter's
		// combinator and picker follow them
		const groups = screen.getAllByRole("group");
		expect(groups[0]).toHaveAccessibleName("From");
		expect(groups[1]).toHaveAccessibleName("To");
	});

	it("[ISSUE-3474-ITEM-21] names the two pickers of a date/time range filter", () => {
		renderFilter("datetime", {
			type: "inRange",
			value1: "2026-08-01T10:00:00.000Z",
			value2: "2026-08-31T18:00:00.000Z",
		});
		const groups = screen.getAllByRole("group");
		expect(groups[0]).toHaveAccessibleName("From");
		expect(groups[1]).toHaveAccessibleName("To");
	});

	it.each([
		["date", "Date"],
		["datetime", "Date and time"],
	] as const)(
		"[ISSUE-3474-ITEM-21] names the picker of a single %s filter",
		(valueType, name) => {
			renderFilter(valueType, {
				type: "equals",
				value1: "2026-08-01T12:00:00.000Z",
				value2: "",
			});
			expect(screen.getAllByRole("group")[0]).toHaveAccessibleName(name);
		},
	);

	it("[ISSUE-3474-ITEM-4] writes the upper bound of a date/time range from the second picker", () => {
		const from = moment("2026-08-01T10:00").toISOString();
		const to = moment("2026-08-31T18:00").toISOString();
		const onChange = renderFilter("datetime", {
			type: "inRange",
			value1: from,
			value2: to,
		});
		const toPicker = screen.getAllByRole("group")[1];
		const day = within(toPicker).getAllByRole("spinbutton")[1];
		act(() => {
			day.focus();
		});
		act(() => {
			fireEvent.keyDown(day, { key: "ArrowDown" });
		});
		// the filter takes the date once the user is done with the field
		leaveField();
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0]).toMatchObject({
			type: "inRange",
			value1: from,
			value2: moment("2026-08-30T18:00").toISOString(),
		});
	});

	it("[ISSUE-3474-ITEM-4] keeps the lower bound and the chained filter when the second picker of a date/time range is cleared", () => {
		const from = moment("2026-08-01T10:00").toISOString();
		const to = moment("2026-08-31T18:00").toISOString();
		const nextFilter: IFilterDef = {
			type: "equals",
			value1: moment("2026-09-05T10:00").toISOString(),
			value2: "",
		};
		const onChange = renderFilter("datetime", {
			type: "inRange",
			value1: from,
			value2: to,
			nextFilterType: "or",
			nextFilter,
		});
		const toPicker = screen.getAllByRole("group")[1];
		const day = within(toPicker).getAllByRole("spinbutton")[1];
		act(() => {
			day.focus();
		});
		act(() => {
			fireEvent.keyDown(day, { key: "Delete" });
		});
		// the filter takes the date once the user is done with the field
		leaveField();
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0]).toMatchObject({
			type: "inRange",
			value1: from,
			value2: "",
			nextFilterType: "or",
			nextFilter,
		});
	});

	it.each(["date", "datetime"] as const)(
		"[ISSUE-3474-ITEM-25] fills the popup's width with both pickers of a %s range, as a picker at its own width grows to fit its date",
		(valueType) => {
			renderFilter(valueType, {
				type: "inRange",
				value1: "2026-08-01T12:00:00.000Z",
				value2: "2026-08-31T12:00:00.000Z",
			});
			for (const name of ["From", "To"]) {
				expect(
					screen.getByRole("group", { name }).closest(".MuiFormControl-root"),
				).toHaveClass("MuiFormControl-fullWidth");
			}
		},
	);

	it("[ISSUE-3474-ITEM-12] keeps the filter and its chained filter while a day is retyped, and applies the new day when focus leaves", () => {
		const nextFilter: IFilterDef = {
			type: "equals",
			value1: "2026-08-05T12:00:00.000Z",
			value2: "",
		};
		const onChange = renderStoredFilter("date", {
			type: "equals",
			value1: "2026-08-01T12:00:00.000Z",
			value2: "",
			nextFilterType: "or",
			nextFilter,
		});
		const day = within(screen.getAllByRole("group")[0]).getAllByRole(
			"spinbutton",
		)[1];
		act(() => {
			day.focus();
		});
		// delete the day, then type 1 and 2: the field passes through an empty
		// day and Aug 1 on its way to Aug 12
		act(() => {
			fireEvent.keyDown(day, { key: "Delete" });
		});
		typeDigit(day, "1");
		typeDigit(day, "2");
		const whileTyping = onChange.mock.calls.map((call) => call[0].value1);
		leaveField();
		expect(whileTyping).toEqual([]);
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0]).toMatchObject({
			type: "equals",
			value1: "2026-08-12T12:00:00.000Z",
			nextFilterType: "or",
			nextFilter,
		});
	});

	it("[ISSUE-3474-ITEM-12] applies the retyped minutes of a date/time filter once, on Enter", () => {
		const onChange = renderStoredFilter("datetime", {
			type: "equals",
			value1: moment("2026-08-01T22:30").toISOString(),
			value2: "",
		});
		// month, day, year, hours, minutes, AM/PM
		const minutes = within(screen.getAllByRole("group")[0]).getAllByRole(
			"spinbutton",
		)[4];
		act(() => {
			minutes.focus();
		});
		// 4 makes 22:04 on the way to 22:45
		typeDigit(minutes, "4");
		typeDigit(minutes, "5");
		const whileTyping = onChange.mock.calls.map((call) => call[0].value1);
		act(() => {
			fireEvent.keyDown(minutes, { key: "Enter" });
		});
		expect(whileTyping).toEqual([]);
		expect(onChange.mock.calls.map((call) => call[0].value1)).toEqual([
			moment("2026-08-01T22:45").toISOString(),
		]);
	});
});

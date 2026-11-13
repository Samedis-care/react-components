import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
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
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange.mock.calls[0][0]).toMatchObject({
			type: "inRange",
			value1: from,
			value2: "",
			nextFilterType: "or",
			nextFilter,
		});
	});
});

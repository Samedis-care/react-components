import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
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
});

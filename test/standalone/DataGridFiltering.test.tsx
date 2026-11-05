import React, { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import ccI18n from "../../src/i18n";
import FilterEntry, {
	type IFilterDef,
} from "../../src/standalone/DataGrid/Content/FilterEntry";
import {
	DataGridPropsContext,
	type DataGridProps,
	type IDataGridColumnDef,
} from "../../src/standalone/DataGrid/DataGrid";
import type { ModelFilterType } from "../../src/backend-integration/Model";

beforeAll(async () => {
	await ccI18n.init();
	await ccI18n.changeLanguage("en");
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
});

const theme = createTheme();

// --- FilterEntry harness ---------------------------------------------------
// FilterEntry alone, with a parent that feeds onChange back into value, as
// the column header does
let last: IFilterDef | undefined;
const close = vi.fn();
const Entry = (p: {
	valueType: ModelFilterType;
	valueData?: IDataGridColumnDef["filterData"];
	initial?: IFilterDef;
	gridProps?: Partial<DataGridProps>;
}) => {
	const [value, setValue] = useState<IFilterDef | undefined>(p.initial);
	const onChange = React.useCallback((def: IFilterDef) => {
		last = def;
		setValue(def);
	}, []);
	return (
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<DataGridPropsContext.Provider
					value={(p.gridProps ?? {}) as DataGridProps}
				>
					<FilterEntry
						field="f"
						valueType={p.valueType}
						valueData={p.valueData}
						value={value}
						onChange={onChange}
						close={close}
						depth={1}
					/>
				</DataGridPropsContext.Provider>
			</LocalizationProvider>
		</ThemeProvider>
	);
};
const renderEntry = (p: Parameters<typeof Entry>[0]) => {
	last = undefined;
	close.mockClear();
	return render(<Entry {...p} />);
};

type CustomProps = {
	filter: unknown;
	setFilter: (v: unknown) => void;
	close: () => void;
};
describe("FilterEntry: custom", () => {
	it("[ISSUE-3494-ITEM-1] a stored value that is not JSON opens without throwing", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const Comp = () => <div>custom ui</div>;
		expect(() =>
			renderEntry({
				valueType: "custom",
				valueData: { filterComponent: Comp as never },
				initial: { type: "equals", value1: "plain", value2: "" },
			}),
		).not.toThrow();
		expect(screen.getByText("custom ui")).toBeInTheDocument();
	});
	it("[ISSUE-3494-ITEM-1] a stored value that is not JSON reaches the component as no filter, and setFilter replaces it", () => {
		const seen: unknown[] = [];
		let setF: (v: unknown) => void = () => {};
		const Comp = (p: CustomProps) => {
			seen.push(p.filter);
			setF = p.setFilter;
			return null;
		};
		renderEntry({
			valueType: "custom",
			valueData: { filterComponent: Comp as never },
			initial: { type: "equals", value1: "{not json", value2: "" },
		});
		expect(seen).toEqual([undefined]);
		// opening the filter leaves the stored value alone
		expect(last).toBeUndefined();
		act(() => setF({ a: 1 }));
		expect(last).toEqual({ type: "equals", value1: '{"a":1}', value2: "" });
		expect(seen.at(-1)).toEqual({ a: 1 });
	});
});

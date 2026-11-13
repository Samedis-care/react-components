import { afterEach, describe, expect, it } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import BaseSelector, {
	BaseSelectorData,
	selectorLocalLoadHandler,
} from "../../src/standalone/Selector/BaseSelector";
import SingleSelect from "../../src/standalone/Selector/SingleSelect";

// jsdom has "ontouchstart" on window, so isTouchDevice() is true: the
// selectors render as on a touch device, where TextFieldWithHelp has a Clear
// button of its own

afterEach(() => {
	cleanup();
});

const theme = createTheme();
const COUNTRIES: BaseSelectorData[] = [
	{ value: "de", label: "Germany" },
	{ value: "fr", label: "France" },
];
const loadCountries = selectorLocalLoadHandler(COUNTRIES);
const noop = () => {};

/** lets the option loads started by mounting settle */
const flush = async () => {
	for (let i = 0; i < 10; i++) await act(() => Promise.resolve());
};

// the Autocomplete's Clear button is hidden by CSS until the field has focus,
// which leaves it without an accessible name: find it by its label
const clearButtons = () =>
	screen.queryAllByLabelText("Clear", { selector: "button" });

describe("selectors on a touch device", () => {
	it("[ISSUE-3483-ITEM-7] have only the Autocomplete's Clear button", async () => {
		render(
			<ThemeProvider theme={theme}>
				<SingleSelect
					label="Country"
					selected={COUNTRIES[0]}
					onSelect={noop}
					onLoad={loadCountries}
				/>
			</ThemeProvider>,
		);
		await flush();
		expect(screen.getByRole("combobox", { name: "Country" })).toHaveValue(
			"Germany",
		);
		expect(clearButtons()).toHaveLength(1);
		expect(clearButtons()[0]).toHaveClass("MuiAutocomplete-clearIndicator");
		// also while the user searches
		fireEvent.change(screen.getByRole("combobox", { name: "Country" }), {
			target: { value: "Fr" },
		});
		await flush();
		expect(clearButtons()).toHaveLength(1);
		expect(clearButtons()[0]).toHaveClass("MuiAutocomplete-clearIndicator");
	});

	it("[ISSUE-3483-ITEM-7] have no Clear button while a multi selector has nothing selected", async () => {
		render(
			<ThemeProvider theme={theme}>
				<BaseSelector
					multiple
					label="Countries"
					selected={[]}
					onSelect={noop}
					onLoad={loadCountries}
				/>
			</ThemeProvider>,
		);
		await flush();
		expect(
			screen.getByRole("combobox", { name: "Countries" }),
		).toBeInTheDocument();
		expect(clearButtons()).toEqual([]);
	});
});

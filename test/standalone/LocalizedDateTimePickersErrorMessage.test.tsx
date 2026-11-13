import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { type Moment } from "moment";
import ccI18n from "../../src/i18n";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import DateInput from "../../src/standalone/UIKit/InputControls/DateInput";

/**
 * The message a date picker shows under the field when its own validation
 * (`minDate`, `maxDate`, `disablePast`, an impossible date, …) rejects the date
 * it shows.
 */

const theme = createTheme();

const Wrap = (props: { children: React.ReactNode; locale?: string }) => (
	<ThemeProvider theme={theme}>
		<LocalizationProvider
			dateAdapter={AdapterMoment}
			adapterLocale={props.locale}
		>
			{props.children}
		</LocalizationProvider>
	</ThemeProvider>
);

// a side-effect import of a moment locale has no type declarations (TS2882)
const MOMENT_DE = "moment/locale/de";
beforeAll(async () => {
	await import(/* @vite-ignore */ MOMENT_DE);
	// defining a locale also makes it the global one
	moment.locale("en");
});

afterEach(async () => {
	cleanup();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

const STORED = "2026-08-01T10:00";

const PICKERS = [
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
] as const;

/** The text under the field, `null` for none */
const helperText = () =>
	document.querySelector(".MuiFormHelperText-root")?.textContent ?? null;
const group = () => screen.getByRole("group");
const focus = (element: Element) => {
	act(() => {
		(element as HTMLElement).focus();
	});
};
const daySection = () => screen.getAllByRole("spinbutton")[1];
const pressOnDay = (key: "ArrowUp" | "ArrowDown") => {
	act(() => {
		fireEvent.keyDown(daySection(), { key });
	});
};
const outside = () => screen.getByRole("button", { name: "outside" });

describe.each(PICKERS)("%s", (_name, Picker) => {
	it("[ISSUE-3474-ITEM-30] says in text why it rejects a date it is given, as the field's description", () => {
		render(
			<Wrap>
				<Picker
					label="Valid from"
					value={moment("1999-06-15")}
					minDate={moment("2020-01-01")}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		const message = "Enter a date on or after 01/01/2020";
		expect(helperText()).toBe(message);
		expect(group()).toHaveAccessibleDescription(message);
		// a changed message is read out, see withAccessibleError
		expect(screen.getByText(message)).toHaveAttribute("aria-live", "polite");
		expect(group()).not.toHaveAttribute("aria-live");
	});

	it("[ISSUE-3474-ITEM-30] holds the message back while the user types, and shows it once focus leaves the field", () => {
		render(
			<Wrap>
				<Picker
					label="Due"
					defaultValue={moment(STORED)}
					maxDate={moment(STORED).endOf("day")}
				/>
				<button type="button">outside</button>
			</Wrap>,
		);
		const message = "Enter a date on or before 08/01/2026";
		focus(daySection());
		pressOnDay("ArrowUp");
		// the field is already marked invalid, only the text waits
		expect(group()).toHaveAttribute("aria-invalid", "true");
		expect(helperText()).toBeNull();

		focus(outside());
		expect(helperText()).toBe(message);

		// back in the field, the message stays while the date is still rejected
		focus(daySection());
		expect(helperText()).toBe(message);
		// and goes as soon as it is valid
		pressOnDay("ArrowDown");
		expect(helperText()).toBeNull();

		// a new rejection while typing waits for the user to leave again
		pressOnDay("ArrowUp");
		expect(group()).toHaveAttribute("aria-invalid", "true");
		expect(helperText()).toBeNull();
		focus(outside());
		expect(helperText()).toBe(message);
	});

	it("[ISSUE-3474-ITEM-30] follows the error while the user edits a rejected date, once the message shows", () => {
		render(
			<Wrap>
				<Picker
					label="Due"
					defaultValue={moment(STORED)}
					maxDate={moment(STORED).add(1, "day").endOf("day")}
					// Aug 3 is taken, and MUI checks that before maxDate
					shouldDisableDate={(day) => day.date() === 3}
				/>
				<button type="button">outside</button>
			</Wrap>,
		);
		focus(daySection());
		pressOnDay("ArrowUp");
		pressOnDay("ArrowUp");
		focus(outside());
		expect(helperText()).toBe("Enter a date that can be selected");

		focus(daySection());
		pressOnDay("ArrowUp");
		expect(helperText()).toBe("Enter a date on or before 08/02/2026");
	});

	it("[ISSUE-3474-ITEM-30] holds the message back while the user types into a controlled field", () => {
		const Controlled = () => {
			const [value, setValue] = useState<Moment | null>(() => moment(STORED));
			return (
				<Picker
					label="Due"
					value={value}
					maxDate={moment(STORED).endOf("day")}
					onChange={setValue}
				/>
			);
		};
		render(
			<Wrap>
				<Controlled />
			</Wrap>,
		);
		focus(daySection());
		pressOnDay("ArrowUp");
		expect(group()).toHaveAttribute("aria-invalid", "true");
		expect(helperText()).toBeNull();
	});

	it("[ISSUE-3474-ITEM-30] shows the message in place of the helper text while the date is rejected", () => {
		const picker = (value: Moment) => (
			<Wrap>
				<Picker
					label="Valid from"
					value={value}
					minDate={moment("2020-01-01")}
					onChange={vi.fn()}
					slotProps={{ textField: { helperText: "Pick a weekday" } }}
				/>
			</Wrap>
		);
		const { rerender } = render(picker(moment("1999-06-15")));
		expect(helperText()).toBe("Enter a date on or after 01/01/2020");
		rerender(picker(moment(STORED)));
		expect(helperText()).toBe("Pick a weekday");
	});

	it("[ISSUE-3474-ITEM-30] follows minDate when it changes after mount", () => {
		const picker = (minDate: string) => (
			<Wrap>
				<Picker
					label="Valid from"
					value={moment(STORED)}
					minDate={moment(minDate)}
					onChange={vi.fn()}
				/>
			</Wrap>
		);
		const { rerender } = render(picker("2020-01-01"));
		expect(helperText()).toBeNull();
		rerender(picker("2027-01-01"));
		expect(helperText()).toBe("Enter a date on or after 01/01/2027");
		rerender(picker("2020-01-01"));
		expect(helperText()).toBeNull();
	});

	it("[ISSUE-3474-ITEM-30] leaves the text to a caller that sets error itself", () => {
		const errorProps = (error: boolean) =>
			Picker === LocalizedKeyboardDatePicker
				? { error }
				: { slotProps: { textField: { error, helperText: "From the form" } } };
		const picker = (error: boolean) => (
			<Wrap>
				<Picker
					label="Valid from"
					value={moment("1999-06-15")}
					minDate={moment("2020-01-01")}
					onChange={vi.fn()}
					slotProps={{ textField: { helperText: "From the form" } }}
					{...errorProps(error)}
				/>
			</Wrap>
		);
		const { rerender } = render(picker(true));
		expect(helperText()).toBe("From the form");
		rerender(picker(false));
		expect(helperText()).toBe("From the form");
		expect(group()).toHaveAttribute("aria-invalid", "false");
	});

	it("[ISSUE-3474-ITEM-30] says it in the components-care language, with the date as the field writes it", async () => {
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		render(
			<Wrap locale="de">
				<Picker
					label="Gültig ab"
					value={moment("1999-06-15")}
					minDate={moment("2020-01-01")}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(helperText()).toBe("Gib ein Datum ab dem 01.01.2020 ein");
	});

	it("[ISSUE-3474-ITEM-30] follows a language switch after mount", async () => {
		render(
			<Wrap>
				<Picker
					label="Valid from"
					value={moment("1999-06-15")}
					minDate={moment("2020-01-01")}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(helperText()).toBe("Enter a date on or after 01/01/2020");
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		expect(helperText()).toBe("Gib ein Datum ab dem 01/01/2020 ein");
	});

	it("[ISSUE-3474-ITEM-30] keeps a focus handler the caller set on the input root", () => {
		const rootFocus = vi.fn();
		render(
			<Wrap>
				<Picker
					label="Due"
					value={moment(STORED)}
					onChange={vi.fn()}
					slotProps={{
						textField: {
							slotProps: {
								input: { slotProps: { root: { onFocus: rootFocus } } },
							},
						},
					}}
				/>
			</Wrap>,
		);
		focus(daySection());
		expect(rootFocus).toHaveBeenCalledTimes(1);
	});
});

describe("messages", () => {
	const lastYear = () => moment().subtract(1, "year");
	const nextYear = () => moment().add(1, "year");
	it.each([
		[
			"maxDate",
			{ value: moment("2026-08-02"), maxDate: moment("2026-08-01") },
			"Enter a date on or before 08/01/2026",
		],
		[
			"the default minDate",
			{ value: moment("1850-06-15") },
			"Enter a date on or after 01/01/1900",
		],
		[
			"the default maxDate",
			{ value: moment("2150-06-15") },
			"Enter a date on or before 12/31/2099",
		],
		[
			"disablePast",
			{ value: lastYear(), disablePast: true },
			"Enter today's date or a later one",
		],
		[
			"disableFuture",
			{ value: nextYear(), disableFuture: true },
			"Enter today's date or an earlier one",
		],
		[
			"shouldDisableDate",
			{ value: moment(STORED), shouldDisableDate: () => true },
			"Enter a date that can be selected",
		],
		[
			"shouldDisableMonth",
			{ value: moment(STORED), shouldDisableMonth: () => true },
			"Enter a date that can be selected",
		],
		[
			"shouldDisableYear",
			{ value: moment(STORED), shouldDisableYear: () => true },
			"Enter a date that can be selected",
		],
	])("[ISSUE-3474-ITEM-30] names what %s wants", (_reason, props, message) => {
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker
					label="Due"
					onChange={vi.fn()}
					{...props}
				/>
			</Wrap>,
		);
		expect(helperText()).toBe(message);
	});

	it("[ISSUE-3474-ITEM-30] asks for a valid date in place of an invalid one", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		try {
			render(
				<Wrap>
					<LocalizedKeyboardDatePicker
						label="Due"
						value={moment.invalid()}
						onChange={vi.fn()}
					/>
				</Wrap>,
			);
		} finally {
			consoleError.mockRestore();
		}
		expect(helperText()).toBe("Enter a valid date");
	});

	it("[ISSUE-3474-ITEM-30] shows the message of a DateInput in place of its helper text", () => {
		render(
			<Wrap>
				<DateInput
					label="Next maintenance"
					value={new Date("2032-03-01T12:00:00Z")}
					onChange={vi.fn()}
					maxDate={new Date("2031-11-13T12:00:00Z")}
					helperText="From the inspection sticker."
				/>
			</Wrap>,
		);
		expect(helperText()).toBe("Enter a date on or before 11/13/2031");
	});
});

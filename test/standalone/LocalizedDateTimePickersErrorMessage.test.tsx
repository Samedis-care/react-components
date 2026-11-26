import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import fs from "node:fs";
import path from "node:path";
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
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import DateInput from "../../src/standalone/UIKit/InputControls/DateInput";
import DateTimeInput from "../../src/standalone/UIKit/InputControls/DateTimeInput";

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

const hourSection = () => screen.getAllByRole("spinbutton")[3];
const pressOnHour = (key: "ArrowUp" | "ArrowDown") => {
	act(() => {
		fireEvent.keyDown(hourSection(), { key });
	});
};
/** A date and time on the day of STORED */
const at = (time: string) => moment(`2026-08-01T${time}`);

describe("LocalizedDateTimePicker", () => {
	it("[ISSUE-3474-ITEM-32] says in text why it rejects a date and time it is given, as the field's description", () => {
		render(
			<Wrap>
				<LocalizedDateTimePicker
					label="Starts"
					value={at("08:00")}
					minTime={at("09:00")}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		const message = "Enter a time at or after 09:00 AM";
		expect(helperText()).toBe(message);
		expect(group()).toHaveAccessibleDescription(message);
		// a changed message is read out, see withAccessibleError
		expect(screen.getByText(message)).toHaveAttribute("aria-live", "polite");
		expect(group()).not.toHaveAttribute("aria-live");
	});

	it("[ISSUE-3474-ITEM-32] holds the message back while the user types, and shows it once focus leaves the field", () => {
		render(
			<Wrap>
				<LocalizedDateTimePicker
					label="Starts"
					defaultValue={at("10:00")}
					maxTime={at("10:00")}
				/>
				<button type="button">outside</button>
			</Wrap>,
		);
		const message = "Enter a time at or before 10:00 AM";
		focus(hourSection());
		pressOnHour("ArrowUp");
		// the field is already marked invalid, only the text waits
		expect(group()).toHaveAttribute("aria-invalid", "true");
		expect(helperText()).toBeNull();

		focus(outside());
		expect(helperText()).toBe(message);

		// back in the field, the message stays while the time is still rejected
		focus(hourSection());
		expect(helperText()).toBe(message);
		// and goes as soon as it is valid
		pressOnHour("ArrowDown");
		expect(helperText()).toBeNull();

		// a new rejection while typing waits for the user to leave again
		pressOnHour("ArrowUp");
		expect(group()).toHaveAttribute("aria-invalid", "true");
		expect(helperText()).toBeNull();
		focus(outside());
		expect(helperText()).toBe(message);
	});

	it("[ISSUE-3474-ITEM-32] follows the error while the user edits a rejected time, once the message shows", () => {
		render(
			<Wrap>
				<LocalizedDateTimePicker
					label="Starts"
					defaultValue={at("10:00")}
					minTime={at("08:30")}
					// the 9 o'clock hour is taken, and MUI checks minTime before it
					shouldDisableTime={(time, view) =>
						view === "hours" && time.hour() === 9
					}
				/>
				<button type="button">outside</button>
			</Wrap>,
		);
		focus(hourSection());
		pressOnHour("ArrowDown");
		focus(outside());
		expect(helperText()).toBe("Enter a time that can be selected");

		focus(hourSection());
		pressOnHour("ArrowDown");
		expect(helperText()).toBe("Enter a time at or after 08:30 AM");
	});

	it("[ISSUE-3474-ITEM-32] holds the message back while the user types into a controlled field", () => {
		const Controlled = () => {
			const [value, setValue] = useState<Moment | null>(() => at("10:00"));
			return (
				<LocalizedDateTimePicker
					label="Starts"
					value={value}
					maxTime={at("10:00")}
					onChange={setValue}
				/>
			);
		};
		render(
			<Wrap>
				<Controlled />
			</Wrap>,
		);
		focus(hourSection());
		pressOnHour("ArrowUp");
		expect(group()).toHaveAttribute("aria-invalid", "true");
		expect(helperText()).toBeNull();
	});

	it("[ISSUE-3474-ITEM-32] shows the message in place of the helper text while the time is rejected", () => {
		const picker = (value: Moment) => (
			<Wrap>
				<LocalizedDateTimePicker
					label="Starts"
					value={value}
					minTime={at("09:00")}
					onChange={vi.fn()}
					slotProps={{ textField: { helperText: "During opening hours" } }}
				/>
			</Wrap>
		);
		const { rerender } = render(picker(at("08:00")));
		expect(helperText()).toBe("Enter a time at or after 09:00 AM");
		rerender(picker(at("10:00")));
		expect(helperText()).toBe("During opening hours");
	});

	it("[ISSUE-3474-ITEM-32] follows minTime when it changes after mount", () => {
		const picker = (minTime: string) => (
			<Wrap>
				<LocalizedDateTimePicker
					label="Starts"
					value={at("10:00")}
					minTime={at(minTime)}
					onChange={vi.fn()}
				/>
			</Wrap>
		);
		const { rerender } = render(picker("09:00"));
		expect(helperText()).toBeNull();
		rerender(picker("11:00"));
		expect(helperText()).toBe("Enter a time at or after 11:00 AM");
		rerender(picker("09:00"));
		expect(helperText()).toBeNull();
	});

	it("[ISSUE-3474-ITEM-32] leaves the text to a caller that sets error itself", () => {
		const picker = (error: boolean) => (
			<Wrap>
				<LocalizedDateTimePicker
					label="Starts"
					value={at("08:00")}
					minTime={at("09:00")}
					onChange={vi.fn()}
					slotProps={{ textField: { helperText: "From the form" } }}
					error={error}
				/>
			</Wrap>
		);
		const { rerender } = render(picker(true));
		expect(helperText()).toBe("From the form");
		rerender(picker(false));
		expect(helperText()).toBe("From the form");
		expect(group()).toHaveAttribute("aria-invalid", "false");
	});

	it("[ISSUE-3474-ITEM-32] says it in the components-care language, with the time as the field writes it", async () => {
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		render(
			<Wrap locale="de">
				<LocalizedDateTimePicker
					label="Beginn"
					value={at("08:00")}
					minTime={at("09:00")}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(helperText()).toBe("Gib eine Uhrzeit ab 09:00 ein");
	});

	it("[ISSUE-3474-ITEM-32] follows a language switch after mount", async () => {
		render(
			<Wrap>
				<LocalizedDateTimePicker
					label="Starts"
					value={at("08:00")}
					minTime={at("09:00")}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(helperText()).toBe("Enter a time at or after 09:00 AM");
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		expect(helperText()).toBe("Gib eine Uhrzeit ab 09:00 AM ein");
	});

	it("[ISSUE-3474-ITEM-32] keeps a focus handler the caller set on the input root", () => {
		const rootFocus = vi.fn();
		render(
			<Wrap>
				<LocalizedDateTimePicker
					label="Starts"
					value={at("10:00")}
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
		focus(hourSection());
		expect(rootFocus).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3474-ITEM-32] writes a limit with a date in the timezone the field shows", () => {
		render(
			<Wrap>
				<LocalizedDateTimePicker
					label="Starts"
					// shown in UTC, as a "show in UTC" switch does
					value={moment.utc("2026-08-01T07:00")}
					// 08:00 UTC
					minDateTime={moment.parseZone("2026-08-01T10:00:00+02:00")}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(helperText()).toBe(
			"Enter a date and time on or after 08/01/2026 08:00 AM",
		);
	});

	const tomorrowAt = (hour: number) =>
		moment().add(1, "day").startOf("day").hour(hour);
	it.each([
		[
			"minDateTime, on an earlier day",
			{ value: moment("2026-07-31T12:00"), minDateTime: at("10:00") },
			"Enter a date and time on or after 08/01/2026 10:00 AM",
		],
		[
			"minDateTime, earlier on its day",
			{ value: at("09:00"), minDateTime: at("10:00") },
			"Enter a date and time on or after 08/01/2026 10:00 AM",
		],
		[
			"maxDateTime, on a later day",
			{ value: moment("2026-08-02T12:00"), maxDateTime: at("18:00") },
			"Enter a date and time on or before 08/01/2026 06:00 PM",
		],
		[
			"maxDateTime, later on its day",
			{ value: at("19:00"), maxDateTime: at("18:00") },
			"Enter a date and time on or before 08/01/2026 06:00 PM",
		],
		[
			"minDate",
			{ value: moment("2019-12-31T12:00"), minDate: moment("2020-01-01") },
			"Enter a date on or after 01/01/2020",
		],
		[
			"maxDate",
			{ value: moment("2026-08-02T12:00"), maxDate: at("00:00") },
			"Enter a date on or before 08/01/2026",
		],
		[
			"the default minDate",
			{ value: moment("1850-06-15T12:00") },
			"Enter a date on or after 01/01/1900",
		],
		[
			"minTime",
			{ value: at("08:00"), minTime: at("09:00") },
			"Enter a time at or after 09:00 AM",
		],
		[
			"maxTime",
			{ value: at("18:00"), maxTime: at("17:00") },
			"Enter a time at or before 05:00 PM",
		],
		[
			"minTime with disablePast, which MUI compares with its date",
			{ value: tomorrowAt(8), minTime: tomorrowAt(9), disablePast: true },
			`Enter a date and time on or after ${tomorrowAt(9).format("L")} 09:00 AM`,
		],
		[
			"disablePast",
			{ value: moment().subtract(1, "hour"), disablePast: true },
			"Enter the current date and time or a later one",
		],
		[
			"disableFuture",
			{ value: moment().add(1, "hour"), disableFuture: true },
			"Enter the current date and time or an earlier one",
		],
		[
			"shouldDisableTime for the hours",
			{
				value: at("10:00"),
				shouldDisableTime: (_time: Moment, view: string) => view === "hours",
			},
			"Enter a time that can be selected",
		],
		[
			"shouldDisableTime for the minutes",
			{
				value: at("10:00"),
				shouldDisableTime: (_time: Moment, view: string) => view === "minutes",
			},
			"Enter a time that can be selected",
		],
		[
			"shouldDisableTime for the seconds",
			{
				value: at("10:00"),
				shouldDisableTime: (_time: Moment, view: string) => view === "seconds",
			},
			"Enter a time that can be selected",
		],
		[
			"minutesStep",
			{ value: at("10:07"), minutesStep: 15 },
			"Enter minutes in steps of 15",
		],
		[
			"shouldDisableDate",
			{ value: at("10:00"), shouldDisableDate: () => true },
			"Enter a date that can be selected",
		],
	])("[ISSUE-3474-ITEM-32] names what %s wants", (_reason, props, message) => {
		render(
			<Wrap>
				<LocalizedDateTimePicker label="Starts" onChange={vi.fn()} {...props} />
			</Wrap>,
		);
		expect(helperText()).toBe(message);
	});

	it("[ISSUE-3474-ITEM-32] asks for a valid date in place of an invalid one", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		try {
			render(
				<Wrap>
					<LocalizedDateTimePicker
						label="Starts"
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

	it("[ISSUE-3474-ITEM-32] shows the message of a DateTimeInput in place of its helper text", () => {
		render(
			<Wrap>
				<DateTimeInput
					label="Maintenance starts"
					value={at("07:00")}
					onChange={vi.fn()}
					minTime={at("08:00")}
					helperText="During the opening hours."
				/>
			</Wrap>,
		);
		expect(helperText()).toBe("Enter a time at or after 08:00 AM");
	});

	it("[ISSUE-3474-ITEM-32] has every time message in every locale, with its placeholder", () => {
		const placeholders: Record<string, string | null> = {
			"min-date-time": "{{DATE}}",
			"max-date-time": "{{DATE}}",
			"min-time": "{{TIME}}",
			"max-time": "{{TIME}}",
			"past-date-time": null,
			"future-date-time": null,
			"unavailable-time": null,
			"minutes-step": "{{STEP}}",
		};
		const i18nDir = path.resolve(__dirname, "../../src/assets/i18n");
		const missing = fs
			.readdirSync(i18nDir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory())
			.flatMap((entry) => {
				const texts = (
					JSON.parse(
						fs.readFileSync(
							path.join(i18nDir, entry.name, "translation.json"),
							"utf8",
						),
					) as {
						standalone: {
							"date-picker"?: { error?: Record<string, unknown> };
						};
					}
				).standalone["date-picker"]?.error;
				return Object.entries(placeholders)
					.filter(([key, placeholder]) => {
						const text = texts?.[key];
						return (
							typeof text !== "string" ||
							text === "" ||
							(placeholder != null && !text.includes(placeholder))
						);
					})
					.map(([key]) => `${entry.name}: ${key}`);
			});
		expect(missing).toEqual([]);
	});
});

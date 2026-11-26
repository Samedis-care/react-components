import { afterEach, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import {
	LocalizationProvider,
	type PickerChangeHandlerContext,
} from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { type Moment } from "moment";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import DateInput from "../../src/standalone/UIKit/InputControls/DateInput";

/**
 * The pickers report a date only once the user is done with it (focus leaves
 * the field, Enter, the calendar accepts a date), not the dates the field
 * passes through on the way.
 */

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const theme = createTheme();

const STORED = "2026-08-01T10:00";

const PICKERS = [
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
	["LocalizedDateTimePicker", LocalizedDateTimePicker],
] as const;

/** No media query matches, so the pickers take their mobile form */
const stubMobile = () => {
	vi.stubGlobal("matchMedia", (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}));
};

const sections = () => screen.getAllByRole("spinbutton");
/** The month, day and year the field shows, joined with "|" */
const shownDate = () =>
	sections()
		.slice(0, 3)
		.map((section) => section.textContent)
		.join("|");
const press = (key: string) => {
	act(() => {
		fireEvent.keyDown(document.activeElement as HTMLElement, { key });
	});
};
const focusDay = () => {
	act(() => {
		sections()[1].focus();
	});
};
const leaveField = () => {
	act(() => {
		screen.getByRole("button", { name: "outside" }).focus();
	});
};
const openButton = () => screen.getByRole("button", { name: /choose date/i });
/**
 * Types into a field section one digit at a time, as MUI's field reads it: from
 * the section's text after the browser's input event
 */
const typeDigits = (index: number, digits: string) => {
	act(() => {
		sections()[index].focus();
	});
	for (const digit of digits) {
		act(() => {
			const section = sections()[index];
			section.textContent = digit;
			fireEvent.input(section);
		});
	}
};

describe.each(PICKERS)("%s", (_name, Picker) => {
	/** A consumer that stores what it hears, as a form or a filter does */
	const Stored = (props: {
		onChange: (value: Moment | null) => void;
		maxDate?: Moment;
		onAccept?: (value: Moment | null, context: unknown) => void;
		publishIntermediateValues?: boolean;
	}) => {
		const [value, setValue] = useState<Moment | null>(() => moment(STORED));
		return (
			<ThemeProvider theme={theme}>
				<LocalizationProvider dateAdapter={AdapterMoment}>
					<Picker
						label="Due"
						value={value}
						maxDate={props.maxDate}
						onChange={(newValue) => {
							setValue(newValue);
							props.onChange(newValue);
						}}
						onAccept={props.onAccept}
						publishIntermediateValues={props.publishIntermediateValues}
					/>
					<button type="button">outside</button>
				</LocalizationProvider>
			</ThemeProvider>
		);
	};
	const renderStored = (maxDate?: Moment) => {
		const onChange = vi.fn<(value: Moment | null) => void>();
		render(<Stored onChange={onChange} maxDate={maxDate} />);
		return onChange;
	};
	const reportedDays = (onChange: ReturnType<typeof renderStored>) =>
		onChange.mock.calls.map((call) => call[0]?.format("YYYY-MM-DD") ?? "null");

	it("[ISSUE-3474-ITEM-12] reports the date the field shows once focus leaves it, not the dates on the way", () => {
		const onChange = renderStored();
		focusDay();
		press("ArrowUp");
		press("ArrowUp");
		const whileInField = reportedDays(onChange);
		leaveField();
		expect({ whileInField, inAll: reportedDays(onChange) }).toEqual({
			whileInField: [],
			inAll: ["2026-08-03"],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports the date on Enter, and not again when focus leaves", () => {
		const onChange = renderStored();
		focusDay();
		press("ArrowUp");
		const beforeEnter = reportedDays(onChange);
		press("Enter");
		const onEnter = reportedDays(onChange);
		leaveField();
		expect({ beforeEnter, onEnter, inAll: reportedDays(onChange) }).toEqual({
			beforeEnter: [],
			onEnter: ["2026-08-02"],
			inAll: ["2026-08-02"],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports nothing on Enter that ends an IME composition", () => {
		const onChange = renderStored();
		focusDay();
		press("ArrowUp");
		act(() => {
			fireEvent.keyDown(document.activeElement as HTMLElement, {
				key: "Enter",
				isComposing: true,
			});
		});
		expect(onChange).not.toHaveBeenCalled();
	});

	it("[ISSUE-3474-ITEM-12] reports nothing on Enter on the open-picker button, and the date once focus leaves", () => {
		const onChange = renderStored();
		focusDay();
		press("ArrowUp");
		act(() => {
			openButton().focus();
		});
		// the keydown alone: the button's click would open the calendar
		press("Enter");
		const onEnter = reportedDays(onChange);
		leaveField();
		expect({ onEnter, inAll: reportedDays(onChange) }).toEqual({
			onEnter: [],
			inAll: ["2026-08-02"],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports a section deleted and left empty as null once focus leaves", () => {
		const onChange = renderStored();
		focusDay();
		press("Delete");
		const whileInField = reportedDays(onChange);
		leaveField();
		expect({ whileInField, inAll: reportedDays(onChange) }).toEqual({
			whileInField: [],
			inAll: ["null"],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports nothing when the user comes back to the date it holds", () => {
		const onChange = renderStored();
		focusDay();
		press("ArrowUp");
		press("ArrowDown");
		leaveField();
		expect(onChange).not.toHaveBeenCalled();
	});

	it("[ISSUE-3474-ITEM-12] reports no date the picker rejects, also not the accepted one before it", () => {
		const onChange = renderStored(moment(STORED).add(1, "day").endOf("day"));
		focusDay();
		// Aug 2 passes maxDate, Aug 3 does not
		press("ArrowUp");
		press("ArrowUp");
		leaveField();
		expect({ shown: shownDate(), reported: reportedDays(onChange) }).toEqual({
			shown: "08|03|2026",
			reported: [],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports a day picked in the mobile dialog on OK, not before", async () => {
		stubMobile();
		const onChange = renderStored();
		act(() => {
			fireEvent.click(openButton());
		});
		const dialog = await screen.findByRole("dialog");
		act(() => {
			fireEvent.click(within(dialog).getByRole("gridcell", { name: "5" }));
		});
		const beforeOk = reportedDays(onChange);
		// the date/time picker leads through its time views with Next first
		for (let step = 0; step < 4; step++) {
			const action = within(dialog).getByRole("button", {
				name: /^(OK|Next)$/,
			});
			const isOk = action.textContent === "OK";
			act(() => {
				fireEvent.click(action);
			});
			if (isOk) break;
		}
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
		});
		expect({ beforeOk, inAll: reportedDays(onChange) }).toEqual({
			beforeOk: [],
			inAll: ["2026-08-05"],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports a day picked in the mobile dialog when Escape closes it, which keeps the pick as in MUI", async () => {
		stubMobile();
		const onChange = renderStored();
		act(() => {
			fireEvent.click(openButton());
		});
		const dialog = await screen.findByRole("dialog");
		act(() => {
			fireEvent.click(within(dialog).getByRole("gridcell", { name: "5" }));
		});
		const beforeEscape = reportedDays(onChange);
		act(() => {
			fireEvent.keyDown(document.activeElement as HTMLElement, {
				key: "Escape",
			});
		});
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
		});
		expect({ beforeEscape, inAll: reportedDays(onChange) }).toEqual({
			beforeEscape: [],
			inAll: ["2026-08-05"],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports nothing when the mobile dialog is cancelled after a pick", async () => {
		stubMobile();
		const onChange = renderStored();
		act(() => {
			fireEvent.click(openButton());
		});
		const dialog = await screen.findByRole("dialog");
		act(() => {
			fireEvent.click(within(dialog).getByRole("gridcell", { name: "5" }));
		});
		act(() => {
			fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
		});
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
		});
		leaveField();
		expect({ shown: shownDate(), reported: reportedDays(onChange) }).toEqual({
			shown: "08|01|2026",
			reported: [],
		});
	});

	it("[ISSUE-3474-ITEM-12] reports to an uncontrolled picker's onChange once focus leaves", () => {
		const onChange = vi.fn<(value: Moment | null) => void>();
		render(
			<ThemeProvider theme={theme}>
				<LocalizationProvider dateAdapter={AdapterMoment}>
					<Picker
						label="Due"
						defaultValue={moment(STORED)}
						onChange={onChange}
					/>
					<button type="button">outside</button>
				</LocalizationProvider>
			</ThemeProvider>,
		);
		focusDay();
		press("ArrowUp");
		const whileInField = reportedDays(onChange);
		leaveField();
		expect({ whileInField, inAll: reportedDays(onChange) }).toEqual({
			whileInField: [],
			inAll: ["2026-08-02"],
		});
	});
	/**
	 * Renders a stored picker and returns what reached its `onChange` and its
	 * `onAccept`, in order: "onAccept <day> <context.validationError>"
	 */
	const renderLogged = (
		options: { maxDate?: Moment; publishIntermediateValues?: boolean } = {},
	) => {
		const log: string[] = [];
		const day = (value: Moment | null) => value?.format("YYYY-MM-DD") ?? "null";
		render(
			<Stored
				{...options}
				onChange={(value) => log.push(`onChange ${day(value)}`)}
				onAccept={(value, context) =>
					log.push(
						`onAccept ${day(value)} ${String(
							(context as PickerChangeHandlerContext<unknown>).validationError,
						)}`,
					)
				}
			/>,
		);
		return log;
	};

	it("[ISSUE-3474-ITEM-5] passes a typed year to onAccept once focus leaves, right after onChange, not the years on the way", () => {
		const log = renderLogged();
		typeDigits(2, "2030");
		const whileInField = [...log];
		leaveField();
		expect({ shown: shownDate(), whileInField, inAll: log }).toEqual({
			shown: "08|01|2030",
			whileInField: [],
			inAll: ["onChange 2030-08-01", "onAccept 2030-08-01 null"],
		});
	});

	it("[ISSUE-3474-ITEM-5] passes the date to onAccept on Enter, not the dates on the way, and not again when focus leaves", () => {
		const log = renderLogged();
		focusDay();
		press("ArrowUp");
		press("ArrowUp");
		const beforeEnter = [...log];
		press("Enter");
		const onEnter = [...log];
		leaveField();
		expect({ beforeEnter, onEnter, inAll: log }).toEqual({
			beforeEnter: [],
			onEnter: ["onChange 2026-08-03", "onAccept 2026-08-03 null"],
			inAll: ["onChange 2026-08-03", "onAccept 2026-08-03 null"],
		});
	});

	it("[ISSUE-3474-ITEM-5] passes a day picked in the mobile dialog to onAccept once, on OK", async () => {
		stubMobile();
		const log = renderLogged();
		act(() => {
			fireEvent.click(openButton());
		});
		const dialog = await screen.findByRole("dialog");
		act(() => {
			fireEvent.click(within(dialog).getByRole("gridcell", { name: "5" }));
		});
		const beforeOk = [...log];
		// the date/time picker leads through its time views with Next first
		for (let step = 0; step < 4; step++) {
			const action = within(dialog).getByRole("button", {
				name: /^(OK|Next)$/,
			});
			const isOk = action.textContent === "OK";
			act(() => {
				fireEvent.click(action);
			});
			if (isOk) break;
		}
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).toBeNull();
		});
		leaveField();
		expect({ beforeOk, inAll: log }).toEqual({
			beforeOk: [],
			inAll: ["onChange 2026-08-05", "onAccept 2026-08-05 null"],
		});
	});

	it("[ISSUE-3474-ITEM-5] passes every change to onAccept at once with publishIntermediateValues, a rejected one included, as MUI does", () => {
		const log = renderLogged({
			publishIntermediateValues: true,
			maxDate: moment(STORED).add(1, "day").endOf("day"),
		});
		focusDay();
		// Aug 2 passes maxDate, Aug 3 does not
		press("ArrowUp");
		press("ArrowUp");
		expect(log).toEqual([
			"onChange 2026-08-02",
			"onAccept 2026-08-02 null",
			"onChange 2026-08-03",
			"onAccept 2026-08-03 maxDate",
		]);
	});
});

describe.each([
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
] as const)("%s, desktop calendar", (_name, Picker) => {
	const renderStored = () => {
		const onChange = vi.fn<(value: Moment | null) => void>();
		const Stored = () => {
			const [value, setValue] = useState<Moment | null>(() => moment(STORED));
			return (
				<>
					<Picker
						label="Due"
						value={value}
						onChange={(newValue) => {
							setValue(newValue);
							onChange(newValue);
						}}
					/>
					<button type="button">outside</button>
				</>
			);
		};
		render(
			<ThemeProvider theme={theme}>
				<LocalizationProvider dateAdapter={AdapterMoment}>
					<Stored />
				</LocalizationProvider>
			</ThemeProvider>,
		);
		return onChange;
	};
	const reportedDays = (onChange: ReturnType<typeof renderStored>) =>
		onChange.mock.calls.map((call) => call[0]?.format("YYYY-MM-DD") ?? "null");

	it("[ISSUE-3474-ITEM-12] reports a day picked in the calendar at once", async () => {
		const onChange = renderStored();
		act(() => {
			fireEvent.click(openButton());
		});
		const popup = await screen.findByRole("dialog");
		act(() => {
			fireEvent.click(within(popup).getByRole("gridcell", { name: "5" }));
		});
		expect(reportedDays(onChange)).toEqual(["2026-08-05"]);
	});

	it("[ISSUE-3474-ITEM-12] opens the calendar on a typed date, and reports it once focus leaves from the calendar", async () => {
		const onChange = renderStored();
		focusDay();
		press("ArrowUp");
		act(() => {
			fireEvent.click(openButton());
		});
		const popup = await screen.findByRole("dialog");
		const selected = within(popup)
			.getAllByRole("gridcell")
			.find((cell) => cell.getAttribute("aria-selected") === "true");
		act(() => {
			within(popup).getByRole("gridcell", { name: "9" }).focus();
		});
		const whileOpen = reportedDays(onChange);
		leaveField();
		expect({
			selected: selected?.textContent,
			whileOpen,
			inAll: reportedDays(onChange),
		}).toEqual({ selected: "2", whileOpen: [], inAll: ["2026-08-02"] });
	});
});

describe("DateInput", () => {
	it("[ISSUE-3474-ITEM-12] empties the field with the touch Clear button, also over a typed date it has not reported yet", () => {
		const onChange = vi.fn<(value: Date | null) => void>();
		const Stored = () => {
			const [value, setValue] = useState<Date | null>(null);
			return (
				<>
					<DateInput
						label="Due"
						value={value}
						onChange={(newValue) => {
							setValue(newValue);
							onChange(newValue);
						}}
					/>
					<button type="button">outside</button>
				</>
			);
		};
		render(
			<ThemeProvider theme={theme}>
				<LocalizationProvider dateAdapter={AdapterMoment}>
					<Stored />
				</LocalizationProvider>
			</ThemeProvider>,
		);
		const field = screen.getByRole("group");
		act(() => {
			sections()[0].focus();
		});
		// a whole date, typed into the empty field
		for (const [index, digits] of [
			[0, "08"],
			[1, "12"],
			[2, "2026"],
		] as const) {
			act(() => {
				sections()[index].focus();
			});
			for (const digit of digits) {
				act(() => {
					const section = sections()[index];
					section.textContent = digit;
					fireEvent.input(section);
				});
			}
		}
		const typed = shownDate();
		act(() => {
			fireEvent.click(within(field).getByRole("button", { name: /clear/i }));
		});
		leaveField();
		expect({
			typed,
			shown: shownDate(),
			reported: onChange.mock.calls.map((call) => call[0]),
		}).toEqual({
			typed: "08|12|2026",
			shown: "MM|DD|YYYY",
			reported: [null],
		});
	});
});

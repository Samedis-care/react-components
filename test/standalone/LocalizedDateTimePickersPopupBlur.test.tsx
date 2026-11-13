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
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";

/**
 * The pickers' `onBlur` when focus leaves from the open calendar: the popup is
 * portaled outside the field, so its focus moves are not the field's own.
 */

const theme = createTheme();

afterEach(cleanup);

const PICKERS = [
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
	["LocalizedDateTimePicker", LocalizedDateTimePicker],
] as const;

type BlurHandler = (event: React.FocusEvent<HTMLDivElement>) => void;

/** What a blur event carried, read while it is handled */
interface SeenBlur {
	currentTarget: EventTarget | null;
	target: EventTarget | null;
	relatedTarget: EventTarget | null;
}

const recordBlurs = () => {
	const seen: SeenBlur[] = [];
	const onBlur = vi.fn<BlurHandler>((event) => {
		seen.push({
			currentTarget: event.currentTarget,
			target: event.target,
			relatedTarget: event.relatedTarget,
		});
	});
	return { seen, onBlur };
};

const focus = (element: Element) => {
	act(() => {
		(element as HTMLElement).focus();
	});
};
const outside = () => screen.getByRole("button", { name: "outside" });
const openButton = () => screen.getByRole("button", { name: /choose date/i });

/** Opens the calendar as a mouse does, and waits for it to take focus */
const openCalendar = async () => {
	// a mouse press focuses the button before the click opens the calendar
	focus(openButton());
	act(() => {
		fireEvent.click(openButton());
	});
	const popup = await screen.findByRole("dialog");
	await waitFor(() => {
		expect(popup).toContainElement(document.activeElement as HTMLElement);
	});
	return popup;
};

describe.each(PICKERS)("%s, leaving the open calendar", (_name, Picker) => {
	const Field = (props: { onBlur?: BlurHandler }) => (
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<Picker
					label="Due"
					value={moment("2026-08-01T10:00")}
					onChange={vi.fn()}
					slotProps={{ textField: { onBlur: props.onBlur } }}
				/>
				<button type="button">outside</button>
			</LocalizationProvider>
		</ThemeProvider>
	);

	it("[ISSUE-3474-ITEM-31] calls onBlur once when focus goes from the open calendar to another control, with the event of the field group", async () => {
		const { seen, onBlur } = recordBlurs();
		render(<Field onBlur={onBlur} />);
		await openCalendar();
		const lostFocus = document.activeElement;

		focus(outside());

		expect(seen).toEqual([
			{
				currentTarget: screen.getByRole("group", { name: "Due" }),
				target: lostFocus,
				relatedTarget: outside(),
			},
		]);
	});

	it("[ISSUE-3474-ITEM-31] reports no blur while focus moves inside the calendar and back to the field, and one when it leaves from there", async () => {
		const { onBlur } = recordBlurs();
		render(<Field onBlur={onBlur} />);
		const popup = await openCalendar();
		const [nextMonth] = Array.from(
			popup.querySelectorAll<HTMLElement>("button[aria-label='Next month']"),
		);
		focus(nextMonth);
		act(() => {
			fireEvent.keyDown(document.activeElement as HTMLElement, {
				key: "Escape",
			});
		});
		await waitFor(() => {
			expect(openButton()).toHaveFocus();
		});
		const blursInside = onBlur.mock.calls.length;

		focus(outside());

		expect({ blursInside, blursInAll: onBlur.mock.calls.length }).toEqual({
			blursInside: 0,
			blursInAll: 1,
		});
	});

	it("[ISSUE-3474-ITEM-31] keeps waiting while focus is nowhere, and reports once it reaches another control", async () => {
		const { onBlur } = recordBlurs();
		render(<Field onBlur={onBlur} />);
		await openCalendar();
		const day = document.activeElement as HTMLElement;
		// the window loses focus and gets it back
		act(() => {
			day.blur();
		});
		focus(day);
		const blursMeanwhile = onBlur.mock.calls.length;

		focus(outside());

		expect({ blursMeanwhile, blursInAll: onBlur.mock.calls.length }).toEqual({
			blursMeanwhile: 0,
			blursInAll: 1,
		});
	});

	it("[ISSUE-3474-ITEM-31] calls the onBlur of the latest render", async () => {
		const first = vi.fn<BlurHandler>();
		const latest = vi.fn<BlurHandler>();
		const { rerender } = render(<Field onBlur={first} />);
		await openCalendar();
		rerender(<Field onBlur={latest} />);

		focus(outside());

		expect({
			first: first.mock.calls.length,
			latest: latest.mock.calls.length,
		}).toEqual({ first: 0, latest: 1 });
	});

	it("[ISSUE-3474-ITEM-31] reports nothing once the picker has unmounted", async () => {
		const { onBlur } = recordBlurs();
		const elsewhere = document.createElement("button");
		document.body.appendChild(elsewhere);
		try {
			const { unmount } = render(<Field onBlur={onBlur} />);
			await openCalendar();
			unmount();

			focus(elsewhere);

			expect(onBlur).not.toHaveBeenCalled();
		} finally {
			elsewhere.remove();
		}
	});
});

describe.each([
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
] as const)("%s, after leaving through the calendar", (_name, Picker) => {
	const Field = (props: { minDate?: moment.Moment }) => (
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<Picker
					label="Due"
					value={moment("2026-08-01T10:00")}
					onChange={vi.fn()}
					minDate={props.minDate}
				/>
				<button type="button">outside</button>
			</LocalizationProvider>
		</ThemeProvider>
	);

	it("[ISSUE-3474-ITEM-31] shows a rejection that comes up while the user is elsewhere at once", async () => {
		const { rerender } = render(<Field />);
		await openCalendar();
		focus(outside());

		rerender(<Field minDate={moment("2027-01-01")} />);

		expect(document.querySelector(".MuiFormHelperText-root")?.textContent).toBe(
			"Enter a date on or after 01/01/2027",
		);
	});
});

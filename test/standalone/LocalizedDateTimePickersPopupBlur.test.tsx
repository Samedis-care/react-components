import { afterEach, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
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

describe.each(PICKERS)(
	"%s, leaving a calendar opened from outside the field",
	(_name, Picker) => {
		/** A picker whose calendar a button outside the field opens */
		const Field = (props: {
			onBlur?: BlurHandler;
			label?: string;
			initiallyOpen?: boolean;
		}) => {
			const [open, setOpen] = useState(props.initiallyOpen ?? false);
			return (
				<>
					<button type="button" onClick={() => setOpen(true)}>
						pick {props.label ?? "Due"}
					</button>
					<Picker
						label={props.label ?? "Due"}
						value={moment("2026-08-01T10:00")}
						onChange={vi.fn()}
						open={open}
						onOpen={() => setOpen(true)}
						onClose={() => setOpen(false)}
						slotProps={{ textField: { onBlur: props.onBlur } }}
					/>
				</>
			);
		};
		const Page = (props: { children: React.ReactNode }) => (
			<ThemeProvider theme={theme}>
				<LocalizationProvider dateAdapter={AdapterMoment}>
					{props.children}
					<button type="button">outside</button>
				</LocalizationProvider>
			</ThemeProvider>
		);
		const pickButton = (label = "Due") =>
			screen.getByRole("button", { name: `pick ${label}` });

		/** Opens the calendar from the button outside the field, as a mouse does */
		const openFromOutside = async (label = "Due") => {
			focus(pickButton(label));
			act(() => {
				fireEvent.click(pickButton(label));
			});
			const popup = await screen.findByRole("dialog");
			await waitFor(() => {
				expect(popup).toContainElement(document.activeElement as HTMLElement);
			});
			return popup;
		};

		it("[ISSUE-3474-ITEM-33] calls onBlur once when focus goes from the calendar to another control, with the event of the field group", async () => {
			const { seen, onBlur } = recordBlurs();
			render(
				<Page>
					<Field onBlur={onBlur} />
				</Page>,
			);
			await openFromOutside();
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

		it("[ISSUE-3474-ITEM-33] calls onBlur once when the closing calendar hands focus back to the control that opened it", async () => {
			const { seen, onBlur } = recordBlurs();
			render(
				<Page>
					<Field onBlur={onBlur} />
				</Page>,
			);
			await openFromOutside();
			const lostFocus = document.activeElement;

			act(() => {
				fireEvent.keyDown(document.activeElement as HTMLElement, {
					key: "Escape",
				});
			});
			await waitFor(() => {
				expect(pickButton()).toHaveFocus();
			});

			expect(seen).toEqual([
				{
					currentTarget: screen.getByRole("group", { name: "Due" }),
					target: lostFocus,
					relatedTarget: pickButton(),
				},
			]);
		});

		it("[ISSUE-3474-ITEM-33] calls onBlur once when focus leaves a calendar that is open from the start", async () => {
			const { onBlur } = recordBlurs();
			render(
				<Page>
					<Field onBlur={onBlur} initiallyOpen />
				</Page>,
			);
			const popup = await screen.findByRole("dialog");
			await waitFor(() => {
				expect(popup).toContainElement(document.activeElement as HTMLElement);
			});

			focus(outside());

			expect(onBlur).toHaveBeenCalledTimes(1);
		});

		it("[ISSUE-3474-ITEM-33] reports no blur while focus moves from the calendar into the field, and one when it leaves the field", async () => {
			const { onBlur } = recordBlurs();
			render(
				<Page>
					<Field onBlur={onBlur} />
				</Page>,
			);
			await openFromOutside();
			focus(openButton());
			const blursInField = onBlur.mock.calls.length;

			focus(outside());

			expect({ blursInField, blursInAll: onBlur.mock.calls.length }).toEqual({
				blursInField: 0,
				blursInAll: 1,
			});
		});

		it("[ISSUE-3474-ITEM-33] reports nothing to a closed picker when focus leaves another picker's calendar", async () => {
			const first = vi.fn<BlurHandler>();
			const second = vi.fn<BlurHandler>();
			render(
				<Page>
					<Field label="Start" onBlur={first} />
					<Field label="End" onBlur={second} />
				</Page>,
			);
			await openFromOutside("End");

			focus(outside());

			expect({
				first: first.mock.calls.length,
				second: second.mock.calls.length,
			}).toEqual({ first: 0, second: 1 });
		});
	},
);

describe.each(PICKERS)(
	"%s, a ref on the field's input root",
	(_name, Picker) => {
		const Field = (props: { rootRef: React.Ref<HTMLDivElement> }) => (
			<ThemeProvider theme={theme}>
				<LocalizationProvider dateAdapter={AdapterMoment}>
					<Picker
						label="Due"
						value={moment("2026-08-01T10:00")}
						onChange={vi.fn()}
						slotProps={{
							textField: {
								onBlur: vi.fn(),
								slotProps: {
									input: { slotProps: { root: { ref: props.rootRef } } },
								},
							},
						}}
					/>
				</LocalizationProvider>
			</ThemeProvider>
		);

		it("[ISSUE-3474-ITEM-33] keeps an object ref the caller set on the input root", () => {
			const rootRef = React.createRef<HTMLDivElement>();
			render(<Field rootRef={rootRef} />);

			expect(rootRef.current).toBe(screen.getByRole("group", { name: "Due" }));
		});

		it("[ISSUE-3474-ITEM-33] keeps a callback ref the caller set on the input root: attached once across renders, detached on unmount", () => {
			const rootRef = vi.fn<(element: HTMLDivElement | null) => void>();
			const { rerender, unmount } = render(<Field rootRef={rootRef} />);
			const group = screen.getByRole("group", { name: "Due" });
			rerender(<Field rootRef={rootRef} />);
			unmount();

			expect(rootRef.mock.calls).toEqual([[group], [null]]);
		});

		it("[ISSUE-3474-ITEM-33] runs the cleanup a callback ref the caller set on the input root returns", () => {
			const cleanup = vi.fn();
			const rootRef = vi.fn((element: HTMLDivElement | null) => {
				void element;
				return cleanup;
			});
			const { unmount } = render(<Field rootRef={rootRef} />);
			const group = screen.getByRole("group", { name: "Due" });
			unmount();

			expect({
				refCalls: rootRef.mock.calls,
				cleanups: cleanup.mock.calls.length,
			}).toEqual({ refCalls: [[group]], cleanups: 1 });
		});
	},
);

import { afterEach, describe, expect, it, type Mock, vi } from "vitest";
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
import moment, { type Moment } from "moment";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";

/**
 * The pickers' open calendar (the desktop popup, or the mobile dialog) when
 * the picker gets disabled or read-only while it is open.
 */

const theme = createTheme();

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const PICKERS = [
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
	["LocalizedDateTimePicker", LocalizedDateTimePicker],
] as const;

const STORED = "2026-08-01T10:00";

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

const openButton = () => screen.getByRole("button", { name: /choose date/i });

/** Opens the calendar as a mouse does */
const openCalendar = async () => {
	act(() => {
		fireEvent.click(openButton());
	});
	return screen.findByRole("dialog");
};

/** Picks a day of the open calendar's month */
const pickDay = (day: string) => {
	act(() => {
		fireEvent.click(screen.getByRole("gridcell", { name: day }));
	});
};

/** Waits for the calendar to have gone, its closing transition included */
const calendarGone = () =>
	waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

type ChangeHandler = (value: Moment | null) => void;

/** The days reported to an onChange, in order */
const reportedDays = (onChange: Mock<ChangeHandler>) =>
	onChange.mock.calls.map(([value]) => value?.format("YYYY-MM-DD") ?? null);

/** The props of the three pickers the tests below set */
interface FieldProps {
	open?: boolean;
	onOpen?: () => void;
	onClose?: () => void;
	onChange?: ChangeHandler;
	disabled?: boolean;
	readOnly?: boolean;
}

describe.each(PICKERS)("%s, open calendar", (_name, Picker) => {
	const Field = (props: FieldProps) => (
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<Picker label="Due" value={moment(STORED)} {...props} />
			</LocalizationProvider>
		</ThemeProvider>
	);

	it("[ISSUE-3485-ITEM-7] closes when the picker becomes disabled, calls onClose once, and stays closed once enabled again", async () => {
		const onOpen = vi.fn();
		const onClose = vi.fn();
		const { rerender } = render(
			<React.StrictMode>
				<Field onOpen={onOpen} onClose={onClose} />
			</React.StrictMode>,
		);
		await openCalendar();
		expect(onOpen).toHaveBeenCalledTimes(1);
		rerender(
			<React.StrictMode>
				<Field onOpen={onOpen} onClose={onClose} disabled />
			</React.StrictMode>,
		);
		await calendarGone();
		expect(onClose).toHaveBeenCalledTimes(1);

		rerender(
			<React.StrictMode>
				<Field onOpen={onOpen} onClose={onClose} />
			</React.StrictMode>,
		);
		expect(screen.queryByRole("dialog")).toBeNull();
		await openCalendar();
		expect({
			opened: onOpen.mock.calls.length,
			closed: onClose.mock.calls.length,
		}).toEqual({ opened: 2, closed: 1 });
	});

	it("[ISSUE-3485-ITEM-7] closes when the picker becomes read-only", async () => {
		const onClose = vi.fn();
		const { rerender } = render(<Field onClose={onClose} />);
		await openCalendar();
		rerender(<Field onClose={onClose} readOnly />);
		await calendarGone();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3485-ITEM-7] closes the mobile dialog when the picker becomes disabled", async () => {
		stubMobile();
		const onChange = vi.fn<ChangeHandler>();
		const { rerender } = render(<Field onChange={onChange} />);
		const dialog = await openCalendar();
		expect(dialog.closest(".MuiDialog-root")).not.toBeNull();
		rerender(<Field onChange={onChange} disabled />);
		await calendarGone();
		expect(onChange).not.toHaveBeenCalled();
	});

	it("[ISSUE-3485-ITEM-7] reports a day picked in the mobile dialog before OK when the picker becomes disabled, as a click outside does", async () => {
		stubMobile();
		const onChange = vi.fn<ChangeHandler>();
		const { rerender } = render(<Field onChange={onChange} />);
		await openCalendar();
		pickDay("15");
		expect(onChange).not.toHaveBeenCalled();
		rerender(<Field onChange={onChange} disabled />);
		await calendarGone();
		expect(reportedDays(onChange)).toEqual(["2026-08-15"]);
	});

	it("[ISSUE-3485-ITEM-7] keeps a caller's open calendar closed while disabled, and calls onClose", async () => {
		const onClose = vi.fn();
		const { rerender } = render(<Field open onClose={onClose} />);
		await screen.findByRole("dialog");
		rerender(<Field open onClose={onClose} disabled />);
		await calendarGone();
		expect(onClose).toHaveBeenCalledTimes(1);
		// the caller's open decides again once the picker is enabled
		rerender(<Field open onClose={onClose} />);
		await screen.findByRole("dialog");
		rerender(<Field open={false} onClose={onClose} />);
		await calendarGone();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3485-ITEM-7] does not call onClose for a closed calendar when the picker becomes disabled", () => {
		const onClose = vi.fn();
		const { rerender } = render(<Field onClose={onClose} />);
		rerender(<Field onClose={onClose} disabled />);
		expect(onClose).not.toHaveBeenCalled();
		expect(screen.queryByRole("dialog")).toBeNull();
	});
});

describe("LocalizedDateTimePicker, open desktop popup", () => {
	const Field = (props: FieldProps & { onBlur?: () => void }) => (
		<ThemeProvider theme={theme}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<LocalizedDateTimePicker
					label="Due"
					value={moment(STORED)}
					{...props}
				/>
				<button type="button">outside</button>
			</LocalizationProvider>
		</ThemeProvider>
	);

	it("[ISSUE-3485-ITEM-7] reports a day picked before OK once, when the picker becomes disabled, as a click outside does", async () => {
		const onChange = vi.fn<ChangeHandler>();
		const onBlur = vi.fn();
		const { rerender } = render(<Field onChange={onChange} onBlur={onBlur} />);
		const popup = await openCalendar();
		// the desktop popup, which keeps OK for the time
		expect(popup.closest(".MuiDialog-root")).toBeNull();
		pickDay("15");
		expect(onChange).not.toHaveBeenCalled();
		rerender(<Field onChange={onChange} onBlur={onBlur} disabled />);
		await calendarGone();
		expect(reportedDays(onChange)).toEqual(["2026-08-15"]);
		// focus that moves on later reports no second change
		act(() => {
			screen.getByRole("button", { name: "outside" }).focus();
		});
		expect(reportedDays(onChange)).toEqual(["2026-08-15"]);
	});
});

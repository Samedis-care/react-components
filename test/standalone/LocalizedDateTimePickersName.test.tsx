import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import ccI18n from "../../src/i18n";
import { waitForCcI18n } from "../waitForCcI18n";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";

/**
 * The names of a picker's field and of its open calendar: after the visible
 * label, after `aria-label` for a picker without one, and never none for the
 * calendar.
 */

const theme = createTheme();

const Wrap = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider theme={theme}>
		<LocalizationProvider dateAdapter={AdapterMoment}>
			{children}
		</LocalizationProvider>
	</ThemeProvider>
);

beforeAll(async () => {
	await waitForCcI18n();
});

afterEach(async () => {
	cleanup();
	vi.unstubAllGlobals();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

/** The pickers, each with the title MUI gives its mobile dialog */
const PICKERS = [
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker, "Select date"],
	["LocalizedDatePicker", LocalizedDatePicker, "Select date"],
	["LocalizedDateTimePicker", LocalizedDateTimePicker, "Select date & time"],
] as const;

const VALUE = moment("2026-08-01T10:00");

const openButton = () => screen.getByRole("button", { name: /choose date/i });

/** Opens the calendar and returns its dialog */
const openCalendar = async () => {
	act(() => {
		fireEvent.click(openButton());
	});
	return screen.findByRole("dialog");
};

/** Makes the pickers take their mobile form: no media query matches */
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

describe.each(PICKERS)("%s name", (_name, Picker, title) => {
	it("[ISSUE-3474-ITEM-21] names the field and the open calendar after aria-label", async () => {
		render(
			<Wrap>
				<Picker aria-label="Due" value={VALUE} onChange={vi.fn()} />
			</Wrap>,
		);
		expect(screen.getByRole("group")).toHaveAccessibleName("Due");
		expect(await openCalendar()).toHaveAccessibleName("Due");
	});

	it("[ISSUE-3474-ITEM-21] names the field and the open calendar after a visible label, also when aria-label is set", async () => {
		render(
			<Wrap>
				<Picker
					label="Due date"
					aria-label="Due"
					value={VALUE}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(screen.getByRole("group")).toHaveAccessibleName("Due date");
		expect(await openCalendar()).toHaveAccessibleName("Due date");
	});

	it("[ISSUE-3474-ITEM-21] names the calendar of a picker without label and aria-label after the mobile dialog's title", async () => {
		render(
			<Wrap>
				<Picker value={VALUE} onChange={vi.fn()} />
			</Wrap>,
		);
		expect(screen.getByRole("group")).toHaveAccessibleName("");
		expect(await openCalendar()).toHaveAccessibleName(title);
	});

	it("[ISSUE-3474-ITEM-21] names the calendar after the picker's toolbarTitle", async () => {
		render(
			<Wrap>
				<Picker
					localeText={{ toolbarTitle: "Pick the due date" }}
					value={VALUE}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(await openCalendar()).toHaveAccessibleName("Pick the due date");
	});

	it("[ISSUE-3474-ITEM-21] names the mobile dialog after aria-label where it shows no title", async () => {
		stubMobile();
		render(
			<Wrap>
				<Picker
					aria-label="Due"
					value={VALUE}
					onChange={vi.fn()}
					slotProps={{ toolbar: { hidden: true } }}
				/>
			</Wrap>,
		);
		const dialog = await openCalendar();
		expect(dialog.closest(".MuiDialog-root")).not.toBeNull();
		expect(dialog).toHaveAccessibleName("Due");
	});

	it("[ISSUE-3474-ITEM-21] names the mobile dialog after aria-label, also where it shows its title", async () => {
		stubMobile();
		render(
			<Wrap>
				<Picker aria-label="Due" value={VALUE} onChange={vi.fn()} />
			</Wrap>,
		);
		const dialog = await openCalendar();
		expect(dialog.closest(".MuiDialog-root")).not.toBeNull();
		expect(within(dialog).getByText(title)).toBeInTheDocument();
		expect(dialog).toHaveAccessibleName("Due");
	});

	it("[ISSUE-3474-ITEM-21] names the desktop popup after aria-label, also where it shows its title", async () => {
		render(
			<Wrap>
				<Picker
					aria-label="Due"
					value={VALUE}
					onChange={vi.fn()}
					slotProps={{ toolbar: { hidden: false } }}
				/>
			</Wrap>,
		);
		const dialog = await openCalendar();
		expect(dialog.closest(".MuiDialog-root")).toBeNull();
		expect(within(dialog).getByText(title)).toBeInTheDocument();
		expect(dialog).toHaveAccessibleName("Due");
	});

	it("[ISSUE-3474-ITEM-21] names the mobile dialog of a labelled picker after its title, as MUI does, also when aria-label is set", async () => {
		stubMobile();
		render(
			<Wrap>
				<Picker
					label="Due date"
					aria-label="Due"
					value={VALUE}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(screen.getByRole("group")).toHaveAccessibleName("Due date");
		const dialog = await openCalendar();
		expect(dialog.closest(".MuiDialog-root")).not.toBeNull();
		expect(dialog).toHaveAccessibleName(title);
	});

	it("[ISSUE-3474-ITEM-21] keeps the names the caller set in the slot props", async () => {
		render(
			<Wrap>
				<Picker
					aria-label="Due"
					value={VALUE}
					onChange={vi.fn()}
					slotProps={{
						textField: { slotProps: { input: { "aria-label": "Due on" } } },
						popper: { "aria-label": "Calendar" },
					}}
				/>
			</Wrap>,
		);
		expect(screen.getByRole("group")).toHaveAccessibleName("Due on");
		expect(await openCalendar()).toHaveAccessibleName("Calendar");
	});
});

describe("picker name language", () => {
	it("[ISSUE-3474-ITEM-21] names the calendar of a picker without label and aria-label in the library language", async () => {
		await act(async () => {
			await ccI18n.changeLanguage("de");
		});
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker value={VALUE} onChange={vi.fn()} />
			</Wrap>,
		);
		act(() => {
			fireEvent.click(screen.getByRole("button", { name: /^Datum auswählen/ }));
		});
		expect(await screen.findByRole("dialog")).toHaveAccessibleName(
			"Datum auswählen",
		);
	});
});

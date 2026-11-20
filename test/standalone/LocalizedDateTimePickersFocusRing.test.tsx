import { afterEach, describe, expect, it } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { createTheme, IconButtonProps, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";
import calendarFocusRingSlotProps from "../../src/standalone/LocalizedDateTimePickers/calendarFocusRingSlotProps";

/**
 * The keyboard focus ring of the pickers: how it goes into the calendar's
 * layout and the open button without taking the caller's slots and slot
 * props away. What it looks like is checked in the stories
 * (`Issue3474Item18…` in LocalizedDateTimePickers.stories.tsx).
 */

const theme = createTheme();

const Wrap = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider theme={theme}>
		<LocalizationProvider dateAdapter={AdapterMoment}>
			{children}
		</LocalizationProvider>
	</ThemeProvider>
);

afterEach(() => {
	cleanup();
});

const PICKERS = [
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
	["LocalizedDateTimePicker", LocalizedDateTimePicker],
] as const;

/** A caller's own open button */
const CallerButton = (props: IconButtonProps) => (
	<button
		type={"button"}
		data-testid={"caller-button"}
		aria-label={props["aria-label"]}
		onClick={props.onClick}
	>
		{props.children}
	</button>
);

describe("calendarFocusRingSlotProps", () => {
	it("[ISSUE-3474-ITEM-18] puts the ring into the layout's sx when the caller gave none", () => {
		const { layout } = calendarFocusRingSlotProps(undefined);
		expect(layout?.sx).toEqual([expect.any(Function)]);
	});

	it("[ISSUE-3474-ITEM-18] keeps the caller's layout slot props, with its sx after the ring", () => {
		const callerSx = { padding: 1 };
		const { layout } = calendarFocusRingSlotProps({
			layout: { sx: callerSx, className: "caller-layout" } as {
				sx: typeof callerSx;
			},
		});
		expect(layout).toEqual({
			className: "caller-layout",
			sx: [expect.any(Function), callerSx],
		});
	});

	it("[ISSUE-3474-ITEM-18] keeps every entry of a caller's sx array, after the ring", () => {
		const first = { padding: 1 };
		const second = { margin: 1 };
		const { layout } = calendarFocusRingSlotProps({
			layout: { sx: [first, false, second] },
		});
		expect(layout?.sx).toEqual([expect.any(Function), first, false, second]);
	});

	it("[ISSUE-3474-ITEM-18] adds nothing when the theme sets MUI's focusVisible ring", () => {
		const { layout } = calendarFocusRingSlotProps(undefined);
		const ring = (layout?.sx as ((theme: object) => object)[])[0];
		expect(ring(createTheme({ focusVisible: true }))).toEqual({});
		expect(Object.keys(ring(createTheme()))).not.toHaveLength(0);
	});
});

describe.each(PICKERS)("%s focus ring", (_name, Picker) => {
	it("[ISSUE-3474-ITEM-18] keeps a caller's own open button", () => {
		render(
			<Wrap>
				<Picker
					label={"Date"}
					value={moment("2026-08-01T10:00")}
					onChange={() => {}}
					slots={{ openPickerButton: CallerButton }}
				/>
			</Wrap>,
		);
		expect(screen.getByTestId("caller-button")).toHaveAccessibleName(
			/choose date/i,
		);
	});
});

describe("LocalizedKeyboardDatePicker open button", () => {
	it("[ISSUE-3474-ITEM-18] still hides the icon of a disabled picker with hideDisabledIcon", () => {
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker
					label={"Date"}
					value={moment("2026-08-01")}
					onChange={() => {}}
					disabled
					hideDisabledIcon
				/>
			</Wrap>,
		);
		const button = screen.getByRole("button", { name: /choose date/i });
		expect(button).toBeDisabled();
		expect(button.querySelector("svg")).toBeNull();
	});

	it("[ISSUE-3474-ITEM-18] hides the icon of a caller's open button too", () => {
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker
					label={"Date"}
					value={moment("2026-08-01")}
					onChange={() => {}}
					disabled
					hideDisabledIcon
					slots={{ openPickerButton: CallerButton }}
				/>
			</Wrap>,
		);
		const button = screen.getByTestId("caller-button");
		expect(button.querySelector("svg")).toBeNull();
	});

	it("[ISSUE-3474-ITEM-18] shows the icon of an enabled picker with hideDisabledIcon", () => {
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker
					label={"Date"}
					value={moment("2026-08-01")}
					onChange={() => {}}
					hideDisabledIcon
				/>
			</Wrap>,
		);
		const button = screen.getByRole("button", { name: /choose date/i });
		expect(button.querySelector("svg")).not.toBeNull();
	});
});

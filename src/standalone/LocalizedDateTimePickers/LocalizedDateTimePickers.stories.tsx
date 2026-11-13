import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, screen, waitFor } from "storybook/test";
import i18next from "i18next";
import LocalizedKeyboardDatePicker from "./LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "./LocalizedDatePicker";
import LocalizedDateTimePicker from "./LocalizedDateTimePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers";
import moment, { type Moment } from "moment";
import { ThemeProvider, createTheme } from "@mui/material";
import { FormHelperTextCC } from "../UIKit/MuiFieldState";

// Minimal i18next initialisation so that useCCTranslations does not throw.
// Only initialise once; Storybook hot-reloads the module so guard with isInitialized.
if (!i18next.isInitialized) {
	void i18next.init({ lng: "en", resources: {} });
}

// ---------------------------------------------------------------------------
// Wrapper that provides the date adapter used by MUI x-date-pickers
// ---------------------------------------------------------------------------
const WithAdapter = ({ children }: { children: React.ReactNode }) => (
	<LocalizationProvider dateAdapter={AdapterMoment}>
		{children}
	</LocalizationProvider>
);

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
const meta: Meta = {
	title: "standalone/LocalizedDateTimePickers",
	parameters: { layout: "centered" },
	decorators: [
		(Story) => (
			<WithAdapter>
				<Story />
			</WithAdapter>
		),
	],
};
export default meta;

type PlayContext = Parameters<NonNullable<StoryObj["play"]>>[0];

const openButton = (canvas: PlayContext["canvas"]) =>
	canvas.getByRole("button", { name: /choose date/i });

// ---------------------------------------------------------------------------
// LocalizedKeyboardDatePicker
// ---------------------------------------------------------------------------

export const KeyboardDatePickerEmpty: StoryObj = {
	name: "LocalizedKeyboardDatePicker — empty",
	render: () => {
		const [value, setValue] = useState<Moment | null>(null);
		return (
			<LocalizedKeyboardDatePicker
				label="Date"
				value={value}
				onChange={(v) => {
					setValue(v);
				}}
			/>
		);
	},
};

export const KeyboardDatePickerWithValue: StoryObj = {
	name: "LocalizedKeyboardDatePicker — with value",
	render: () => {
		const [value, setValue] = useState<Moment | null>(() => {
			return moment("2024-06-15");
		});
		return (
			<LocalizedKeyboardDatePicker
				label="Departure date"
				value={value}
				onChange={(v) => {
					setValue(v);
				}}
				fullWidth
			/>
		);
	},
};

export const KeyboardDatePickerDisabled: StoryObj = {
	name: "LocalizedKeyboardDatePicker — disabled",
	render: () => {
		const [value] = useState<Moment | null>(() => {
			return moment("2024-01-01");
		});
		return (
			<LocalizedKeyboardDatePicker
				label="Locked date"
				value={value}
				onChange={() => {}}
				disabled
				hideDisabledIcon
			/>
		);
	},
};

export const KeyboardDatePickerRequired: StoryObj = {
	name: "LocalizedKeyboardDatePicker — required with error",
	render: () => {
		const [value, setValue] = useState<Moment | null>(null);
		return (
			<LocalizedKeyboardDatePicker
				label="Required date"
				value={value}
				onChange={(v) => {
					setValue(v);
				}}
				required
				error={value === null}
				fullWidth
			/>
		);
	},
};

// ---------------------------------------------------------------------------
// LocalizedDatePicker
// ---------------------------------------------------------------------------

export const DatePickerEmpty: StoryObj = {
	name: "LocalizedDatePicker — empty",
	render: () => {
		const [value, setValue] = useState<Moment | null>(null);
		return (
			<LocalizedDatePicker
				label="Date"
				value={value}
				onChange={(v) => {
					setValue(v);
				}}
			/>
		);
	},
};

export const DatePickerWithValue: StoryObj = {
	name: "LocalizedDatePicker — with value",
	render: () => {
		const [value, setValue] = useState<Moment | null>(() => {
			return moment("2025-12-25");
		});
		return (
			<LocalizedDatePicker
				label="Holiday"
				value={value}
				onChange={(v) => {
					setValue(v);
				}}
			/>
		);
	},
};

// ---------------------------------------------------------------------------
// LocalizedDateTimePicker
// ---------------------------------------------------------------------------

export const DateTimePickerEmpty: StoryObj = {
	name: "LocalizedDateTimePicker — empty",
	render: () => {
		const [value, setValue] = useState<Moment | null>(null);
		return (
			<LocalizedDateTimePicker
				label="Date & time"
				value={value}
				onChange={(v) => {
					setValue(v);
				}}
			/>
		);
	},
};

export const DateTimePickerWithValue: StoryObj = {
	name: "LocalizedDateTimePicker — with value",
	render: () => {
		const [value, setValue] = useState<Moment | null>(() => {
			return moment("2025-03-17T14:30:00");
		});
		return (
			<LocalizedDateTimePicker
				label="Meeting time"
				value={value}
				onChange={(v) => {
					setValue(v);
				}}
				fullWidth
			/>
		);
	},
};

export const DateTimePickerGermanLocale: StoryObj = {
	name: "LocalizedDateTimePicker — de locale",
	render: () => {
		// Switch i18next to German for this story
		void i18next.changeLanguage("de");

		const [value, setValue] = useState<Moment | null>(() => {
			return moment("2025-03-17T09:00:00");
		});
		return (
			<LocalizedDateTimePicker
				label="Termin (de)"
				value={value}
				onChange={(v) => {
					setValue(v);
				}}
			/>
		);
	},
};

// ---------------------------------------------------------------------------
// Bugs
// ---------------------------------------------------------------------------

export const Issue3474Item19WarningLabelContrast: StoryObj = {
	name: "ISSUE-3474-ITEM-19: the warning label is readable",
	parameters: {
		a11y: {
			test: "error",
			options: { runOnly: { type: "rule", values: ["color-contrast"] } },
		},
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-19: `warning` colors the label `palette.warning.main` (#ed6c02, 3.11:1 on white), below the 4.5:1 text needs. axe `color-contrast` fails on the label.",
			},
		},
	},
	render: () => (
		<LocalizedKeyboardDatePicker
			label="Due date"
			value={moment("2026-08-01")}
			onChange={() => {}}
			warning
		/>
	),
};

/** SCF's palette: a yellow warning, 1.48:1 on white */
const yellowWarningTheme = createTheme({
	palette: { warning: { main: "#FFCF00" } },
});

export const Issue3474Item19WarningTextContrastInAYellowTheme: StoryObj = {
	name: "ISSUE-3474-ITEM-19: warning label and helper text stay readable in a yellow theme",
	parameters: {
		a11y: {
			test: "error",
			options: { runOnly: { type: "rule", values: ["color-contrast"] } },
		},
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-19: the label and the helper text of a warning are drawn in `palette.warning.main` darkened to 4.5:1, also where that is a light yellow.",
			},
		},
	},
	render: () => (
		<ThemeProvider theme={yellowWarningTheme}>
			<div>
				<LocalizedKeyboardDatePicker
					label="Due date"
					value={moment("2026-08-01")}
					onChange={() => {}}
					warning
				/>
				<FormHelperTextCC warning>The due date is in the past</FormHelperTextCC>
			</div>
		</ThemeProvider>
	),
};

/**
 * Opens the picker of a story and waits until its popup or dialog has finished
 * growing or fading in, so what is measured is its final size
 */
const openedPicker = async (
	canvas: PlayContext["canvas"],
	userEvent: PlayContext["userEvent"],
) => {
	await userEvent.click(openButton(canvas));
	const dialog = await screen.findByRole("dialog");
	await screen.findAllByRole("gridcell");
	await waitFor(() =>
		expect(
			document
				.getAnimations()
				.filter((animation) => animation instanceof CSSTransition),
		).toEqual([]),
	);
	return dialog;
};

export const Issue3474Item20DateTimePopupFitsPhone: StoryObj = {
	name: "ISSUE-3474-ITEM-20: the date/time popup fits a 320px screen",
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-20: at 320px CSS width with a fine pointer (a narrow window, or 400% zoom on a 1280px screen) the DateTimePicker opens MUI's mobile dialog, which fits. The desktop popup puts the 320px calendar next to the time columns, 489px in all, and would scroll the page sideways.",
			},
		},
	},
	render: () => (
		<LocalizedDateTimePicker
			label="Date & time"
			value={moment("2026-08-01T10:30")}
			onChange={() => {}}
			fullWidth
		/>
	),
	play: async ({ canvas, userEvent }) => {
		const dialog = await openedPicker(canvas, userEvent);
		const viewport = document.documentElement;
		const outsideViewport = (element: Element) => {
			const { left, right } = element.getBoundingClientRect();
			return left < 0 || right > viewport.clientWidth;
		};
		// all of them in one assertion, so the failure shows each of them
		await expect({
			pageScrollsSideways: viewport.scrollWidth > viewport.clientWidth,
			popupScrollsSideways: dialog.scrollWidth > dialog.clientWidth,
			outsideViewport: [
				dialog,
				...dialog.querySelectorAll("button, [role='option']"),
			]
				.filter(outsideViewport)
				.map((element) =>
					element === dialog
						? "the popup"
						: (element.getAttribute("aria-label") ?? element.textContent),
				),
		}).toEqual({
			pageScrollsSideways: false,
			popupScrollsSideways: false,
			outsideViewport: [],
		});
	},
};

export const Issue3474Item20WideWindowKeepsDesktopPopup: StoryObj = {
	name: "ISSUE-3474-ITEM-20: a wide window keeps the desktop popup",
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-20: from 600px CSS width, with a fine pointer, the DateTimePicker opens MUI's desktop popup, the calendar next to the time columns.",
			},
		},
	},
	render: () => (
		<LocalizedDateTimePicker
			label="Date & time"
			value={moment("2026-08-01T10:30")}
			onChange={() => {}}
		/>
	),
	play: async ({ canvas, userEvent }) => {
		const dialog = await openedPicker(canvas, userEvent);
		await expect(dialog).toHaveClass("MuiPickerPopper-root");
		await expect(
			screen.getByRole("option", { name: "10 hours" }),
		).toBeVisible();
	},
};

export const Issue3474Item20CallerMediaQueryWins: StoryObj = {
	name: "ISSUE-3474-ITEM-20: the caller's desktopModeMediaQuery wins",
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-20: `desktopModeMediaQuery` replaces the default query, here with MUI's own `@media (pointer: fine)`: the desktop popup opens also at 320px.",
			},
		},
	},
	render: () => (
		<LocalizedDateTimePicker
			label="Date & time"
			value={moment("2026-08-01T10:30")}
			onChange={() => {}}
			desktopModeMediaQuery="@media (pointer: fine)"
			fullWidth
		/>
	),
	play: async ({ canvas, userEvent }) => {
		const dialog = await openedPicker(canvas, userEvent);
		await expect(dialog).toHaveClass("MuiPickerPopper-root");
	},
};

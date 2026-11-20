import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, screen, waitFor, within } from "storybook/test";
import i18next from "i18next";
import LocalizedKeyboardDatePicker from "./LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "./LocalizedDatePicker";
import LocalizedDateTimePicker from "./LocalizedDateTimePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers";
import moment, { type Moment } from "moment";
import { ThemeProvider, createTheme } from "@mui/material";
import { FormHelperTextCC, TextFieldCC } from "../UIKit/MuiFieldState";

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

export const Issue3474Item9WarningOutlinesThePicker: StoryObj = {
	name: "ISSUE-3474-ITEM-9: warning and dirty style the picker's outline",
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-9: with `warning` the label turns orange but the outline stays grey, and with `dirty` the dot after the label sits on the border, because the field-state styles target `MuiOutlinedInput` and the pickers render `MuiPickersOutlinedInput`. The outline keeps the warning colour while the field is focused, as a text field's does.",
			},
		},
	},
	render: () => (
		<div>
			<LocalizedKeyboardDatePicker
				label="Due date"
				value={moment("2026-08-01")}
				onChange={() => {}}
				warning
				dirty
			/>
			{/* the text field the picker has to look like */}
			<TextFieldCC
				label="Text field"
				value="08/01/2026"
				onChange={() => {}}
				warning
			/>
		</div>
	),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const outline = canvasElement.querySelector(
			".MuiPickersOutlinedInput-notchedOutline",
		)!;
		const label = canvasElement.querySelector(".MuiFormLabel-root")!;
		// the legend is the gap in the border; the span inside it is only its copy
		// of the label, and a margin on that copy sits outside the span's own box
		const gap = outline.querySelector("legend")!;
		// both halves in one assertion, so the failure shows each of them
		await expect({
			outline: getComputedStyle(outline).borderColor,
			// the gap in the border has to be as wide as the label with its dot
			labelOverhangsGap:
				label.getBoundingClientRect().right > gap.getBoundingClientRect().right,
		}).toEqual({ outline: "rgb(237, 108, 2)", labelOverhangsGap: false });

		// a focused warning field keeps the warning colour, on the text field and
		// on the picker alike; the input's own focus rule would paint it primary
		const focused = (notchedOutline: Element) => ({
			color: getComputedStyle(notchedOutline).borderColor,
			width: getComputedStyle(notchedOutline).borderWidth,
		});
		const WARNING_2PX = { color: "rgb(237, 108, 2)", width: "2px" };
		await userEvent.click(canvas.getByRole("textbox", { name: "Text field" }));
		await expect(
			focused(canvasElement.querySelector(".MuiOutlinedInput-notchedOutline")!),
		).toEqual(WARNING_2PX);
		await userEvent.click(canvas.getAllByRole("spinbutton")[0]);
		await expect(focused(outline)).toEqual(WARNING_2PX);
	},
};

export const Issue3474Item9WarningStylesTheUnderlines: StoryObj = {
	name: "ISSUE-3474-ITEM-9: warning colours a standard and a filled picker's underline",
	parameters: {
		a11y: {
			test: "error",
			config: {
				// the filled picker's warning label sits on the input's grey fill:
				// #c15801 on rgba(0, 0, 0, 0.06) over white is 3.95:1, below the
				// 4.5:1 text needs. That is the filled variant's own contrast, not
				// the underline this story is about; listed as a follow-up on
				// ISSUE-3474, and the same on a filled TextFieldCC
				rules: [{ id: "color-contrast", enabled: false }],
			},
		},
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-9: the pickers draw their own standard and filled inputs (`MuiPickersInput`, `MuiPickersFilledInput`), so the warning styles left both underlines in the text colour while the label turned orange.",
			},
		},
	},
	render: () => (
		<div>
			<LocalizedKeyboardDatePicker
				label="Standard warning"
				value={moment("2026-08-01")}
				onChange={() => {}}
				slotProps={{ textField: { variant: "standard" } }}
				warning
			/>
			<LocalizedKeyboardDatePicker
				label="Filled warning"
				value={moment("2026-08-01")}
				onChange={() => {}}
				slotProps={{ textField: { variant: "filled" } }}
				warning
			/>
		</div>
	),
	play: async ({ canvasElement }) => {
		const underlines = [
			...canvasElement.querySelectorAll(
				".MuiPickersInputBase-root:not(.MuiPickersOutlinedInput-root)",
			),
		];
		await expect(underlines).toHaveLength(2);
		// the idle 1px underline and the 2px focus underline, in warning.main
		await expect(
			underlines.map((underline) => [
				getComputedStyle(underline, "::before").borderBottomColor,
				getComputedStyle(underline, "::after").borderBottomColor,
			]),
		).toEqual([
			["rgb(237, 108, 2)", "rgb(237, 108, 2)"],
			["rgb(237, 108, 2)", "rgb(237, 108, 2)"],
		]);
	},
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

/** Relative luminance of an sRGB color given as 0-255 channels */
const luminance = ([r, g, b]: number[]) => {
	const channel = (value: number) => {
		const c = value / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** A computed rgb()/rgba() color laid over white */
const overWhite = (color: string) => {
	const [r, g, b, a = 1] = (color.match(/[\d.]+/g) ?? []).map(Number);
	return [r, g, b].map((c) => c * a + 255 * (1 - a));
};

const contrastWithWhite = (color: string) =>
	1.05 / (luminance(overWhite(color)) + 0.05);

export const Issue3474Item18FocusedDayIsVisible: StoryObj = {
	name: "ISSUE-3474-ITEM-18: the keyboard focus in the calendar is visible",
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-18: after an arrow key in the calendar, the focused day differs from the other days only by a 12% tint of the primary color (about 1.2:1 against white) and has no outline. WCAG 1.4.11 asks for at least 3:1.",
			},
		},
	},
	render: () => (
		<LocalizedKeyboardDatePicker
			label="Date"
			value={moment("2026-08-01")}
			onChange={() => {}}
		/>
	),
	play: async ({ canvas, userEvent }) => {
		await openedPicker(canvas, userEvent);
		await userEvent.keyboard("{ArrowRight}");
		const focused = document.activeElement as HTMLElement;
		await expect(focused).toHaveTextContent("2");
		await expect(focused).toHaveClass("Mui-focusVisible");
		// the day fades its background in: measure where it ends up
		await Promise.all(focused.getAnimations().map((anim) => anim.finished));

		// a 2px outline, or a background at 3:1 against the unfocused (white) days
		const style = getComputedStyle(focused);
		const outlined =
			style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2;
		const contrast = contrastWithWhite(style.backgroundColor);
		await expect(
			outlined || contrast >= 3,
			`focus shown by background ${style.backgroundColor} (${contrast.toFixed(2)}:1 on white) and outline "${style.outlineStyle} ${style.outlineWidth}"`,
		).toBe(true);
	},
};

/** The contrast ratio of two computed colors, each laid over white */
const contrastBetween = (a: string, b: string) => {
	const [lighter, darker] = [luminance(overWhite(a)), luminance(overWhite(b))]
		.sort((x, y) => x - y)
		.reverse();
	return (lighter + 0.05) / (darker + 0.05);
};

/**
 * How a control shows its keyboard focus once it has it: "a ring" for a 2px
 * outline at 3:1 against what it is drawn on (the white calendar for a ring
 * outside the control, the control's own fill for one inside it), otherwise
 * what it shows instead
 */
const focusShownBy = async (control: HTMLElement) => {
	control.focus();
	await waitFor(() =>
		expect(
			control.matches(
				".Mui-focusVisible, .MuiYearCalendar-button:focus-visible, .MuiMonthCalendar-button:focus-visible",
			),
		).toBe(true),
	);
	// a day and a time option fade their background in: measure where it ends up
	await Promise.all(control.getAnimations().map((anim) => anim.finished));
	const style = getComputedStyle(control);
	const drawnOn =
		parseFloat(style.outlineOffset) < 0
			? style.backgroundColor
			: "rgb(255, 255, 255)";
	if (style.outlineStyle === "none") {
		return `no outline, background ${style.backgroundColor}`;
	}
	const contrast = contrastBetween(style.outlineColor, drawnOn);
	return style.outlineStyle === "solid" &&
		parseFloat(style.outlineWidth) >= 2 &&
		contrast >= 3
		? "a ring"
		: `outline "${style.outlineStyle} ${style.outlineWidth}" at ${contrast.toFixed(2)}:1 on ${drawnOn}`;
};

/** The day button of the open calendar that shows the given day of the month */
const dayButton = (day: string) =>
	screen.getAllByRole("gridcell").find((cell) => cell.textContent === day)!;

export const Issue3474Item18EveryControlShowsFocus: StoryObj = {
	name: "ISSUE-3474-ITEM-18: every control of the date/time popup shows keyboard focus",
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-18: the open button, the header's view switch and month arrows, the days, the time options and the action bar's buttons each show keyboard focus by a 2px ring at 3:1 against what it is drawn on: outside a button, along the edge of a day, a time option or the view switch (their containers clip), and in the text colour, 2px inside the edge, on a selected day or time option, which is filled in the ring's colour. MUI marks them only by a faint tint or a pulsing ripple (1.2:1 to 1.6:1).",
			},
		},
	},
	render: () => (
		<LocalizedDateTimePicker
			label="Date & time"
			value={moment("2026-08-12T10:30")}
			onChange={() => {}}
		/>
	),
	play: async ({ canvas, userEvent }) => {
		const shown: Record<string, string> = {
			"open button": await focusShownBy(openButton(canvas)),
		};
		await openedPicker(canvas, userEvent);
		const controls: [string, HTMLElement][] = [
			[
				"view switch",
				screen.getByRole("button", { name: /calendar view is open/ }),
			],
			[
				"previous month",
				screen.getByRole("button", { name: "Previous month" }),
			],
			["next month", screen.getByRole("button", { name: "Next month" })],
			["day", dayButton("13")],
			["selected day", dayButton("12")],
			["hour", screen.getByRole("option", { name: "11 hours" })],
			["selected hour", screen.getByRole("option", { name: "10 hours" })],
			["selected meridiem", screen.getByRole("option", { name: "AM" })],
			["cancel", screen.getByRole("button", { name: "Cancel" })],
			["ok", screen.getByRole("button", { name: "OK" })],
		];
		for (const [name, control] of controls) {
			shown[name] = await focusShownBy(control);
		}
		// all of them in one assertion, so the failure shows each of them
		await expect(shown).toEqual(
			Object.fromEntries(Object.keys(shown).map((name) => [name, "a ring"])),
		);
	},
};

export const Issue3474Item18YearsAndMonthsShowFocus: StoryObj = {
	name: "ISSUE-3474-ITEM-18: the year and month buttons show keyboard focus",
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-18: a keyboard-focused year or month shows a 2px ring outside it, also the selected one, whose fill MUI only darkens. MUI marks a focused year by a 12% grey tint and a month by 4%.",
			},
		},
	},
	render: () => (
		<LocalizedKeyboardDatePicker
			label="Date"
			value={moment("2026-08-12")}
			onChange={() => {}}
			views={["year", "month", "day"]}
			openTo="year"
		/>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(openButton(canvas));
		const year = (name: string) => screen.getByRole("radio", { name });
		await screen.findByRole("radio", { name: "2026" });
		const shown: Record<string, string> = {
			year: await focusShownBy(year("2027")),
			"selected year": await focusShownBy(year("2026")),
		};
		// picking a year goes on to the months
		await userEvent.click(year("2026"));
		const month = (name: string) => screen.findByRole("radio", { name });
		shown.month = await focusShownBy(await month("September"));
		shown["selected month"] = await focusShownBy(await month("August"));
		await expect(shown).toEqual({
			year: "a ring",
			"selected year": "a ring",
			month: "a ring",
			"selected month": "a ring",
		});
	},
};

export const Issue3474Item18MobileDialogShowsFocus: StoryObj = {
	name: "ISSUE-3474-ITEM-18: the controls of the mobile date/time dialog show keyboard focus",
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-18: in the mobile dialog (here at 320px) the toolbar's buttons, the date and time tabs (ringed inside, clear of the tab indicator) and the action bar's buttons show keyboard focus by a 2px ring, where MUI shows only a pulsing ripple.",
			},
		},
	},
	render: () => (
		<LocalizedDateTimePicker
			label="Date & time"
			value={moment("2026-08-12T10:30")}
			onChange={() => {}}
			fullWidth
		/>
	),
	play: async ({ canvas, userEvent }) => {
		const dialog = await openedPicker(canvas, userEvent);
		const button = (name: string) =>
			within(dialog).getByRole("button", { name });
		const shown: Record<string, string> = {};
		for (const [name, control] of [
			["hours", button("10")],
			["date tab", within(dialog).getByRole("tab", { name: "pick date" })],
			["time tab", within(dialog).getByRole("tab", { name: "pick time" })],
			["selected day", dayButton("12")],
			["cancel", button("Cancel")],
			["next", button("Next")],
		] as const) {
			shown[name] = await focusShownBy(control);
		}
		await expect(shown).toEqual(
			Object.fromEntries(Object.keys(shown).map((name) => [name, "a ring"])),
		);
	},
};

// an app's theme ring, as MUI's createTheme({ focusVisible }) takes it
const GREEN_RING = createTheme({
	focusVisible: { outlineColor: "rgb(0, 128, 0)" },
});

export const Issue3474Item18ThemeRingIsShown: StoryObj = {
	name: "ISSUE-3474-ITEM-18: a theme's focusVisible ring is the one shown",
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3474-ITEM-18: a theme that sets MUI's `focusVisible` ring (here `outlineColor: rgb(0, 128, 0)`) styles the focus ring of the open button and of the calendar's controls, as on every MUI button.",
			},
		},
	},
	decorators: [
		(Story) => (
			<ThemeProvider theme={GREEN_RING}>
				<Story />
			</ThemeProvider>
		),
	],
	render: () => (
		<LocalizedKeyboardDatePicker
			label="Date"
			value={moment("2026-08-12")}
			onChange={() => {}}
		/>
	),
	play: async ({ canvas, userEvent }) => {
		const ringColor = async (control: HTMLElement) => {
			control.focus();
			await waitFor(() => expect(control).toHaveClass("Mui-focusVisible"));
			return getComputedStyle(control).outlineColor;
		};
		const colors = { "open button": await ringColor(openButton(canvas)) };
		await openedPicker(canvas, userEvent);
		await expect({
			...colors,
			day: await ringColor(dayButton("13")),
			"next month": await ringColor(
				screen.getByRole("button", { name: "Next month" }),
			),
		}).toEqual({
			"open button": "rgb(0, 128, 0)",
			day: "rgb(0, 128, 0)",
			"next month": "rgb(0, 128, 0)",
		});
	},
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

export const Issue3474Item21PickerWithoutLabelIsNamed: StoryObj = {
	name: "ISSUE-3474-ITEM-21: a picker without a label is named",
	parameters: {
		a11y: {
			test: "error",
			options: { runOnly: { type: "rule", values: ["aria-dialog-name"] } },
		},
		docs: {
			description: {
				story:
					'ISSUE-3474-ITEM-21: without `label` and without `aria-label` the field has nothing to be named after, but the open calendar is still a named dialog: it takes MUI\'s title of the mobile dialog, "Select date" (axe `aria-dialog-name`, checked after the play opened it).',
			},
		},
	},
	render: () => (
		<LocalizedKeyboardDatePicker
			value={moment("2026-08-01")}
			onChange={() => {}}
			fullWidth
		/>
	),
	play: async ({ canvas, userEvent }) => {
		// axe runs after this, with the calendar open
		await openedPicker(canvas, userEvent);
	},
};

export const Issue3474Item21PickerNamedByAriaLabel: StoryObj = {
	name: "ISSUE-3474-ITEM-21: aria-label names a picker without a label",
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3474-ITEM-21: `aria-label` names a picker that shows no label, as the DataGrid\'s date filters do ("From", "To"): a screen reader announces the field group by it when focus enters a section, and the open calendar is a dialog named after it, the desktop popup as well as the mobile dialog. A visible `label` takes its place, as in MUI.',
			},
		},
	},
	render: () => (
		<LocalizedKeyboardDatePicker
			aria-label="Due date"
			value={moment("2026-08-01")}
			onChange={() => {}}
		/>
	),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole("group")).toHaveAccessibleName("Due date");
		const dialog = await openedPicker(canvas, userEvent);
		await expect(dialog).toHaveAccessibleName("Due date");
	},
};

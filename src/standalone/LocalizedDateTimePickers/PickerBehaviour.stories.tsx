import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, type Mock, screen } from "storybook/test";
import i18next from "i18next";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { type Moment } from "moment";
import LocalizedKeyboardDatePicker from "./LocalizedKeyboardDatePicker";

/**
 * The ways of driving a picker that are **not** typing a date from scratch:
 * the calendar, the arrow keys, deleting a section, moving between sections, a
 * non-English format, a consumer's own `minDate`.
 *
 * `usePickerDraft` sits in front of `value`, `onChange` and the field's `onBlur`,
 * so each of these paths runs through it. They are here to pin down that the
 * picker still behaves the way MUI intends inside our wrappers.
 */

// Kept in its own stories file so the picker labels stay English: i18next is a
// module singleton, and the stories next door switch it to German.
if (!i18next.isInitialized) {
	void i18next.init({ lng: "en", resources: {} });
}

/**
 * A day-first format, for the section order the original report was made in.
 *
 * moment's own locale files do not register on the instance this bundle holds,
 * so the format is defined here rather than loaded — what matters to the picker
 * is the order of the sections, not which country they belong to. In the
 * application it is `MuiPickerUtils` that hands the adapter its locale.
 */
const DAY_FIRST_LOCALE = "day-first";
moment.defineLocale(DAY_FIRST_LOCALE, {
	parentLocale: "en",
	longDateFormat: { L: "DD.MM.YYYY", LT: "HH:mm" },
});
// defineLocale makes the new locale current, which would change every story
moment.locale("en");

// The adapter is provided per story rather than by a decorator: a story-level
// decorator would sit *outside* a meta one, so the meta's adapter would be the
// inner one and would override any locale the story asked for.
const meta: Meta = {
	title: "standalone/LocalizedDateTimePickers/Picker behaviour",
	parameters: { layout: "centered" },
};
export default meta;

/** See `TypedEntry.stories.tsx` — the fields drop a half-typed section after 5s */
const KEYSTROKE_DELAY_MS = 300;

type PlayContext = Parameters<NonNullable<StoryObj["play"]>>[0];

/** Types into the focused field one key at a time, the way a person does */
const typeSlowly = async (
	userEvent: PlayContext["userEvent"],
	keys: string,
) => {
	for (const key of keys) {
		await userEvent.keyboard(key);
		await new Promise((resolve) => {
			setTimeout(resolve, KEYSTROKE_DELAY_MS);
		});
	}
};

/** The field sections, in the order the format renders them */
const sections = (canvas: PlayContext["canvas"]) => {
	const found = canvas.getAllByRole("spinbutton");
	return { first: found[0], second: found[1], third: found[2] };
};

/** What the whole field reads, sections and separators together */
const fieldText = (canvas: PlayContext["canvas"]) =>
	canvas
		.getAllByRole("spinbutton")
		.map((section) => section.textContent)
		.join("|");

/** The value the last reported change carried */
const lastReported = (onChange: BehaviourArgs["onChange"], format: string) =>
	onChange.mock.calls[onChange.mock.calls.length - 1][0]?.format(format);

interface BehaviourArgs {
	onChange: Mock<(value: Moment | null) => void>;
	onError?: Mock<(error: unknown) => void>;
	initialValue?: string;
}

const Controlled = (
	props: BehaviourArgs & {
		minDate?: Moment;
		readOnly?: boolean;
		/** As `MuiPickerUtils` passes it in the framework, driving the format */
		adapterLocale?: string;
	},
) => {
	const [value, setValue] = useState<Moment | null>(() =>
		props.initialValue ? moment(props.initialValue) : null,
	);
	return (
		<LocalizationProvider
			dateAdapter={AdapterMoment}
			adapterLocale={props.adapterLocale}
		>
			<LocalizedKeyboardDatePicker
				label="Date"
				value={value}
				minDate={props.minDate}
				readOnly={props.readOnly}
				onError={props.onError}
				onChange={(newValue) => {
					setValue(newValue);
					props.onChange(newValue);
				}}
			/>
		</LocalizationProvider>
	);
};

const openCalendar = async (
	canvas: PlayContext["canvas"],
	userEvent: PlayContext["userEvent"],
) => {
	await userEvent.click(canvas.getByRole("button", { name: /choose date/i }));
	// The calendar goes into a portal, so it is outside the story's own canvas —
	// and it mounts a tick later, hence the retrying finder.
	await screen.findAllByRole("gridcell");
};

const clickDay = async (userEvent: PlayContext["userEvent"], day: string) => {
	const cells = await screen.findAllByRole("gridcell");
	const cell = cells.find((candidate) => candidate.textContent === day);
	await expect(cell).toBeTruthy();
	await userEvent.click(cell);
};

export const PickFromCalendar: StoryObj<BehaviourArgs> = {
	name: "Picking from the calendar reports the day",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <Controlled {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await openCalendar(canvas, userEvent);
		await clickDay(userEvent, "20");

		await expect(args.onChange).toHaveBeenCalledTimes(1);
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2026-08-20");
		await expect(fieldText(canvas)).toBe("08|20|2026");
	},
};

export const CalendarAfterHalfTypedYear: StoryObj<BehaviourArgs> = {
	name: "Reaching for the calendar drops a half-typed year",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <Controlled {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(sections(canvas).third);
		await typeSlowly(userEvent, "20");
		await expect(fieldText(canvas)).toBe("08|01|0020");

		// focus leaves the field for the popover, so the unaccepted draft goes and
		// the calendar opens on the value the consumer actually holds
		await openCalendar(canvas, userEvent);
		await clickDay(userEvent, "20");

		await expect(args.onChange).toHaveBeenCalledTimes(1);
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2026-08-20");
	},
};

export const ArrowKeysStepTheValue: StoryObj<BehaviourArgs> = {
	name: "Arrow keys step a section and report each step",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <Controlled {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(sections(canvas).third);

		await userEvent.keyboard("{ArrowUp}");
		await expect(fieldText(canvas)).toBe("08|01|2027");
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2027-08-01");

		await userEvent.keyboard("{ArrowDown}{ArrowDown}");
		await expect(fieldText(canvas)).toBe("08|01|2025");
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2025-08-01");
		// every step is a whole date, so every step is reported
		await expect(args.onChange).toHaveBeenCalledTimes(3);
	},
};

export const DeleteASection: StoryObj<BehaviourArgs> = {
	name: "Deleting a section empties the value",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <Controlled {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(sections(canvas).second);
		await userEvent.keyboard("{Backspace}");

		// an incomplete date is no date, and an empty value is valid — so it is
		// reported straight away rather than held back
		await expect(args.onChange).toHaveBeenCalledTimes(1);
		await expect(args.onChange).toHaveBeenLastCalledWith(null);
	},
};

export const DraftSurvivesSectionHopping: StoryObj<BehaviourArgs> = {
	name: "Moving between sections is not leaving the field",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <Controlled {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(sections(canvas).third);
		await typeSlowly(userEvent, "20");
		await expect(fieldText(canvas)).toBe("08|01|0020");

		// stepping to another section and back must not settle the draft, even
		// though the field fires a blur for it
		await userEvent.keyboard("{ArrowLeft}{ArrowRight}");
		await expect(fieldText(canvas)).toBe("08|01|0020");

		await typeSlowly(userEvent, "30");
		await expect(fieldText(canvas)).toBe("08|01|2030");
		await expect(args.onChange).toHaveBeenCalledTimes(1);
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2030-08-01");
	},
};

export const GermanFormat: StoryObj<BehaviourArgs> = {
	name: "A day-first format types the same way",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <Controlled {...args} adapterLocale={DAY_FIRST_LOCALE} />,
	play: async ({ args, canvas, userEvent }) => {
		// the sections come out DD.MM.YYYY, not MM/DD/YYYY
		await expect(fieldText(canvas)).toBe("01|08|2026");

		await userEvent.click(sections(canvas).first);
		await typeSlowly(userEvent, "12082030");

		await expect(fieldText(canvas)).toBe("12|08|2030");
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2030-08-12");
	},
};

export const ConsumerMinDateHoldsTheValue: StoryObj<BehaviourArgs> = {
	name: "A date outside the consumer's range is shown but not reported",
	args: { onChange: fn(), onError: fn(), initialValue: "2026-08-01" },
	render: (args) => <Controlled {...args} minDate={moment("2020-01-01")} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(sections(canvas).third);
		await typeSlowly(userEvent, "1990");

		// 1990 is a whole date, just not one this field accepts
		await expect(fieldText(canvas)).toBe("08|01|1990");
		await expect(args.onChange).not.toHaveBeenCalled();
		// the consumer hears about it through onError, which is how MUI reports it
		await expect(args.onError).toHaveBeenCalledWith(
			"minDate",
			expect.anything(),
		);
	},
};

export const ReadOnlyIgnoresTyping: StoryObj<BehaviourArgs> = {
	name: "A read-only field cannot be typed into",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <Controlled {...args} readOnly />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(sections(canvas).first);
		await typeSlowly(userEvent, "12");

		await expect(fieldText(canvas)).toBe("08|01|2026");
		await expect(args.onChange).not.toHaveBeenCalled();
	},
};

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, type Mock } from "storybook/test";
import i18next from "i18next";
import MuiPickerUtils from "../../../framework/MuiPickerUtils";
import DateInput from "./DateInput";
import DateTimeInput from "./DateTimeInput";
import moment, { type Moment } from "moment";

/**
 * Typing into the inputs as the framework wires them: inside `MuiPickerUtils`,
 * with `DateInput` holding a **date-only** value — a `Date` at 12:00 UTC whose
 * UTC parts carry the day, see `src/utils/dateOnlyUtils.ts`.
 *
 * This is the call site the model renderers use, so it crosses two boundaries at
 * once: the draft that keeps a half-typed date out of `onChange`, and the
 * `Date` ⇄ `Moment` conversion around it.
 */

if (!i18next.isInitialized) {
	void i18next.init({ lng: "en", resources: {} });
}

const meta: Meta = {
	title: "standalone/UIKit/InputControls/Date inputs",
	parameters: { layout: "centered" },
	decorators: [
		(Story) => (
			<MuiPickerUtils>
				<Story />
			</MuiPickerUtils>
		),
	],
};
export default meta;

/** See `LocalizedDateTimePickers/TypedEntry.stories.tsx` for the 5s limit */
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

/** What the whole field reads, sections and separators together */
const fieldText = (canvas: PlayContext["canvas"]) =>
	canvas
		.getAllByRole("spinbutton")
		.map((section) => section.textContent)
		.join("|");

interface DateInputArgs {
	/** Receives every date-only value the input reports upstream */
	onChange: Mock<(value: Date | null) => void>;
}

/** The date-only value the last reported change carried, as an ISO string */
const lastReported = (onChange: DateInputArgs["onChange"]) =>
	onChange.mock.calls[onChange.mock.calls.length - 1][0]?.toISOString() ?? null;

/** A stored date-only value: noon UTC, the UTC parts carrying the day */
const STORED = new Date("2026-08-01T12:00:00.000Z");

const ControlledDateInput = (args: DateInputArgs) => {
	const [value, setValue] = useState<Date | null>(STORED);
	return (
		<DateInput
			label="Date"
			value={value}
			onChange={(newValue) => {
				setValue(newValue);
				args.onChange(newValue);
			}}
		/>
	);
};

export const TypeOverAStoredDate: StoryObj<DateInputArgs> = {
	name: "DateInput — retyping a stored date-only value",
	args: { onChange: fn() },
	render: (args) => <ControlledDateInput {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await expect(fieldText(canvas)).toBe("08|01|2026");

		await userEvent.click(canvas.getAllByRole("spinbutton")[0]);
		await typeSlowly(userEvent, "12082030");

		await expect(fieldText(canvas)).toBe("12|08|2030");
		// the day the user typed, anchored at noon UTC — not shifted, and not a 19xx
		// date from a half-typed year having gone through normalizeDate
		await expect(lastReported(args.onChange)).toBe("2030-12-08T12:00:00.000Z");
		for (const call of args.onChange.mock.calls) {
			await expect(call[0]?.getUTCFullYear()).toBeGreaterThanOrEqual(2026);
		}
	},
};

export const NoIntermediateYearReachesTheForm: StoryObj<DateInputArgs> = {
	name: "DateInput — a half-typed year never reaches the form",
	args: { onChange: fn() },
	render: (args) => <ControlledDateInput {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getAllByRole("spinbutton")[2]);

		// 2 → 20 → 202 on the way to 2026. Reported, each would have been recorded
		// as 1902, 1920 and 0202 once normalizeDate got hold of it.
		await typeSlowly(userEvent, "202");
		await expect(fieldText(canvas)).toBe("08|01|0202");
		await expect(args.onChange).not.toHaveBeenCalled();

		await typeSlowly(userEvent, "6");
		await expect(args.onChange).toHaveBeenCalledTimes(1);
		await expect(lastReported(args.onChange)).toBe("2026-08-01T12:00:00.000Z");
	},
};

export const ClearReportsNull: StoryObj<DateInputArgs> = {
	name: "DateInput — clearing reports null",
	args: { onChange: fn() },
	render: (args) => <ControlledDateInput {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		// from the keyboard: the clear button only renders on touch devices, see
		// `isTouchDevice` in PickersTextFieldWithHelp
		await userEvent.click(canvas.getAllByRole("spinbutton")[0]);
		await userEvent.keyboard("{Control>}a{/Control}");
		await userEvent.keyboard("{Delete}");

		await expect(args.onChange).toHaveBeenCalledTimes(1);
		await expect(args.onChange).toHaveBeenLastCalledWith(null);
	},
};

const ControlledDateTimeInput = (args: {
	onChange: Mock<(value: Moment | null) => void>;
}) => {
	const [value, setValue] = useState<Moment | null>(() =>
		moment("2026-08-01T10:30:00"),
	);
	return (
		<DateTimeInput
			label="Date & time"
			value={value}
			onChange={(newValue) => {
				setValue(newValue);
				args.onChange(newValue);
			}}
		/>
	);
};

export const DateTimeInputTypedEntry: StoryObj<{
	onChange: Mock<(value: Moment | null) => void>;
}> = {
	name: "DateTimeInput — retyping the year keeps the time",
	args: { onChange: fn() },
	render: (args) => <ControlledDateTimeInput {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getAllByRole("spinbutton")[2]);
		await typeSlowly(userEvent, "2030");

		await expect(args.onChange).toHaveBeenCalledTimes(1);
		const reported = args.onChange.mock.calls[0][0];
		await expect(reported?.format("YYYY-MM-DD HH:mm")).toBe("2030-08-01 10:30");
	},
};

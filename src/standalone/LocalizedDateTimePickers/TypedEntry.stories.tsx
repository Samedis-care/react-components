import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, type Mock } from "storybook/test";
import i18next from "i18next";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { type Moment } from "moment";
import LocalizedKeyboardDatePicker from "./LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "./LocalizedDatePicker";
import LocalizedDateTimePicker from "./LocalizedDateTimePicker";

/**
 * Typing into a **controlled** picker — the consumer stores the value and hands
 * it back as `value`, which is what `DateInput` and the model renderers do.
 *
 * Two things have to hold at once, and they pull against each other: the field
 * must follow every keystroke, and the consumer must only hear about dates the
 * user finished entering. See `usePickerDraft`.
 *
 * These stories drive real keystrokes with a pause between them. A test that
 * sends the whole string in one burst passes even with the bug present, because
 * the field's section state accumulates the full year before React re-renders.
 */

// Kept in its own stories file so the picker labels stay English: i18next is a
// module singleton, and the stories next door switch it to German.
if (!i18next.isInitialized) {
	void i18next.init({ lng: "en", resources: {} });
}

const meta: Meta = {
	title: "standalone/LocalizedDateTimePickers/Typed entry",
	parameters: { layout: "centered" },
	decorators: [
		(Story) => (
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<Story />
			</LocalizationProvider>
		),
	],
};
export default meta;

/**
 * The fields drop a partially typed section after 5s of inactivity
 * (`QUERY_LIFE_DURATION_MS`), which would restart the year mid-entry, so
 * keystrokes have to stay closer together than that while still arriving as
 * separate events.
 */
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

/** The field sections, in the order the `L` / `L LT` formats render them for `en` */
const sections = (canvas: PlayContext["canvas"]) => {
	const found = canvas.getAllByRole("spinbutton");
	return { month: found[0], day: found[1], year: found[2] };
};

/** What the whole field reads, sections and separators together */
const fieldText = (canvas: PlayContext["canvas"]) =>
	canvas
		.getAllByRole("spinbutton")
		.map((section) => section.textContent)
		.join("|");

interface TypedEntryArgs {
	/** Receives every value a picker reports upstream */
	onChange: Mock<(value: Moment | null) => void>;
	/** The date the consumer starts out holding */
	initialValue?: string;
}

/** Every value that reached the consumer, formatted for comparison */
const reported = (onChange: TypedEntryArgs["onChange"], format: string) =>
	onChange.mock.calls.map((call) => call[0]?.format(format) ?? "null");

/** The value the last reported change carried, formatted for comparison */
const lastReported = (onChange: TypedEntryArgs["onChange"], format: string) =>
	reported(onChange, format).at(-1);

/**
 * The years of every reported value.
 *
 * Nothing stops the field from publishing the month and day a user types on
 * their way to a full date — those are real dates in their own right. A year
 * outside the picker's range is the tell that a half-typed one escaped:
 * `normalizeDate` would turn the `0020` of `12.08.20` into 1920.
 */
const reportedYears = (onChange: TypedEntryArgs["onChange"]) =>
	onChange.mock.calls.map((call) => call[0]?.year() ?? null);

/** Clears the whole field from the keyboard, there being no clear button */
const clearField = async (userEvent: PlayContext["userEvent"]) => {
	await userEvent.keyboard("{Control>}a{/Control}");
	await userEvent.keyboard("{Delete}");
};

const useConsumerState = (args: TypedEntryArgs) => {
	const [value, setValue] = useState<Moment | null>(() =>
		args.initialValue ? moment(args.initialValue) : null,
	);
	return {
		value,
		onChange: (newValue: Moment | null) => {
			setValue(newValue);
			args.onChange(newValue);
		},
	};
};

const ControlledKeyboardDatePicker = (args: TypedEntryArgs) => {
	const consumer = useConsumerState(args);
	return <LocalizedKeyboardDatePicker label="Date" {...consumer} />;
};

const ControlledDatePicker = (args: TypedEntryArgs) => {
	const consumer = useConsumerState(args);
	return <LocalizedDatePicker label="Date" {...consumer} />;
};

const ControlledDateTimePicker = (args: TypedEntryArgs) => {
	const consumer = useConsumerState(args);
	return <LocalizedDateTimePicker label="Date & time" {...consumer} />;
};

export const OverwriteStoredDate: StoryObj<TypedEntryArgs> = {
	name: "Overwriting a stored date, one keystroke at a time",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <ControlledKeyboardDatePicker {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		const { month } = sections(canvas);
		await expect(fieldText(canvas)).toBe("08|01|2026");

		// the issue's reproduction: retype the whole date over the stored one. The
		// year has to differ from the stored one, or a swallowed year is invisible.
		await userEvent.click(month);
		await typeSlowly(userEvent, "12082030");

		// every keystroke landed, none was taken back
		await expect(fieldText(canvas)).toBe("12|08|2030");
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2030-12-08");
		// no half-typed year ever reached the consumer
		for (const year of reportedYears(args.onChange)) {
			await expect([2026, 2030]).toContain(year);
		}
	},
};

/**
 * The condition that makes the swallowed keystroke bite in a real application:
 * the value is stored as a string and turned into a `Moment` **during render** —
 * the idiom every consumer uses — so an unrelated re-render hands the field a
 * fresh instance, and the field compares its external value by reference. The
 * interval stands in for whatever else re-renders a form while it is being
 * typed into; at 40ms against a 300ms keystroke it cannot miss a gap.
 */
const RerenderingHarness = (args: TypedEntryArgs) => {
	const [iso, setIso] = useState(args.initialValue ?? "");
	const [, forceRender] = useState(0);
	React.useEffect(() => {
		const handle = setInterval(() => {
			forceRender((tick) => tick + 1);
		}, 40);
		return () => {
			clearInterval(handle);
		};
	}, []);
	return (
		<LocalizedKeyboardDatePicker
			label="Date"
			value={iso ? moment(iso) : null}
			onChange={(newValue) => {
				setIso(newValue ? newValue.format("YYYY-MM-DD") : "");
				args.onChange(newValue);
			}}
		/>
	);
};

export const SurvivesUnrelatedRerenders: StoryObj<TypedEntryArgs> = {
	name: "Typing survives a parent that re-renders while you type",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <RerenderingHarness {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(sections(canvas).year);

		await typeSlowly(userEvent, "2");
		// several re-renders have gone by, each handing the field a fresh Moment for
		// the same day — none of them may be taken for a change from outside, or the
		// first digit is dropped and every following one with it
		await expect(fieldText(canvas)).toBe("08|01|0002");

		await typeSlowly(userEvent, "030");
		await expect(fieldText(canvas)).toBe("08|01|2030");
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2030-08-01");
		for (const year of reportedYears(args.onChange)) {
			await expect([2026, 2030]).toContain(year);
		}
	},
};

export const YearGrowsDigitByDigit: StoryObj<TypedEntryArgs> = {
	name: "A year is not reported until it is whole",
	args: { onChange: fn() },
	render: (args) => <ControlledKeyboardDatePicker {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		const { month, year } = sections(canvas);
		await userEvent.click(month);

		// month and day alone do not make up a value yet
		await typeSlowly(userEvent, "0812");
		await expect(args.onChange).not.toHaveBeenCalled();

		// each of these is a real date the field publishes, and none of them is
		// what the user is typing
		for (const [digit, shown] of [
			["2", "0002"],
			["0", "0020"],
			["2", "0202"],
		]) {
			await typeSlowly(userEvent, digit);
			await expect(year).toHaveTextContent(shown);
			await expect(args.onChange).not.toHaveBeenCalled();
		}

		await typeSlowly(userEvent, "6");
		await expect(year).toHaveTextContent("2026");
		await expect(args.onChange).toHaveBeenCalledTimes(1);
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2026-08-12");
	},
};

export const ClearingIsReportedAtOnce: StoryObj<TypedEntryArgs> = {
	name: "Clearing the field reports null right away",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <ControlledKeyboardDatePicker {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(sections(canvas).month);
		await clearField(userEvent);

		// an empty value is valid, so it is not held back as a draft
		await expect(args.onChange).toHaveBeenCalledTimes(1);
		await expect(args.onChange).toHaveBeenLastCalledWith(null);
		// nothing of the old date is left in the field
		await expect(canvas.getByRole("group")).not.toHaveTextContent(/\d/);
	},
};

export const BlurDropsAnUnfinishedDate: StoryObj<TypedEntryArgs> = {
	name: "Leaving the field drops a half-typed date",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => (
		<>
			<ControlledKeyboardDatePicker {...args} />
			<button type="button">elsewhere</button>
		</>
	),
	play: async ({ args, canvas, userEvent }) => {
		// only the year, so nothing valid is produced along the way
		await userEvent.click(sections(canvas).year);
		await typeSlowly(userEvent, "20");
		await expect(fieldText(canvas)).toBe("08|01|0020");
		await expect(args.onChange).not.toHaveBeenCalled();

		// nothing was accepted, so the field must not be left showing year 20
		await userEvent.click(canvas.getByRole("button", { name: "elsewhere" }));
		await expect(fieldText(canvas)).toBe("08|01|2026");
		await expect(args.onChange).not.toHaveBeenCalled();
	},
};

export const ExternalResetWinsOverDraft: StoryObj<TypedEntryArgs> = {
	name: "An outside change replaces what was being typed",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => {
		const ResetHarness = () => {
			const [value, setValue] = useState<Moment | null>(() =>
				moment(args.initialValue),
			);
			return (
				<>
					<LocalizedKeyboardDatePicker
						label="Date"
						value={value}
						onChange={(newValue) => {
							setValue(newValue);
							args.onChange(newValue);
						}}
					/>
					<button
						type="button"
						onClick={() => {
							setValue(moment("2030-01-15"));
						}}
					>
						reset
					</button>
				</>
			);
		};
		return <ResetHarness />;
	},
	play: async ({ canvas, userEvent }) => {
		const { month } = sections(canvas);
		await userEvent.click(month);
		await typeSlowly(userEvent, "1208" + "20");
		await expect(fieldText(canvas)).toBe("12|08|0020");

		await userEvent.click(canvas.getByRole("button", { name: "reset" }));
		await expect(fieldText(canvas)).toBe("01|15|2030");
	},
};

export const DatePickerOverwriteStoredDate: StoryObj<TypedEntryArgs> = {
	name: "LocalizedDatePicker — overwriting a stored date",
	args: { onChange: fn(), initialValue: "2026-08-01" },
	render: (args) => <ControlledDatePicker {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(sections(canvas).month);
		await typeSlowly(userEvent, "12082030");

		await expect(fieldText(canvas)).toBe("12|08|2030");
		await expect(lastReported(args.onChange, "YYYY-MM-DD")).toBe("2030-12-08");
		for (const year of reportedYears(args.onChange)) {
			await expect([2026, 2030]).toContain(year);
		}
	},
};

export const DateTimePickerOverwriteStoredDate: StoryObj<TypedEntryArgs> = {
	name: "LocalizedDateTimePicker — overwriting the year of a stored date",
	args: { onChange: fn(), initialValue: "2026-08-01T10:30:00" },
	render: (args) => <ControlledDateTimePicker {...args} />,
	play: async ({ args, canvas, userEvent }) => {
		const { year } = sections(canvas);
		await userEvent.click(year);
		await typeSlowly(userEvent, "2030");

		await expect(args.onChange).toHaveBeenCalledTimes(1);
		await expect(lastReported(args.onChange, "YYYY-MM-DD HH:mm")).toBe(
			"2030-08-01 10:30",
		);
	},
};

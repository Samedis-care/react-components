import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, waitFor } from "storybook/test";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { type Moment } from "moment";
import ccI18n from "../../i18n";
import LocalizedKeyboardDatePicker from "./LocalizedKeyboardDatePicker";
import LocalizedDateTimePicker from "./LocalizedDateTimePicker";

/**
 * The text a date or date-time picker shows under the field while its own
 * validation (`minDate`, `maxDate`, `minTime`, `minDateTime`, `disablePast`, an
 * impossible date, …) rejects the value it shows. It takes the place of the
 * helper text, is the field's description, and waits until the user leaves the
 * field before it appears, so a year typed through 0002, 0020 and 0202 does
 * not flash it.
 */
const meta: Meta = {
	title: "standalone/LocalizedDateTimePickers/Validation message",
	parameters: { layout: "centered", a11y: { test: "error" } },
	loaders: [
		async () => {
			await ccI18n.changeLanguage("en");
			return {};
		},
	],
	decorators: [
		(Story) => (
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<div style={{ width: 320 }}>
					<Story />
				</div>
			</LocalizationProvider>
		),
	],
};
export default meta;

type PlayContext = Parameters<NonNullable<StoryObj["play"]>>[0];

const MIN_DATE = moment("2020-01-01");

const Controlled = (props: { initial: string; hint?: string }) => {
	const [value, setValue] = useState<Moment | null>(() =>
		moment(props.initial),
	);
	return (
		<LocalizedKeyboardDatePicker
			label="Valid from"
			value={value}
			onChange={setValue}
			minDate={MIN_DATE}
			fullWidth
			slotProps={
				props.hint ? { textField: { helperText: props.hint } } : undefined
			}
		/>
	);
};

const fieldText = (canvas: PlayContext["canvas"]) =>
	canvas
		.getAllByRole("spinbutton")
		.map((section) => section.textContent)
		.join("|");

/** A stored date before `minDate`: the message shows at once */
export const RejectedDate: StoryObj = {
	render: () => <Controlled initial="1999-06-15" />,
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("group")).toHaveAccessibleDescription(
			"Enter a date on or after 01/01/2020",
		);
	},
};

/** The message takes the place of the helper text while the date is rejected */
export const RejectedDateWithHelperText: StoryObj = {
	render: () => (
		<Controlled initial="1999-06-15" hint="From the inspection sticker." />
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByText("Enter a date on or after 01/01/2020"),
		).toBeVisible();
		await expect(
			canvas.queryByText("From the inspection sticker."),
		).not.toBeInTheDocument();
	},
};

/**
 * Typing a year over a stored date: 0002, 0020 and 0202 are before `minDate`,
 * so the field turns red on the way, but no message appears while the user is
 * still typing.
 */
export const TypingAYear: StoryObj = {
	render: () => (
		<Controlled initial="2026-08-01" hint="From the inspection sticker." />
	),
	play: async ({ canvas, userEvent }) => {
		const group = canvas.getByRole("group");
		await userEvent.click(canvas.getAllByRole("spinbutton")[2]);
		for (const [key, year] of [
			["2", "0002"],
			["0", "0020"],
			["2", "0202"],
		]) {
			await userEvent.keyboard(key);
			await waitFor(() => expect(fieldText(canvas)).toBe(`08|01|${year}`));
			await expect(group).toHaveAttribute("aria-invalid", "true");
			await expect(
				canvas.getByText("From the inspection sticker."),
			).toBeVisible();
		}
		await userEvent.keyboard("7");
		await waitFor(() => expect(fieldText(canvas)).toBe("08|01|2027"));
		await expect(group).toHaveAttribute("aria-invalid", "false");
		await expect(
			canvas.getByText("From the inspection sticker."),
		).toBeVisible();
	},
};

/**
 * An uncontrolled picker keeps a rejected entry when focus leaves, and then
 * says what is wrong with it
 */
export const LeavingARejectedEntry: StoryObj = {
	render: () => (
		<>
			<LocalizedKeyboardDatePicker
				label="Valid from"
				defaultValue={moment("2026-08-01")}
				minDate={MIN_DATE}
				fullWidth
			/>
			<button type="button">Next</button>
		</>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getAllByRole("spinbutton")[2]);
		for (const key of "1999") {
			await userEvent.keyboard(key);
		}
		await waitFor(() => expect(fieldText(canvas)).toBe("08|01|1999"));
		await expect(
			canvas.queryByText("Enter a date on or after 01/01/2020"),
		).not.toBeInTheDocument();

		await userEvent.click(canvas.getByRole("button", { name: "Next" }));
		await expect(canvas.getByRole("group")).toHaveAccessibleDescription(
			"Enter a date on or after 01/01/2020",
		);
	},
};

const OPENING = moment("2026-08-01T09:00");
const CLOSING = moment("2026-08-01T17:00");

const ControlledDateTime = (props: { initial: string; hint?: string }) => {
	const [value, setValue] = useState<Moment | null>(() =>
		moment(props.initial),
	);
	return (
		<LocalizedDateTimePicker
			label="Starts"
			value={value}
			onChange={setValue}
			minTime={OPENING}
			maxTime={CLOSING}
			fullWidth
			slotProps={
				props.hint ? { textField: { helperText: props.hint } } : undefined
			}
		/>
	);
};

/**
 * A date-time picker with a stored time before `minTime`: the message names the
 * time, written as the field writes it
 */
export const RejectedTime: StoryObj = {
	render: () => (
		<ControlledDateTime
			initial="2026-08-01T08:00"
			hint="During the opening hours."
		/>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("group")).toHaveAccessibleDescription(
			"Enter a time at or after 09:00 AM",
		);
		await expect(
			canvas.queryByText("During the opening hours."),
		).not.toBeInTheDocument();
	},
};

/**
 * A date-time picker with `minDateTime`: an earlier day and an earlier time on
 * its day both ask for a date and time on or after it
 */
export const RejectedDateTime: StoryObj = {
	render: () => (
		<LocalizedDateTimePicker
			label="Starts"
			value={moment("2026-08-01T09:30")}
			minDateTime={moment("2026-08-01T10:00")}
			fullWidth
		/>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("group")).toHaveAccessibleDescription(
			"Enter a date and time on or after 08/01/2026 10:00 AM",
		);
	},
};

/**
 * Typing an hour after closing time: the field turns red, and the message
 * appears once the user leaves it
 */
export const LeavingARejectedTime: StoryObj = {
	render: () => (
		<>
			<ControlledDateTime initial="2026-08-01T10:00" />
			<button type="button">Next</button>
		</>
	),
	play: async ({ canvas, userEvent }) => {
		const group = canvas.getByRole("group");
		const message = "Enter a time at or before 05:00 PM";
		await userEvent.click(canvas.getAllByRole("spinbutton")[5]);
		await userEvent.keyboard("P");
		await waitFor(() => expect(fieldText(canvas)).toBe("08|01|2026|10|00|PM"));
		await expect(group).toHaveAttribute("aria-invalid", "true");
		await expect(canvas.queryByText(message)).not.toBeInTheDocument();

		await userEvent.click(canvas.getByRole("button", { name: "Next" }));
		await expect(group).toHaveAccessibleDescription(message);
	},
};

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import i18next from "i18next";
import LocalizedKeyboardDatePicker from "./LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "./LocalizedDatePicker";
import LocalizedDateTimePicker from "./LocalizedDateTimePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers";
import moment, { type Moment } from "moment";

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

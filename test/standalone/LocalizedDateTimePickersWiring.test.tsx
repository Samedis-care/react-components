import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import ccI18n from "../../src/i18n";
import LocalizedKeyboardDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedKeyboardDatePicker";
import LocalizedDatePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDatePicker";
import LocalizedDateTimePicker from "../../src/standalone/LocalizedDateTimePickers/LocalizedDateTimePicker";

/**
 * How the three picker wrappers wire the draft hook (`usePickerDraft`) into MUI's
 * pickers, which of the consumer's props reach the field, and what the field
 * exposes to assistive technology.
 */
import DateInput from "../../src/standalone/UIKit/InputControls/DateInput";
import DateTimeInput from "../../src/standalone/UIKit/InputControls/DateTimeInput";

const theme = createTheme();

const Wrap = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider theme={theme}>
		<LocalizationProvider dateAdapter={AdapterMoment}>
			{children}
		</LocalizationProvider>
	</ThemeProvider>
);

afterEach(async () => {
	cleanup();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

describe("accessibility", () => {
	it.each([
		[
			"LocalizedKeyboardDatePicker",
			<LocalizedKeyboardDatePicker
				key="k"
				label="Due"
				value={null}
				onChange={vi.fn()}
				required
			/>,
		],
		[
			"LocalizedDatePicker",
			<LocalizedDatePicker
				key="d"
				label="Due"
				value={null}
				onChange={vi.fn()}
				slotProps={{ textField: { required: true } }}
			/>,
		],
		[
			"LocalizedDateTimePicker",
			<LocalizedDateTimePicker
				key="dt"
				label="Due"
				value={null}
				onChange={vi.fn()}
				required
			/>,
		],
	])(
		"[ISSUE-3474-ITEM-16] exposes required on every section of a %s",
		(_name, element) => {
			render(<Wrap>{element}</Wrap>);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toBeRequired();
			}
		},
	);

	it.each([
		["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
		["LocalizedDatePicker", LocalizedDatePicker],
		["LocalizedDateTimePicker", LocalizedDateTimePicker],
	] as const)(
		"[ISSUE-3474-ITEM-16] leaves required off the sections of an optional %s",
		(_name, Picker) => {
			render(
				<Wrap>
					<Picker label="Due" value={null} onChange={vi.fn()} />
				</Wrap>,
			);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).not.toBeRequired();
			}
		},
	);

	it.each(["standard", "filled"] as const)(
		"[ISSUE-3474-ITEM-16] exposes required on every section of the %s variant",
		(variant) => {
			render(
				<Wrap>
					<LocalizedKeyboardDatePicker
						label="Due"
						value={null}
						onChange={vi.fn()}
						required
						slotProps={{ textField: { variant } }}
					/>
				</Wrap>,
			);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toBeRequired();
			}
		},
	);

	it("[ISSUE-3474-ITEM-16] follows required when it changes after mount", () => {
		const picker = (required: boolean) => (
			<Wrap>
				<LocalizedKeyboardDatePicker
					label="Due"
					value={null}
					onChange={vi.fn()}
					required={required}
				/>
			</Wrap>
		);
		const { rerender } = render(picker(false));
		const requiredSections = () =>
			screen
				.getAllByRole("spinbutton")
				.map((section) => section.getAttribute("aria-required"));

		rerender(picker(true));
		expect(requiredSections()).toEqual(["true", "true", "true"]);
		rerender(picker(false));
		expect(requiredSections()).toEqual([null, null, null]);
	});

	it.each([
		["an object", { className: "caller-section" }],
		["a function", () => ({ className: "caller-section" })],
	])(
		"[ISSUE-3474-ITEM-16] keeps the caller's section content props given as %s",
		(_form, sectionContent) => {
			render(
				<Wrap>
					<LocalizedKeyboardDatePicker
						label="Due"
						value={null}
						onChange={vi.fn()}
						required
						slotProps={{
							textField: {
								slotProps: { input: { slotProps: { sectionContent } } },
							},
						}}
					/>
				</Wrap>,
			);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toBeRequired();
				expect(section).toHaveClass("caller-section");
			}
		},
	);

	it.each([
		[
			"DateInput",
			<DateInput
				key="d"
				label="Due"
				value={null}
				onChange={vi.fn()}
				required
			/>,
		],
		[
			"DateTimeInput",
			<DateTimeInput
				key="dt"
				label="Due"
				value={null}
				onChange={vi.fn()}
				required
			/>,
		],
	])(
		"[ISSUE-3474-ITEM-16] exposes required on every section of a %s",
		(_name, element) => {
			render(<Wrap>{element}</Wrap>);
			for (const section of screen.getAllByRole("spinbutton")) {
				expect(section).toBeRequired();
			}
		},
	);
});

const PICKERS = [
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
	["LocalizedDateTimePicker", LocalizedDateTimePicker],
] as const;

describe.each(PICKERS)("%s wiring", (_name, Picker) => {
	it("[ISSUE-3474-ITEM-1] renders an invalid value instead of looping", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		try {
			render(
				<Wrap>
					<Picker label="Due" value={moment.invalid()} onChange={vi.fn()} />
				</Wrap>,
			);
		} finally {
			consoleError.mockRestore();
		}
		expect(screen.getByRole("group", { name: "Due" })).toBeInTheDocument();
	});

	it("[ISSUE-3474-ITEM-1] shows an invalid value as an invalid field and reports invalidDate, as MUI does", () => {
		const onChange = vi.fn();
		const onError = vi.fn<(error: unknown) => void>();
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});
		try {
			render(
				<Wrap>
					<Picker
						label="Due"
						value={moment.invalid()}
						onChange={onChange}
						onError={onError}
					/>
				</Wrap>,
			);
		} finally {
			consoleError.mockRestore();
		}
		expect({
			invalid: screen
				.getByRole("group", { name: "Due" })
				.getAttribute("aria-invalid"),
			errors: onError.mock.calls.map((call) => call[0]),
			changes: onChange.mock.calls.length,
		}).toEqual({ invalid: "true", errors: ["invalidDate"], changes: 0 });
	});
});

const STORED = "2026-08-01T10:00";

describe("picker texts", () => {
	it("[ISSUE-3474-ITEM-7] use MUI's Italian texts for the library language it", async () => {
		await act(async () => {
			await ccI18n.changeLanguage("it");
		});
		render(
			<Wrap>
				<LocalizedKeyboardDatePicker
					value={moment(STORED)}
					onChange={vi.fn()}
				/>
			</Wrap>,
		);
		expect(
			screen.getByRole("button", { name: /^Scegli la data/ }),
		).toBeInTheDocument();
	});

	it.each([
		["it", "Anno", /^Scegli la data/],
		["es", "Año", /^Elige fecha/],
	])(
		"[ISSUE-3474-ITEM-7] names the sections and the button of every picker in the library language %s",
		async (language, year, openButton) => {
			await act(async () => {
				await ccI18n.changeLanguage(language);
			});
			for (const [, Picker] of PICKERS) {
				const { unmount } = render(
					<Wrap>
						<Picker value={moment(STORED)} onChange={vi.fn()} />
					</Wrap>,
				);
				expect(screen.getByRole("spinbutton", { name: year })).toBeVisible();
				expect(
					screen.getByRole("button", { name: openButton }),
				).toBeInTheDocument();
				unmount();
			}
		},
	);
});

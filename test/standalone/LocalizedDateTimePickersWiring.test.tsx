import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
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

const PICKERS = [
	["LocalizedKeyboardDatePicker", LocalizedKeyboardDatePicker],
	["LocalizedDatePicker", LocalizedDatePicker],
	["LocalizedDateTimePicker", LocalizedDateTimePicker],
] as const;

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

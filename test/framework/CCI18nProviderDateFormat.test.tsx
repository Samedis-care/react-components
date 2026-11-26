import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material";
import moment from "moment";
import ccI18n from "../../src/i18n";
import useCurrentLocale from "../../src/utils/useCurrentLocale";
import CCI18nProvider from "../../src/framework/CCI18nProvider";
import MuiPickerUtils from "../../src/framework/MuiPickerUtils";
import type ModelRenderParams from "../../src/backend-integration/Model/RenderParams";
import RendererDateNullable from "../../src/backend-integration/Model/Types/Renderers/Material-UI/RendererDateNullable";

/**
 * Inside CCI18nProvider, the date pickers take a date in the order and with the
 * separators the date renderers show it in, for every locale: typing the date a
 * renderer shows gives that date. The renderers format with Intl, the pickers
 * with moment's `L` of the locale, and moment has no locale for most regions
 * (en-ZA, en-NG, …), or one with another order (es-US). The provider applies
 * the locale after its children have rendered, so the pickers already shown
 * have to follow it.
 */

const theme = createTheme();
/** 5 January: a day of 12 or less tells a day-first from a month-first order */
const DAY = new Date("2026-01-05T12:00:00.000Z");

/** A date field of a model, as a form (editable) or a grid cell (view) renders it */
const params = (
	value: Date | null,
	editable: boolean,
	handleChange: ModelRenderParams<Date | null>["handleChange"],
): ModelRenderParams<Date | null> => ({
	field: "due_at",
	value,
	initialValue: value,
	label: "Due",
	touched: false,
	dirty: false,
	autoFocus: false,
	visibility: {
		disabled: false,
		hidden: false,
		editable,
		readOnly: false,
		required: false,
		grid: !editable,
	},
	handleChange,
	handleBlur: vi.fn(),
	setFieldTouched: vi.fn(),
	errorMsg: null,
	warningMsg: null,
	setError: vi.fn(),
	setFieldValue: vi.fn(),
	values: {},
});

const renderer = new RendererDateNullable();

/**
 * The date field as a grid cell shows it (with a value) and as a form shows it
 * (empty); renders again on a language change, as a grid or a form does
 */
const Field = (props: {
	editable: boolean;
	handleChange: ModelRenderParams<Date | null>["handleChange"];
}) => {
	useCurrentLocale();
	return renderer.render(
		params(props.editable ? null : DAY, props.editable, props.handleChange),
	);
};

/**
 * Renders the date field in a grid cell and in a form, inside the providers
 * the Framework renders, in its order
 * @returns The change handler of the form's field
 */
const renderField = () => {
	const handleChange = vi.fn();
	render(
		<CCI18nProvider>
			<MuiPickerUtils>
				<ThemeProvider theme={theme}>
					<>
						<div data-testid={"cell"}>
							<Field editable={false} handleChange={handleChange} />
						</div>
						<Field editable handleChange={handleChange} />
					</>
				</ThemeProvider>
			</MuiPickerUtils>
		</CCI18nProvider>,
	);
	return handleChange;
};

/** Waits until the provider applied the language (it sets `<html lang>` then) */
const applied = (language: string) =>
	waitFor(() => expect(document.documentElement.lang).toBe(language));

/** The date the grid cell shows */
const shownDate = () => screen.getByTestId("cell").textContent ?? "";

/**
 * Types each run of digits of a date as shown into the field's next section,
 * one digit at a time, as MUI's field reads it: from the section's text after
 * the browser's input event. Then presses Enter, which reports the date.
 */
const typeShownDate = (shown: string) => {
	const runs = shown.split(/\D+/).filter(Boolean);
	runs.forEach((digits, index) => {
		act(() => {
			screen.getAllByRole("spinbutton")[index].focus();
		});
		for (const digit of digits) {
			act(() => {
				const section = screen.getAllByRole("spinbutton")[index];
				section.textContent = digit;
				fireEvent.input(section);
			});
		}
	});
	act(() => {
		fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Enter" });
	});
};

beforeEach(async () => {
	await ccI18n.changeLanguage("en-US");
	moment.locale("en");
	document.documentElement.lang = "";
});
afterEach(async () => {
	cleanup();
	// a real switch changes the shared instance and the detector's cache
	await ccI18n.changeLanguage("en-US");
	moment.locale("en");
	localStorage.clear();
});

describe("CCI18nProvider's date format", () => {
	it.each([
		// moment has no locale for these regions
		["en-ZA", "2026/01/05"],
		["en-NG", "05/01/2026"],
		["en-PK", "05/01/2026"],
		["en-KE", "05/01/2026"],
		["es-PA", "01/05/2026"],
		// moment's own locale orders day and month the other way
		["es-US", "05/01/2026"],
		// moment's own format already is the one shown
		["en-US", "01/05/2026"],
		["en-GB", "05/01/2026"],
		["de-DE", "05.01.2026"],
	])(
		"[ISSUE-3474-ITEM-38] in %s, typing the date a renderer shows into a date picker gives that date",
		async (locale, shownAs) => {
			await act(async () => {
				await ccI18n.changeLanguage(locale);
			});
			const handleChange = renderField();
			await applied(locale.split("-")[0]);
			expect(shownDate()).toBe(shownAs);

			typeShownDate(shownDate());

			expect(handleChange).toHaveBeenLastCalledWith(
				"due_at",
				new Date("2026-01-05T12:00:00.000Z"),
			);
		},
	);

	it("[ISSUE-3474-ITEM-38] a date picker shown while the language changes takes the date as shown in the new one", async () => {
		await act(async () => {
			await ccI18n.changeLanguage("de-DE");
		});
		const handleChange = renderField();
		await applied("de");

		await act(async () => {
			await ccI18n.changeLanguage("en-ZA");
		});
		await applied("en");
		expect(shownDate()).toBe("2026/01/05");
		typeShownDate(shownDate());

		expect(handleChange).toHaveBeenLastCalledWith(
			"due_at",
			new Date("2026-01-05T12:00:00.000Z"),
		);
	});
});

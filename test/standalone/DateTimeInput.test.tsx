import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import DateTimeInput from "../../src/standalone/UIKit/InputControls/DateTimeInput";

/**
 * DateTimeInput: LocalizedDateTimePicker with PickersTextFieldWithHelp as its
 * text field. Its value is a local Moment, unlike DateInput's date-only Date.
 */

// jsdom has "ontouchstart" on window, so isTouchDevice() is true unless mocked
const env = vi.hoisted(() => ({ touch: false }));
vi.mock("../../src/utils/isTouchDevice", () => ({
	default: () => env.touch,
}));

const theme = createTheme();
const tree = (node: React.ReactNode) => (
	<ThemeProvider theme={theme}>
		<LocalizationProvider dateAdapter={AdapterMoment}>
			{node}
		</LocalizationProvider>
	</ThemeProvider>
);
const wrap = (ui: React.ReactNode) => {
	const result = render(tree(ui));
	return {
		...result,
		rerender: (node: React.ReactNode) => result.rerender(tree(node)),
	};
};

afterEach(() => {
	cleanup();
	env.touch = false;
});

const AT = "2026-08-13T22:45:00";
const noop = () => {};

const openButton = () => screen.findByRole("button", { name: /choose date/i });

describe("DateTimeInput", () => {
	describe("bugs", () => {
		it("[ISSUE-3485-ITEM-4] passes slotProps.textField.slotProps.input and .formHelperText on to the field", async () => {
			wrap(
				<DateTimeInput
					label="At"
					value={moment(AT)}
					onChange={noop}
					slotProps={{
						textField: {
							helperText: "Local time",
							slotProps: {
								input: { startAdornment: <span data-testid="start">S</span> },
								formHelperText: { id: "at-help-text" },
							},
						},
					}}
				/>,
			);
			await openButton();
			expect(screen.queryByTestId("start")).not.toBeNull();
			expect(screen.getByText("Local time")).toHaveAttribute(
				"id",
				"at-help-text",
			);
		});

		it("[ISSUE-3485-ITEM-4] can be named without a visible label through slotProps.textField.slotProps.input", async () => {
			wrap(
				<DateTimeInput
					value={null}
					onChange={noop}
					slotProps={{
						textField: {
							slotProps: { input: { "aria-label": "Starts at" } as object },
						},
					}}
				/>,
			);
			await openButton();
			expect(screen.queryByRole("group", { name: "Starts at" })).not.toBeNull();
		});

		it("[ISSUE-3485-ITEM-4] passes slotProps.textField.slotProps.htmlInput and .root on to the field", async () => {
			const { container } = wrap(
				<DateTimeInput
					label="At"
					value={moment(AT)}
					onChange={noop}
					slotProps={{
						textField: {
							slotProps: {
								htmlInput: { "data-testid": "hidden-input" } as object,
								root: { "data-testid": "field-root" } as object,
							},
						},
					}}
				/>,
			);
			await openButton();
			expect(screen.getByTestId("hidden-input")).toBe(
				container.querySelector("input"),
			);
			expect(screen.getByTestId("field-root")).toContainElement(
				screen.getByRole("group", { name: "At" }),
			);
		});

		it("[ISSUE-3485-ITEM-4] passes slotProps.textField.slotProps.input.slotProps.sectionContent on to the sections", async () => {
			wrap(
				<DateTimeInput
					label="At"
					value={moment(AT)}
					onChange={noop}
					required
					slotProps={{
						textField: {
							slotProps: {
								input: {
									slotProps: { sectionContent: { "aria-describedby": "x" } },
								} as object,
							},
						},
					}}
				/>,
			);
			await openButton();
			const sections = screen.getAllByRole("spinbutton");
			expect(sections).toHaveLength(6);
			for (const section of sections) {
				expect(section).toHaveAttribute("aria-describedby", "x");
				// the required state the picker adds is kept next to them
				expect(section).toHaveAttribute("aria-required", "true");
			}
		});

		it("[ISSUE-3485-ITEM-4] resolves a slotProps.textField.slotProps.inputLabel given as a function, and keeps the label shrunk", async () => {
			const states: unknown[] = [];
			// a plain function: a vi.fn() has props of its own that a spread would keep
			const inputLabel = (state: unknown) => {
				states.push(state);
				return { id: "at-label" };
			};
			wrap(
				<DateTimeInput
					label="At"
					value={null}
					onChange={noop}
					slotProps={{
						textField: {
							// MUI's TextField takes slot props as functions, PickersTextField's types do not
							slotProps: { inputLabel: inputLabel as object },
						},
					}}
				/>,
			);
			await openButton();
			const label = document.getElementById("at-label");
			expect(label).toHaveTextContent("At");
			expect(label).toHaveAttribute("data-shrink", "true");
			expect(states).toContainEqual(expect.objectContaining({ label: "At" }));
		});

		it("[ISSUE-3485-ITEM-13] links a helperText prop to the field group", async () => {
			wrap(
				<DateTimeInput
					label="At"
					value={null}
					onChange={noop}
					error
					helperText="Time is required"
				/>,
			);
			await openButton();
			expect(
				screen.getByRole("group", { name: "At" }),
			).toHaveAccessibleDescription("Time is required");
		});

		it("[ISSUE-3485-ITEM-13] shows helperText in place of slotProps.textField.helperText, which stays without it", async () => {
			const hint = { textField: { helperText: "Local time" } };
			const { rerender } = wrap(
				<DateTimeInput
					label="At"
					value={null}
					onChange={noop}
					error
					helperText="Time is required"
					slotProps={hint}
				/>,
			);
			await openButton();
			expect(
				screen.getByRole("group", { name: "At" }),
			).toHaveAccessibleDescription("Time is required");
			expect(screen.queryByText("Local time")).toBeNull();

			rerender(
				<DateTimeInput
					label="At"
					value={null}
					onChange={noop}
					slotProps={hint}
				/>,
			);
			expect(
				screen.getByRole("group", { name: "At" }),
			).toHaveAccessibleDescription("Local time");
		});
	});
});

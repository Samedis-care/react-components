import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme, MenuItem } from "@mui/material";
import TextFieldWithHelp from "../../src/standalone/UIKit/TextFieldWithHelp";

// jsdom has "ontouchstart" on window, so isTouchDevice() is true unless mocked;
// the flag lets one file cover both kinds of device
const env = vi.hoisted(() => ({ touch: true }));
vi.mock("../../src/utils/isTouchDevice", () => ({
	default: () => env.touch,
}));

const theme = createTheme();
const wrap = (ui: React.ReactNode) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	env.touch = true;
});

const noop = () => {};

describe("TextFieldWithHelp", () => {
	describe("which fields show the Clear button", () => {
		it("[ISSUE-3483-ITEM-1] shows none in a select without customHandleClear", async () => {
			wrap(
				<TextFieldWithHelp label="Status" select value="active" onChange={noop}>
					<MenuItem value="active">Active</MenuItem>
				</TextFieldWithHelp>,
			);
			await screen.findByRole("combobox", { name: "Status" });
			expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
		});

		it("[ISSUE-3483-ITEM-7] shows the Clear button for a defaultValue, before anything is typed", async () => {
			wrap(<TextFieldWithHelp label="About" defaultValue="abc" />);
			expect(await screen.findByRole("textbox", { name: "About" })).toHaveValue(
				"abc",
			);
			expect(screen.queryByRole("button", { name: "Clear" })).not.toBeNull();
		});

		it("[ISSUE-3483-ITEM-7] shows the Clear button for the number 0", async () => {
			wrap(
				<TextFieldWithHelp
					label="Count"
					type="number"
					value={0}
					onChange={noop}
				/>,
			);
			expect(
				await screen.findByRole("spinbutton", { name: "Count" }),
			).toHaveValue(0);
			expect(screen.queryByRole("button", { name: "Clear" })).not.toBeNull();
		});

		it("[ISSUE-3483-ITEM-7] keeps the Clear button while an owner rejects emptying the field", async () => {
			// the owner keeps its value, so the field goes on showing "abc"
			wrap(<TextFieldWithHelp label="Name" value="abc" onChange={noop} />);
			const input = await screen.findByRole("textbox", { name: "Name" });
			fireEvent.change(input, { target: { value: "" } });
			expect(input).toHaveValue("abc");
			expect(screen.queryByRole("button", { name: "Clear" })).not.toBeNull();
		});

		it("[ISSUE-3483-ITEM-7] shows no Clear button while an owner keeps the field empty", async () => {
			// e.g. a letter typed into IntegerInputField
			wrap(<TextFieldWithHelp label="Quantity" value="" onChange={noop} />);
			const input = await screen.findByRole("textbox", { name: "Quantity" });
			fireEvent.change(input, { target: { value: "a" } });
			expect(input).toHaveValue("");
			expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
		});

		it("[ISSUE-3483-ITEM-7] follows the value prop", async () => {
			const { rerender } = wrap(
				<TextFieldWithHelp label="Count" value="abc" onChange={noop} />,
			);
			await screen.findByRole("textbox", { name: "Count" });
			expect(screen.queryByRole("button", { name: "Clear" })).not.toBeNull();
			rerender(
				<ThemeProvider theme={theme}>
					<TextFieldWithHelp label="Count" value="" onChange={noop} />
				</ThemeProvider>,
			);
			expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
			rerender(
				<ThemeProvider theme={theme}>
					<TextFieldWithHelp label="Count" value={0} onChange={noop} />
				</ThemeProvider>,
			);
			expect(screen.queryByRole("button", { name: "Clear" })).not.toBeNull();
		});

		it("[ISSUE-3483-ITEM-7] shows the Clear button for a value set through slotProps.htmlInput", async () => {
			// as BaseSelector sets the text of its input
			wrap(
				<>
					<TextFieldWithHelp
						label="Country"
						onChange={noop}
						slotProps={{ htmlInput: { value: "Germany" } }}
					/>
					<TextFieldWithHelp
						label="City"
						onChange={noop}
						slotProps={{ htmlInput: () => ({ value: "Berlin" }) }}
					/>
				</>,
			);
			expect(
				await screen.findByRole("textbox", { name: "Country" }),
			).toHaveValue("Germany");
			expect(screen.getByRole("textbox", { name: "City" })).toHaveValue(
				"Berlin",
			);
			expect(screen.getAllByRole("button", { name: "Clear" })).toHaveLength(2);
		});

		it("[ISSUE-3483-ITEM-7] follows what an uncontrolled field holds", async () => {
			const onChange = vi.fn();
			wrap(
				<TextFieldWithHelp
					label="About"
					defaultValue="abc"
					onChange={onChange}
				/>,
			);
			const input = await screen.findByRole("textbox", { name: "About" });
			fireEvent.change(input, { target: { value: "" } });
			expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
			fireEvent.change(input, { target: { value: "x" } });
			fireEvent.click(screen.getByRole("button", { name: "Clear" }));
			expect(input).toHaveValue("");
			expect(onChange).toHaveBeenCalledTimes(3);
			expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
		});
	});

	describe("the default clear", () => {
		it("[ISSUE-3483-ITEM-1] raises no error when Clear is tapped in a select", async () => {
			const errors: string[] = [];
			const onError = (event: ErrorEvent) => {
				errors.push(String(event.error));
				event.preventDefault();
			};
			window.addEventListener("error", onError);
			const onChange = vi.fn();
			try {
				wrap(
					<TextFieldWithHelp
						label="Status"
						select
						value="active"
						onChange={onChange}
					>
						<MenuItem value="active">Active</MenuItem>
						<MenuItem value="retired">Retired</MenuItem>
					</TextFieldWithHelp>,
				);
				await screen.findByRole("combobox", { name: "Status" });
				// a select either has no Clear, or one that works
				const clear = screen.queryByRole("button", { name: "Clear" });
				if (clear) fireEvent.click(clear);
			} finally {
				window.removeEventListener("error", onError);
			}
			expect(errors).toEqual([]);
		});
	});

	describe("customHandleClear", () => {
		it("[ISSUE-3483-ITEM-1] clears a select through customHandleClear", async () => {
			const custom = vi.fn();
			const onChange = vi.fn();
			wrap(
				<TextFieldWithHelp
					label="Status"
					select
					value="active"
					onChange={onChange}
					customHandleClear={custom}
				>
					<MenuItem value="active">Active</MenuItem>
				</TextFieldWithHelp>,
			);
			fireEvent.click(await screen.findByRole("button", { name: "Clear" }));
			expect(custom).toHaveBeenCalledTimes(1);
			expect(onChange).not.toHaveBeenCalled();
		});

		it("[ISSUE-3483-ITEM-1] calls customHandleClear when the input ref is not set", async () => {
			// an htmlInput slot that does not pass its ref on to the <input>
			const NoRefInput = function NoRefInput(
				props: React.ComponentProps<"input">,
			) {
				return <input {...props} ref={undefined} />;
			};
			const custom = vi.fn();
			const errors: string[] = [];
			const onError = (event: ErrorEvent) => {
				errors.push(String(event.error));
				event.preventDefault();
			};
			window.addEventListener("error", onError);
			try {
				wrap(
					<TextFieldWithHelp
						label="Name"
						value="abc"
						onChange={noop}
						customHandleClear={custom}
						slots={{ htmlInput: NoRefInput }}
					/>,
				);
				await screen.findByRole("textbox", { name: "Name" });
				fireEvent.click(screen.getByRole("button", { name: "Clear" }));
			} finally {
				window.removeEventListener("error", onError);
			}
			expect(errors).toEqual([]);
			expect(custom).toHaveBeenCalledTimes(1);
		});
	});
});

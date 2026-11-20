import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { ThemeProvider, createTheme, MenuItem } from "@mui/material";
import { computeAccessibleName } from "dom-accessibility-api";
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

/** names of the buttons inside the field, in DOM order */
const buttonNames = (root: HTMLElement = document.body) =>
	within(root)
		.queryAllByRole("button")
		.map((button) => computeAccessibleName(button));

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

		it("[ISSUE-3483-ITEM-2] shows none while the field is read-only", async () => {
			const seen: string[] = [];
			wrap(
				<>
					<TextFieldWithHelp
						label="Invoice"
						value="R-1"
						onChange={(e) => seen.push(e.target.value)}
						slotProps={{ input: { readOnly: true } }}
					/>
					<TextFieldWithHelp
						label="Number"
						value="42"
						onChange={(e) => seen.push(e.target.value)}
						slotProps={{ htmlInput: { readOnly: true } }}
					/>
				</>,
			);
			await screen.findByRole("textbox", { name: "Invoice" });
			expect(buttonNames()).toEqual([]);
		});

		it("[ISSUE-3483-ITEM-2] shows none while the input is disabled through slotProps, and shows it once the input is editable", async () => {
			const Field = ({ locked }: { locked: boolean }) => (
				<ThemeProvider theme={theme}>
					<TextFieldWithHelp
						label="Total"
						value="120"
						onChange={noop}
						slotProps={{ input: { disabled: locked } }}
					/>
					<TextFieldWithHelp
						label="Net"
						value="100"
						onChange={noop}
						slotProps={{ htmlInput: () => ({ disabled: locked }) }}
					/>
				</ThemeProvider>
			);
			const { rerender } = render(<Field locked />);
			expect(
				await screen.findByRole("textbox", { name: "Total" }),
			).toBeDisabled();
			expect(screen.getByRole("textbox", { name: "Net" })).toBeDisabled();
			expect(buttonNames()).toEqual([]);
			rerender(<Field locked={false} />);
			expect(buttonNames()).toEqual(["Clear", "Clear"]);
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

describe("TextFieldWithHelp: the input's description", () => {
	it.each([
		["the field's id", "timeout"],
		["a generated id", undefined],
	] as const)(
		"[ISSUE-3484-ITEM-33] an aria-describedby in slotProps.htmlInput is added after the helper text, with %s",
		async (_, id) => {
			wrap(
				<>
					<TextFieldWithHelp
						id={id}
						label="Timeout"
						value="30"
						onChange={noop}
						helperText="Between 1 and 60"
						slotProps={{ htmlInput: { "aria-describedby": "unit" } }}
					/>
					<span id="unit">seconds</span>
				</>,
			);
			const input = await screen.findByRole("textbox", { name: "Timeout" });
			if (id) expect(input.id).toBe(id);
			expect(input).toHaveAccessibleDescription("Between 1 and 60 seconds");
		},
	);

	it("[ISSUE-3484-ITEM-33] keeps the helper text when slotProps.htmlInput is a function", async () => {
		wrap(
			<>
				<TextFieldWithHelp
					label="Timeout"
					value="30"
					onChange={noop}
					helperText="Between 1 and 60"
					slotProps={{ htmlInput: () => ({ "aria-describedby": "unit" }) }}
				/>
				<span id="unit">seconds</span>
			</>,
		);
		const input = await screen.findByRole("textbox", { name: "Timeout" });
		expect(input).toHaveAccessibleDescription("Between 1 and 60 seconds");
	});

	it("[ISSUE-3484-ITEM-33] keeps the helper text in a select's description", async () => {
		wrap(
			<>
				<TextFieldWithHelp
					label="Status"
					select
					value="active"
					onChange={noop}
					helperText="Who can see it"
					slotProps={{ htmlInput: { "aria-describedby": "note" } }}
				>
					<MenuItem value="active">Active</MenuItem>
				</TextFieldWithHelp>
				<span id="note">Changes apply tomorrow</span>
			</>,
		);
		const combobox = await screen.findByRole("combobox", { name: "Status" });
		expect(combobox).toHaveAccessibleDescription(
			"Who can see it Changes apply tomorrow",
		);
	});

	it("[ISSUE-3484-ITEM-33] names the helper text once when slotProps.htmlInput already references it", async () => {
		wrap(
			<>
				<span id="unit">seconds</span>
				<TextFieldWithHelp
					id="timeout"
					label="Timeout"
					value="30"
					onChange={noop}
					helperText="Between 1 and 60"
					slotProps={{
						htmlInput: { "aria-describedby": "unit timeout-helper-text" },
					}}
				/>
			</>,
		);
		const input = await screen.findByRole("textbox", { name: "Timeout" });
		expect(input).toHaveAttribute(
			"aria-describedby",
			"unit timeout-helper-text",
		);
	});

	it("[ISSUE-3484-ITEM-33] without helper text only the given ids describe the input, and without them only the helper text", async () => {
		wrap(
			<>
				<TextFieldWithHelp
					label="Timeout"
					value="30"
					onChange={noop}
					slotProps={{ htmlInput: { "aria-describedby": "unit" } }}
				/>
				<span id="unit">seconds</span>
				<TextFieldWithHelp
					label="Retries"
					value="3"
					onChange={noop}
					helperText="At most 5"
				/>
			</>,
		);
		expect(
			await screen.findByRole("textbox", { name: "Timeout" }),
		).toHaveAttribute("aria-describedby", "unit");
		expect(
			screen.getByRole("textbox", { name: "Retries" }),
		).toHaveAccessibleDescription("At most 5");
	});

	it.each([
		["an empty", ""],
		["an undefined", undefined],
	] as const)(
		"[ISSUE-3484-ITEM-33] %s aria-describedby in slotProps.htmlInput keeps the helper text",
		async (_, describedBy) => {
			wrap(
				<TextFieldWithHelp
					label="Retries"
					value="3"
					onChange={noop}
					helperText="At most 5"
					slotProps={{ htmlInput: { "aria-describedby": describedBy } }}
				/>,
			);
			expect(
				await screen.findByRole("textbox", { name: "Retries" }),
			).toHaveAccessibleDescription("At most 5");
		},
	);
});

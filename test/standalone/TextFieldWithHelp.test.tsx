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

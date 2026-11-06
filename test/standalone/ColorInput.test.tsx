import { afterEach, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import ColorInput from "../../src/standalone/UIKit/InputControls/ColorInput";

/**
 * ColorInput: a TextFieldWithHelp holding a color string, with react-color's
 * ChromePicker in a MUI Popover that a click on the field opens.
 */

// jsdom has "ontouchstart" on window, so isTouchDevice() is true unless mocked
const env = vi.hoisted(() => ({ touch: false }));
vi.mock("../../src/utils/isTouchDevice", () => ({
	default: () => env.touch,
}));

const theme = createTheme();
const wrap = (ui: React.ReactElement) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	env.touch = false;
});

/** Records the first error a render throws, so a crash fails an assertion */
class Boundary extends React.Component<
	{ children: React.ReactNode },
	{ error: string | null }
> {
	state = { error: null as string | null };
	static getDerivedStateFromError(error: Error) {
		return { error: String(error?.message ?? error) };
	}
	render() {
		return this.state.error ? (
			<div data-testid="crash">{this.state.error}</div>
		) : (
			this.props.children
		);
	}
}

type ColorInputProps = React.ComponentProps<typeof ColorInput>;

/** Holds the value the way a form does, so a report shows in the field */
const Host = ({
	initial = "#336699",
	onChange,
	...rest
}: { initial?: string | null } & Partial<ColorInputProps>) => {
	const [value, setValue] = useState(initial as string);
	return (
		<ColorInput
			label="Color"
			{...rest}
			value={value}
			onChange={(next) => {
				onChange?.(next);
				setValue(next);
			}}
		/>
	);
};

const picker = () => document.querySelector<HTMLElement>(".chrome-picker");

describe("ColorInput", () => {
	describe("bugs", () => {
		it("[ISSUE-3485-ITEM-1] opens the picker on a null value without crashing", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			wrap(
				<Boundary>
					<Host initial={null} />
				</Boundary>,
			);
			fireEvent.click(screen.getByRole("textbox"));
			expect(screen.queryByTestId("crash")?.textContent ?? null).toBeNull();
			expect(picker()).not.toBeNull();
		});

		it("[ISSUE-3485-ITEM-1] shows null and undefined like an empty value, in the field and in the picker", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			/** The field's text, and the picker's hex field once it is open */
			const shown = (value: string | null | undefined) => {
				const { unmount } = wrap(
					<ColorInput
						label="Color"
						value={value as string}
						onChange={vi.fn()}
					/>,
				);
				const input = screen.getByRole<HTMLInputElement>("textbox", {
					name: "Color",
				});
				const text = input.value;
				fireEvent.click(input);
				const hex = picker()?.querySelector("input")?.value;
				unmount();
				return { text, hex };
			};
			const empty = shown("");
			expect(empty.text).toBe("");
			expect(shown(null)).toEqual(empty);
			expect(shown(undefined)).toEqual(empty);
		});

		it("[ISSUE-3485-ITEM-1] keeps the field controlled on a null or undefined value", () => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			const values: (string | null | undefined)[] = [null, undefined];
			for (const value of values) {
				const onChange = vi.fn();
				const { unmount } = wrap(
					<ColorInput
						label="Color"
						value={value as string}
						onChange={onChange}
					/>,
				);
				const input = screen.getByRole("textbox", { name: "Color" });
				fireEvent.change(input, { target: { value: "#ff0000" } });
				expect(onChange.mock.calls).toEqual([["#ff0000"]]);
				// the parent did not pass the text back, so the field still shows its value
				expect(input, String(value)).toHaveValue("");
				unmount();
			}
		});
	});
});

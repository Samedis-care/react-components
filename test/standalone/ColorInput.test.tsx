import { afterEach, describe, expect, it, vi } from "vitest";
import React, { useState } from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputAdornment, ThemeProvider, createTheme } from "@mui/material";
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

		it("[ISSUE-3485-ITEM-11] opens the picker from a named button that says it opens a dialog", async () => {
			wrap(<Host />);
			const opener = screen.getByRole("button", { name: "Choose color" });
			expect(opener).toHaveAttribute("aria-haspopup", "dialog");
			expect(opener).toHaveAttribute("aria-expanded", "false");
			expect(opener).not.toHaveAttribute("aria-controls");
			act(() => opener.focus());
			fireEvent.click(opener);
			const dialog = screen.getByRole("dialog", { name: "Color" });
			expect(dialog).toHaveAttribute("aria-modal", "true");
			expect(dialog).toContainElement(picker());
			expect(opener).toHaveAttribute("aria-expanded", "true");
			expect(opener).toHaveAttribute("aria-controls", dialog.id);

			fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
			await waitFor(() => expect(picker()).toBeNull());
			expect(opener).toHaveAttribute("aria-expanded", "false");
			expect(opener).not.toHaveAttribute("aria-controls");
			expect(document.activeElement).toBe(opener);
		});

		it("[ISSUE-3485-ITEM-11] names the picker after the field's label, with a caller's id too, and after its button without a label", () => {
			const { unmount } = wrap(<Host id="primary-color" />);
			fireEvent.click(screen.getByRole("button", { name: "Choose color" }));
			expect(screen.getByRole("dialog")).toHaveAccessibleName("Color");
			unmount();

			wrap(<Host label={undefined} />);
			fireEvent.click(screen.getByRole("button", { name: "Choose color" }));
			expect(screen.getByRole("dialog")).toHaveAccessibleName("Choose color");
		});

		it("[ISSUE-3485-ITEM-11] disables the picker button with the field", () => {
			const { rerender } = wrap(
				<ColorInput
					label="Color"
					value="#336699"
					onChange={vi.fn()}
					disabled
				/>,
			);
			const opener = screen.getByRole("button", { name: "Choose color" });
			expect(opener).toBeDisabled();
			rerender(
				<ThemeProvider theme={theme}>
					<ColorInput label="Color" value="#336699" onChange={vi.fn()} />
				</ThemeProvider>,
			);
			expect(opener).toBeEnabled();
		});

		it("[ISSUE-3485-ITEM-11] keeps the caller's input slot props and end adornment beside the picker button", () => {
			wrap(
				<Host
					slotProps={{
						input: {
							className: "own-input",
							endAdornment: (
								<InputAdornment position="end">
									<span data-testid="own-end">px</span>
								</InputAdornment>
							),
						},
					}}
				/>,
			);
			const opener = screen.getByRole("button", { name: "Choose color" });
			const own = screen.getByTestId("own-end");
			expect(opener.closest(".MuiInputBase-root")).toHaveClass("own-input");
			// one adornment, the caller's content first
			expect(own.parentElement).toBe(opener.parentElement);
			expect(
				own.compareDocumentPosition(opener) & Node.DOCUMENT_POSITION_FOLLOWING,
			).toBeTruthy();
		});

		it.each(["a click into the text", "its button"] as const)(
			"[ISSUE-3485-ITEM-12] calls onBlur once focus leaves the field, after the color picked in the picker opened by %s",
			async (opening) => {
				const calls: { name: string | null; target: EventTarget }[] = [];
				const onBlur = vi.fn((event: React.FocusEvent<HTMLElement>) =>
					calls.push({
						name: event.currentTarget.getAttribute("data-name"),
						target: event.target,
					}),
				);
				const onChange = vi.fn();
				wrap(
					<>
						<Host name="primary" onBlur={onBlur} onChange={onChange} />
						<button>Next</button>
					</>,
				);
				const input = screen.getByRole("textbox", { name: "Color" });
				const opener = screen.getByRole("button", { name: "Choose color" });
				const next = screen.getByRole("button", { name: "Next" });
				const from = opening === "its button" ? opener : input;
				act(() => input.focus());
				act(() => from.focus());
				expect(onBlur).not.toHaveBeenCalled();

				fireEvent.click(from);
				const dialog = screen.getByRole("dialog", { name: "Color" });
				expect(dialog).toHaveFocus();
				const hex = picker()?.querySelector("input") as HTMLInputElement;
				act(() => hex.focus());
				fireEvent.change(hex, { target: { value: "#FF0000" } });
				fireEvent.keyDown(hex, { key: "Escape" });
				await waitFor(() => expect(picker()).toBeNull());
				expect(from).toHaveFocus();
				expect(onBlur).not.toHaveBeenCalled();

				act(() => next.focus());
				expect(onChange.mock.calls).toEqual([["#ff0000"]]);
				expect(onBlur).toHaveBeenCalledTimes(1);
				// the field's input root, named after the field; target lost focus
				expect(calls).toEqual([{ name: "primary", target: from }]);
				expect(
					onChange.mock.invocationCallOrder[0] <
						onBlur.mock.invocationCallOrder[0],
				).toBe(true);
			},
		);

		it("[ISSUE-3485-ITEM-12] calls onBlur once when focus leaves from the input, and keeps a blur handler the caller set on the input root", () => {
			const onBlur = vi.fn();
			const onRootBlur = vi.fn();
			wrap(
				<>
					<Host
						onBlur={onBlur}
						slotProps={{
							input: { slotProps: { root: { onBlur: onRootBlur } } },
						}}
					/>
					<button>Next</button>
				</>,
			);
			const input = screen.getByRole("textbox", { name: "Color" });
			act(() => input.focus());
			act(() => screen.getByRole("button", { name: "Choose color" }).focus());
			act(() => input.focus());
			act(() => screen.getByRole("button", { name: "Next" }).focus());
			expect(onBlur).toHaveBeenCalledTimes(1);
			// the caller's own handler still sees every blur of the root
			expect(onRootBlur).toHaveBeenCalledTimes(3);
		});

		it("[ISSUE-3485-ITEM-12] calls onBlur when focus moves on into the picker while it closes", async () => {
			const onBlur = vi.fn();
			wrap(<Host onBlur={onBlur} />);
			const opener = screen.getByRole("button", { name: "Choose color" });
			act(() => opener.focus());
			fireEvent.click(opener);
			const hex = picker()?.querySelector("input") as HTMLInputElement;
			fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
			expect(opener).toHaveFocus();
			// a Tab right after Escape: the closing picker is still in the page
			act(() => hex.focus());
			expect(onBlur).toHaveBeenCalledTimes(1);
			await waitFor(() => expect(picker()).toBeNull());
		});

		it.each(["label", "helper text"] as const)(
			"[ISSUE-3485-ITEM-12] keeps focus in the field when a press on its %s opens the picker",
			async (part) => {
				const user = userEvent.setup();
				const onBlur = vi.fn();
				wrap(<Host helperText="A hex code or a color name" onBlur={onBlur} />);
				const input = screen.getByRole("textbox", { name: "Color" });
				const pressed =
					part === "label"
						? screen.getByText("Color", { selector: "label" })
						: screen.getByText("A hex code or a color name");
				act(() => input.focus());
				await user.click(pressed);
				expect(screen.getByRole("dialog", { name: "Color" })).toHaveFocus();
				await user.keyboard("{Escape}");
				await waitFor(() => expect(picker()).toBeNull());
				expect(input).toHaveFocus();
				expect(onBlur).not.toHaveBeenCalled();
			},
		);
	});
});

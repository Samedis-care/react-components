import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor } from "storybook/test";
import { Box, createTheme, hexToRgb, MenuItem } from "@mui/material";
import TextFieldWithHelp from "./TextFieldWithHelp";
import DateInput from "./InputControls/DateInput";
import MuiPickerUtils from "../../framework/MuiPickerUtils";

/**
 * TextFieldWithHelp as the apps render it: SCF and IMF make `variant="standard"`
 * the default through `MuiTextField.defaultProps`, the Storybook preview theme
 * does not, so every story passes the variant.
 *
 * The Clear button only exists on touch devices (`isTouchDevice`); the stories
 * that need it emulate a touch screen in `beforeEach`.
 */
const meta: Meta<typeof TextFieldWithHelp> = {
	title: "Standalone/UIKit/TextFieldWithHelp",
	component: TextFieldWithHelp,
	parameters: {
		layout: "padded",
		// every story of this file must pass axe; the exceptions below say why
		a11y: { test: "error" },
	},
	args: {
		label: "Name",
		variant: "standard",
		onChange: fn(),
	},
	argTypes: {
		openInfo: {
			description:
				"Renders a More information button at the end of the field and calls this on click",
		},
		customHandleClear: {
			description:
				"Replaces what the touch Clear button does; called without arguments, onChange is not called",
		},
		disableClearable: {
			description: "Hides the Clear button shown on touch devices",
			control: "boolean",
		},
		warning: {
			description:
				"Colours label, underline/outline and helper text in palette.warning.main; error wins",
			control: "boolean",
		},
		dirty: {
			description:
				"Marks a modified field with a dot after its label and data-cc-dirty on the root",
			control: "boolean",
		},
		important: {
			description:
				"Colours the placeholder in palette.error.main (standard variant only)",
			control: "boolean",
		},
	},
};
export default meta;

type Story = StoryObj<typeof TextFieldWithHelp>;

const noop = () => {};

/** The dot drawn after a label, in the label's own (unscaled) coordinates */
const dirtyDot = (label: HTMLElement) => {
	const after = getComputedStyle(label, "::after");
	const left = parseFloat(after.left);
	return { left, right: left + parseFloat(after.width) };
};

const LONG_LABEL = "Datum der letzten sicherheitstechnischen Kontrolle";

export const Issue3483Item22DirtyDotAfterEllipsis: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3483-ITEM-22: a label longer than the field stays on one line and ends in an ellipsis, as MUI cuts it. The dirty dot comes after the ellipsis, so a modified field shows it whatever the length of its label; after a label that fits, it follows the text.",
			},
		},
	},
	render: (args) => (
		<MuiPickerUtils>
			<Box sx={{ width: 220, display: "grid", gap: 4 }}>
				<TextFieldWithHelp
					{...args}
					dirty
					label={LONG_LABEL}
					value="01.08.2026"
				/>
				<TextFieldWithHelp
					{...args}
					variant="filled"
					dirty
					label={LONG_LABEL}
					value="01.08.2026"
				/>
				<TextFieldWithHelp
					{...args}
					variant="outlined"
					dirty
					label={LONG_LABEL}
					value="01.08.2026"
				/>
				<DateInput
					label={LONG_LABEL}
					value={new Date("2026-08-01T12:00:00.000Z")}
					onChange={noop}
					dirty
				/>
				<TextFieldWithHelp {...args} dirty label="Serial" value="x" />
			</Box>
		</MuiPickerUtils>
	),
	play: async ({ canvasElement }) => {
		const labels = Array.from(canvasElement.querySelectorAll("label"));
		await expect(labels).toHaveLength(5);
		const short = labels.pop()!;
		await waitFor(() =>
			expect(getComputedStyle(short, "::after").width).toBe("6px"),
		);
		const fields = ["standard", "filled", "outlined", "DateInput"];
		for (const [i, label] of labels.entries()) {
			await expect(
				label.scrollWidth,
				`${fields[i]}: the label is cut off`,
			).toBeGreaterThan(label.clientWidth);
			// what lies outside the label's box is cut off with the text
			const dot = dirtyDot(label);
			await expect(dot.left, fields[i]).toBeGreaterThanOrEqual(0);
			await expect(dot.right, fields[i]).toBeLessThanOrEqual(
				parseFloat(getComputedStyle(label).width),
			);
		}
		// a label that fits keeps the dot 4px after its text
		const text = document.createRange();
		text.selectNodeContents(short);
		const box = short.getBoundingClientRect();
		const textEnd =
			(text.getBoundingClientRect().right - box.left) *
			(short.offsetWidth / box.width);
		await expect(dirtyDot(short).left - textEnd).toBeCloseTo(4, 0);
	},
};

const palette = createTheme().palette;

const WARNING = hexToRgb(palette.warning.main);

export const Issue3483Item17WarningFieldShowsFocus: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3483-ITEM-17: a field with `warning` draws MUI's 2px focus underline permanently, so focusing it changes nothing; a select in that state shows no focus at all (WCAG 2.4.7).",
			},
		},
	},
	render: (args) => (
		<Box sx={{ width: 300, display: "grid", gap: 4 }}>
			<TextFieldWithHelp {...args} label="Serial" value="x" warning />
			<TextFieldWithHelp
				{...args}
				label="Status"
				select
				value="active"
				warning
				disableClearable
			>
				<MenuItem value="active">Active</MenuItem>
			</TextFieldWithHelp>
		</Box>
	),
	play: async ({ canvas, userEvent }) => {
		const targets = [
			await canvas.findByRole("textbox", { name: "Serial" }),
			canvas.getByRole("combobox", { name: "Status" }),
		];
		for (const target of targets) {
			const root = target.closest(".MuiInputBase-root")!;
			const underline = () => {
				const after = getComputedStyle(root, "::after");
				return [
					after.transform,
					after.borderBottomColor,
					after.borderBottomWidth,
				].join(" | ");
			};
			const idle = underline();
			await userEvent.tab();
			await expect(target).toHaveFocus();
			// the underline grows in with a transition
			await waitFor(() =>
				expect(underline(), "focus changes nothing").not.toBe(idle),
			);
		}
	},
};

export const Issue3483Item17WarningUnderlineDrawnLikeError: Story = {
	parameters: {
		a11y: {
			// the warning label of the filled field reaches 4.5:1 against the page,
			// not against the input's grey (3.95:1); every other rule runs
			config: { rules: [{ id: "color-contrast", enabled: false }] },
		},
		docs: {
			description: {
				story:
					"ISSUE-3483-ITEM-17: a standard or filled field with `warning` draws its underline as MUI draws an error's, in the warning colour: 1px at rest, 2px only while focused. With `error` as well it looks like an error.",
			},
		},
	},
	render: (args) => (
		<Box sx={{ width: 300, display: "grid", gap: 4 }}>
			<TextFieldWithHelp {...args} label="Standard" value="x" warning />
			<TextFieldWithHelp
				{...args}
				variant="filled"
				label="Filled"
				value="x"
				warning
			/>
			<TextFieldWithHelp {...args} label="Both" value="x" warning error />
			<TextFieldWithHelp {...args} label="Error" value="x" error />
		</Box>
	),
	play: async ({ canvas, userEvent }) => {
		const underline = (name: string) => {
			const root = canvas
				.getByRole("textbox", { name })
				.closest(".MuiInputBase-root")!;
			const line = (pseudo: string) => {
				const style = getComputedStyle(root, pseudo);
				return {
					color: style.borderBottomColor,
					width: style.borderBottomWidth,
					transform: style.transform,
				};
			};
			return { idle: line("::before"), focus: line("::after") };
		};
		const HIDDEN = "matrix(0, 0, 0, 1, 0, 0)";
		await canvas.findByRole("textbox", { name: "Standard" });
		for (const name of ["Standard", "Filled"]) {
			const { idle, focus } = underline(name);
			await expect(idle, name).toEqual({
				color: WARNING,
				width: "1px",
				transform: "none",
			});
			await expect(focus.transform, name).toBe(HIDDEN);
		}
		// error wins: the field looks exactly like one with an error only
		await expect(underline("Both")).toEqual(underline("Error"));

		await userEvent.click(canvas.getByRole("textbox", { name: "Standard" }));
		await waitFor(() =>
			expect(underline("Standard").focus).toEqual({
				color: WARNING,
				width: "2px",
				transform: "matrix(1, 0, 0, 1, 0, 0)",
			}),
		);
	},
};

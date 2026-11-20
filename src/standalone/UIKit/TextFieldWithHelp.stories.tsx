import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor, within } from "storybook/test";
import {
	Box,
	Button,
	createTheme,
	hexToRgb,
	InputAdornment,
	MenuItem,
	TextField,
} from "@mui/material";
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
	},
};
export default meta;

type Story = StoryObj<typeof TextFieldWithHelp>;

/** headless Chromium has no touch screen; isTouchDevice() reads maxTouchPoints */
const emulateTouch = () => {
	Object.defineProperty(navigator, "maxTouchPoints", {
		configurable: true,
		get: () => 5,
	});
	return () => {
		delete (navigator as unknown as Record<string, unknown>).maxTouchPoints;
	};
};

const noop = () => {};

/** A text field whose value the story owns, so Clear can empty it */
const ControlledField = function ControlledField(props: {
	label: string;
	initial?: string;
	openInfo?: () => void;
	customClear?: boolean;
	adornment?: boolean;
}) {
	const { label, initial = "abc", openInfo, customClear, adornment } = props;
	const [value, setValue] = useState(initial);
	return (
		<TextFieldWithHelp
			variant="standard"
			label={label}
			value={value}
			onChange={(e) => setValue(e.target.value)}
			openInfo={openInfo}
			customHandleClear={customClear ? () => setValue("") : undefined}
			slotProps={
				adornment
					? {
							input: {
								endAdornment: (
									<InputAdornment position="end">
										<Button size="small">Unit</Button>
									</InputAdornment>
								),
							},
						}
					: undefined
			}
		/>
	);
};

/** A DateInput whose value the story owns */
const ControlledDate = function ControlledDate() {
	const [value, setValue] = useState<Date | null>(
		new Date("2026-08-01T12:00:00.000Z"),
	);
	return <DateInput label="Day" value={value} onChange={setValue} />;
};

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
		// a label that fits keeps the dot 4px after its text: the label's own text, not
		// the visually hidden text after it that says the field is modified
		const text = document.createRange();
		text.selectNodeContents(short.firstChild!);
		const box = short.getBoundingClientRect();
		const textEnd =
			(text.getBoundingClientRect().right - box.left) *
			(short.offsetWidth / box.width);
		await expect(dirtyDot(short).left - textEnd).toBeCloseTo(4, 0);
	},
};

/** The visually hidden text in a label that says the field is modified */
const dirtyText = (label: HTMLElement) =>
	Array.from(label.children).find(
		(child) => getComputedStyle(child).position === "absolute",
	)!;

export const Issue3474Item26DirtyStateInTheName: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'ISSUE-3474-ITEM-26: a modified field says so in its name, not only with the dot: its label ends in a visually hidden "(modified)", so a screen reader reads "Serial (modified)". The text takes no room: the label, the dot and the gap in an outlined field\'s border look as they did.',
			},
		},
	},
	render: (args) => (
		<Box sx={{ width: 220, display: "grid", gap: 4 }}>
			<TextFieldWithHelp {...args} dirty label="Serial" value="x" />
			<TextFieldWithHelp
				{...args}
				variant="outlined"
				dirty
				label="Serial"
				value="x"
			/>
			<TextFieldWithHelp
				{...args}
				variant="outlined"
				label="Serial"
				value="x"
			/>
			<Box dir="rtl">
				<TextFieldWithHelp {...args} dirty label="Serial" value="x" />
			</Box>
		</Box>
	),
	play: async ({ canvas, canvasElement }) => {
		await expect(
			canvas.getAllByRole("textbox", { name: "Serial (modified)" }),
		).toHaveLength(3);
		await expect(
			canvas.getByRole("textbox", { name: "Serial" }),
		).toBeInTheDocument();

		const labels = Array.from(canvasElement.querySelectorAll("label")).filter(
			(label) => label.closest("[data-cc-dirty='true']"),
		);
		await expect(labels).toHaveLength(3);
		for (const label of labels) {
			// within the label's own text, in either direction, so it neither widens the
			// label nor sticks out of it
			const own = document.createRange();
			own.selectNodeContents(label.firstChild!);
			const textBox = own.getBoundingClientRect();
			const box = dirtyText(label).getBoundingClientRect();
			await expect(box.left).toBeGreaterThanOrEqual(textBox.left - 0.5);
			await expect(box.right).toBeLessThanOrEqual(textBox.right + 0.5);
		}

		// the border's gap holds a copy of the label: it makes room for the dot only
		const notches = Array.from(
			canvasElement.querySelectorAll(".MuiOutlinedInput-notchedOutline legend"),
		).map((legend) => legend.getBoundingClientRect().width);
		await expect(notches).toHaveLength(2);
		await expect(notches[0] - notches[1]).toBeCloseTo(10, 0);
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

/** What the browser draws for an input's placeholder */
const placeholderLook = (input: HTMLElement) => {
	const style = getComputedStyle(input, "::placeholder");
	return { color: style.color, opacity: style.opacity };
};

export const Issue3482Item13RequiredSaidInText: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-13: a field that must be filled says so with MUI's `required`: an asterisk after its label and the required state of its input. Its placeholder looks like the placeholder of MUI's own field; no prop paints it red.",
			},
		},
	},
	render: (args) => (
		<Box sx={{ width: 300, display: "grid", gap: 4 }}>
			<TextFieldWithHelp
				{...args}
				// @ts-expect-error important is no longer a prop: its pale red placeholder was the only sign
				important
				required
				label="Name"
				placeholder="Enter a name"
			/>
			<TextField
				variant="standard"
				label="MUI"
				placeholder="Enter a name"
				slotProps={{ inputLabel: { shrink: true } }}
			/>
		</Box>
	),
	play: async ({ canvas }) => {
		const field = await canvas.findByRole<HTMLInputElement>("textbox", {
			name: "Name",
		});
		await expect(field).toBeRequired();
		await expect(field.labels?.[0]).toHaveTextContent(/^Name\s*\*$/);
		await expect(placeholderLook(field)).toEqual(
			placeholderLook(canvas.getByRole("textbox", { name: "MUI" })),
		);
	},
};

export const Issue3483Item15ClearKeepsFocusInField: Story = {
	beforeEach: emulateTouch,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3483-ITEM-15: Clear in a date field (and any customHandleClear) unmounts the focused button and leaves keyboard focus on the page body; the default clear of a text field moves it to the input (WCAG 2.4.3).",
			},
		},
	},
	render: () => (
		<MuiPickerUtils>
			<Box sx={{ width: 360, display: "grid", gap: 4 }}>
				<ControlledDate />
				<ControlledField label="Custom" customClear />
			</Box>
		</MuiPickerUtils>
	),
	play: async ({ canvas, userEvent }) => {
		const field = await canvas.findByRole("group", { name: "Day" });
		const root = field.closest<HTMLElement>(".MuiFormControl-root")!;
		within(root).getByRole("button", { name: "Clear" }).focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(within(root).queryByRole("button", { name: "Clear" })).toBeNull(),
		);
		await expect(
			root.contains(document.activeElement),
			"focus left the date field",
		).toBe(true);

		const custom = canvas.getByRole("textbox", { name: "Custom" });
		const customClear = within(
			custom.closest<HTMLElement>(".MuiFormControl-root")!,
		).getByRole("button", { name: "Clear" });
		customClear.focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(custom).toHaveValue(""));
		await expect(custom).toHaveFocus();
	},
};

/** A select whose value the story owns, cleared through customHandleClear */
const ControlledSelect = function ControlledSelect() {
	const [value, setValue] = useState("active");
	return (
		<TextFieldWithHelp
			variant="standard"
			label="Status"
			select
			value={value}
			onChange={(e) => setValue(e.target.value)}
			customHandleClear={() => setValue("")}
		>
			<MenuItem value="active">Active</MenuItem>
		</TextFieldWithHelp>
	);
};

export const Issue3483Item15ClearKeepsFocusInSelect: Story = {
	beforeEach: emulateTouch,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3483-ITEM-15: Clear in a select (which only has one with customHandleClear) moves keyboard focus to the select, since the button goes away with the value.",
			},
		},
	},
	render: () => <ControlledSelect />,
	play: async ({ canvas, userEvent }) => {
		const select = await canvas.findByRole("combobox", { name: "Status" });
		canvas.getByRole("button", { name: "Clear" }).focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(canvas.queryByRole("button", { name: "Clear" })).toBeNull(),
		);
		await expect(select).toHaveFocus();
	},
};

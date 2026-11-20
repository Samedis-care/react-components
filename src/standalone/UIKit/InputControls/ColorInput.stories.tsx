import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, screen, waitFor } from "storybook/test";
import ColorInput from "./ColorInput";

type Props = React.ComponentProps<typeof ColorInput>;

/** Holds the value the way a form does, so a report shows in the field */
const StatefulColorInput = function StatefulColorInput(props: Props) {
	const { value: initial, onChange, ...other } = props;
	const [value, setValue] = useState(initial);
	return (
		<ColorInput
			{...other}
			value={value}
			onChange={(next) => {
				onChange?.(next);
				setValue(next);
			}}
		/>
	);
};

/**
 * A color as a text field, with react-color's ChromePicker in a popover that
 * the "Choose color" button at the end of the field opens, from the keyboard
 * too, and so does a click anywhere in the field (not while `disabled`). The
 * open picker is a dialog named after the field; it takes focus, and shows a
 * focus ring when the keyboard opened it. Typed text is
 * reported as typed, on every keystroke; the picker reports lowercase
 * `#rrggbb`. Nothing is validated. A blur is reported once focus leaves the
 * field, the open picker counting as part of it. The stories hold the value in
 * state, as a form would; `value` in the controls sets the starting color.
 *
 * Apps render TextFieldWithHelp with `variant="standard"` (theme default in SCF
 * and IMF); the stories pass it.
 */
const meta: Meta<typeof ColorInput> = {
	title: "Standalone/UIKit/InputControls/ColorInput",
	component: ColorInput,
	parameters: {
		layout: "padded",
		// every story of this file must pass axe
		a11y: { test: "error" },
	},
	args: {
		label: "Color",
		value: "#336699",
		variant: "standard",
		onChange: fn(),
		onBlur: fn(),
	},
	argTypes: {
		value: {
			description:
				'The color text the field shows: "" for none, never null. Not validated',
			control: "text",
		},
		onChange: {
			description:
				'(color) per keystroke with the text as typed, per picker change with lowercase "#rrggbb", "" from the touch Clear',
		},
		onBlur: {
			description:
				"Called once focus leaves the field (the input, its buttons and the open picker), with a blur event of the field's input root",
		},
		disabled: {
			description: "Disables the field; the picker does not open and closes",
			control: "boolean",
		},
		openInfo: {
			description:
				'Renders a "More information" button and calls this on click; the click also opens the picker',
		},
	},
	render: (args) => <StatefulColorInput key={args.value} {...args} />,
};
export default meta;

type Story = StoryObj<typeof ColorInput>;

export const Issue3485Item11PickerOpensFromTheKeyboard: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3485-ITEM-11: only a click opens the picker. Expected: a control in the field that says it opens a popup (aria-haspopup, aria-expanded), opens it from the keyboard, and a popup that is a dialog named after the field.",
			},
		},
		a11y: {
			// the open picker's labels fail text contrast (ISSUE-3485-ITEM-16); every other rule runs
			config: { rules: [{ id: "color-contrast", enabled: false }] },
		},
	},
	play: async ({ canvasElement, userEvent }) => {
		const opener = canvasElement.querySelector<HTMLElement>("[aria-haspopup]");
		await expect(opener, "a control that announces the picker").not.toBeNull();
		await expect(opener).toHaveAttribute("aria-expanded", "false");
		opener?.focus();
		await userEvent.keyboard(
			opener?.tagName === "INPUT" ? "{Alt>}{ArrowDown}{/Alt}" : "{Enter}",
		);
		await screen.findByRole("dialog", { name: "Color" });
		await expect(opener).toHaveAttribute("aria-expanded", "true");
	},
};

export const Issue3485Item12BlurAfterThePick: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3485-ITEM-12: the picker took focus when it opened, so onBlur fired before a color was picked, and the open picker showed no focus. Expected: onBlur fires once focus leaves the field and its picker, after the pick; the picker shows a focus ring when the keyboard opened it, and none when a click did.",
			},
		},
	},
	play: async ({ args, canvas, canvasElement, userEvent }) => {
		const input = canvas.getByRole("textbox", { name: "Color" });
		const opener = canvas.getByRole("button", { name: "Choose color" });

		// a click into the text opens the picker, which takes focus without a ring
		await userEvent.click(input);
		let dialog = await screen.findByRole("dialog", { name: "Color" });
		await waitFor(() => expect(dialog).toHaveFocus());
		await expect(
			getComputedStyle(dialog).outlineStyle,
			"no ring after a click",
		).toBe("none");
		const hex = dialog.querySelector("input") as HTMLInputElement;
		await userEvent.clear(hex);
		await userEvent.type(hex, "#ff0000");
		await expect(args.onChange).toHaveBeenLastCalledWith("#ff0000");
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(input).toHaveFocus());
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

		// on to the picker button, which opens the picker from the keyboard
		await userEvent.tab();
		await expect(opener).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		dialog = await screen.findByRole("dialog", { name: "Color" });
		await waitFor(() => expect(dialog).toHaveFocus());
		await expect(
			getComputedStyle(dialog).outlineStyle,
			"the ring after the keyboard opened it",
		).toBe("solid");
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(opener).toHaveFocus());
		await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
		await expect(args.onBlur).not.toHaveBeenCalled();

		// out of the field, with a click beside it (Tab would wrap to its input)
		await userEvent.click(canvasElement);
		await expect(opener).not.toHaveFocus();
		await expect(args.onBlur).toHaveBeenCalledTimes(1);
	},
};

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, screen } from "storybook/test";
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
 * open picker is a dialog named after the field. Typed text is
 * reported as typed, on every keystroke; the picker reports lowercase
 * `#rrggbb`. Nothing is validated. The stories hold the value in state, as a
 * form would; `value` in the controls sets the starting color.
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
				"Called when focus leaves the input, which a click into the field also does: the picker takes focus",
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

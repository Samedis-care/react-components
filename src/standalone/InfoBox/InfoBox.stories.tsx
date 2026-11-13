import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Stack } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor } from "storybook/test";
import InfoBox from "./index";

const meta: Meta<typeof InfoBox> = {
	title: "Standalone/InfoBox",
	component: InfoBox,
	parameters: { layout: "centered" },
	args: {
		heading: "InfoBox heading",
		message: "This is the detail message shown when expanded.",
		defaultExpanded: false,
	},
	argTypes: {
		// the Controlled story keeps it in its state; setting it on a box
		// without it switches the box to controlled, which MUI reports as an
		// error
		expanded: { control: false },
		status: {
			control: "select",
			options: ["info", "warning", "success", "error"],
		},
		headingVariant: {
			control: "select",
			options: ["caption", "body1", "body2", "subtitle1", "subtitle2", "h6"],
		},
	},
};
export default meta;

type Story = StoryObj<typeof InfoBox>;

export const Info: Story = {
	args: {
		status: "info",
		heading: "Did you know?",
		message: "This panel shows general informational content.",
		defaultExpanded: true,
	},
};

export const Warning: Story = {
	args: {
		status: "warning",
		heading: "Please review",
		message: "Some values may be incorrect. Double-check before saving.",
		defaultExpanded: true,
	},
};

export const Success: Story = {
	args: {
		status: "success",
		heading: "Operation complete",
		message: "Your data has been saved successfully.",
		defaultExpanded: true,
	},
};

export const Error: Story = {
	args: {
		status: "error",
		heading: "An error occurred",
		message: "Could not connect to the server. Please try again later.",
		defaultExpanded: true,
	},
};

export const Collapsed: Story = {
	args: {
		status: "info",
		heading: "Click to expand",
		message: "This message is only visible when expanded.",
		defaultExpanded: false,
	},
	play: async ({ canvas, userEvent }) => {
		// Message should not be visible when collapsed
		const heading = canvas.getByText("Click to expand");
		await expect(
			canvas.queryByText("This message is only visible when expanded."),
		).not.toBeVisible();
		// Click heading to expand
		await userEvent.click(heading);
		await expect(
			canvas.getByText("This message is only visible when expanded."),
		).toBeVisible();
	},
};

export const AlwaysExpanded: Story = {
	args: {
		status: "success",
		heading: "Always visible",
		message: "This panel cannot be collapsed by the user.",
		defaultExpanded: true,
		alwaysExpanded: true,
	},
};

export const CustomHeadingVariant: Story = {
	args: {
		status: "info",
		heading: "Large heading",
		message: "Heading uses h6 typography variant.",
		defaultExpanded: true,
		headingVariant: "h6",
	},
};

/**
 * `expanded` controls the box; the story keeps the state. A click on the
 * header calls `onChange` with the requested state, which the story passes
 * back into `expanded`. The buttons below set `expanded` from outside, which
 * does not call `onChange`.
 */
export const Controlled: Story = {
	args: {
		status: "info",
		heading: "Opened and closed from outside",
		message: "This box shows what its expanded prop says.",
		onChange: fn(),
	},
	parameters: { a11y: { test: "error" } },
	render: function ControlledInfoBox(args) {
		const { onChange } = args;
		const [expanded, setExpanded] = useState(false);
		const handleChange = useCallback(
			(event: React.SyntheticEvent, next: boolean) => {
				onChange?.(event, next);
				setExpanded(next);
			},
			[onChange],
		);
		const open = useCallback(() => setExpanded(true), []);
		const close = useCallback(() => setExpanded(false), []);
		return (
			<Stack spacing={1}>
				<InfoBox {...args} expanded={expanded} onChange={handleChange} />
				<Stack direction="row" spacing={1}>
					<Button variant="outlined" onClick={open}>
						Open
					</Button>
					<Button variant="outlined" onClick={close}>
						Close
					</Button>
				</Stack>
			</Stack>
		);
	},
	play: async ({ args, canvas, userEvent }) => {
		const header = canvas.getByRole("button", {
			name: "Opened and closed from outside",
		});
		const message = canvas.getByText(
			"This box shows what its expanded prop says.",
		);
		await expect(header).toHaveAttribute("aria-expanded", "false");
		await expect(message).not.toBeVisible();
		await userEvent.click(header);
		await expect(args.onChange).toHaveBeenLastCalledWith(
			expect.anything(),
			true,
		);
		await expect(header).toHaveAttribute("aria-expanded", "true");
		await waitFor(() => expect(message).toBeVisible());
		await userEvent.click(canvas.getByRole("button", { name: "Close" }));
		await expect(header).toHaveAttribute("aria-expanded", "false");
		await waitFor(() => expect(message).not.toBeVisible());
		await userEvent.click(canvas.getByRole("button", { name: "Open" }));
		await expect(header).toHaveAttribute("aria-expanded", "true");
		await waitFor(() => expect(message).toBeVisible());
		await expect(args.onChange).toHaveBeenCalledTimes(1);
	},
};

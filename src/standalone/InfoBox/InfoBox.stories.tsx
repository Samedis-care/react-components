import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, createTheme, Stack, ThemeProvider } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor } from "storybook/test";
import InfoBox, { InfoBoxProps } from "./index";

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

const WHITE = "rgb(255, 255, 255)";

/** waits until no CSS transition runs in or below el (the header's colors, the Collapse) */
const transitionsDone = (el: Element) =>
	waitFor(() =>
		expect(
			el
				.getAnimations({ subtree: true })
				.map((a) => (a instanceof CSSTransition ? a.transitionProperty : a.id)),
		).toEqual([]),
	);

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

export const Issue3464Item6FocusKeepsStatusColorAndShowsRing: Story = {
	parameters: {
		a11y: {
			test: "error",
			options: { runOnly: { type: "rule", values: ["color-contrast"] } },
		},
		docs: {
			description: {
				story:
					"ISSUE-3464-ITEM-6: keyboard focus replaces the red header with light grey (white text at 1.3:1, axe `color-contrast`), and there is no focus outline. Expected: the focused header keeps its status color and shows a ring inside its edges.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div style={{ width: 600 }}>
				<Story />
			</div>
		),
	],
	args: {
		status: "error",
		heading: "Upload failed",
		message: "The file is too large.",
		defaultExpanded: false,
	},
	play: async ({ canvas, userEvent }) => {
		const btn = canvas.getByRole("button", { name: /Upload failed/ });
		await userEvent.tab();
		await expect(btn).toHaveFocus();
		await expect(btn).toHaveClass("Mui-focusVisible");
		await transitionsDone(btn);
		const cs = getComputedStyle(btn);
		await expect(cs.backgroundColor).toBe("rgb(211, 47, 47)");
		await expect(cs.color).toBe(WHITE);
		// a ring inside the header: the root's overflow: hidden clips one outside it
		const insetRing =
			(cs.outlineStyle !== "none" && parseFloat(cs.outlineOffset) < 0) ||
			cs.boxShadow.includes("inset");
		await expect(insetRing).toBe(true);
	},
};

export const Issue3464Item7HeaderStatusIsVisuallyHidden: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3464-ITEM-7: the header and the heading read the status before the heading text, and the prefix is visually hidden, so it takes no room in the header.",
			},
		},
	},
	args: {
		status: "error",
		heading: "Upload finished",
		message: "The file is too large.",
		defaultExpanded: false,
	},
	play: async ({ canvas }) => {
		const header = canvas.getByRole("button", {
			name: "Error: Upload finished",
		});
		await expect(header).toHaveAccessibleName("Error: Upload finished");
		await expect(
			canvas.getByRole("heading", { name: "Error: Upload finished" }),
		).toBeInTheDocument();
		// the prefix is in the DOM but clipped to 1x1, as MUI's visuallyHidden
		const prefix = canvas.getByText("Error:");
		const cs = getComputedStyle(prefix);
		await expect([cs.clipPath, cs.width, cs.height, cs.position]).toEqual([
			"inset(50%)",
			"1px",
			"1px",
			"absolute",
		]);
	},
};

const STATUSES: InfoBoxProps["status"][] = [
	undefined,
	"info",
	"warning",
	"success",
	"error",
];

const darkTheme = createTheme({ palette: { mode: "dark" } });

const ringTheme = createTheme({ focusVisible: true });

const FocusColumn = ({ label }: { label: string }) => (
	<div style={{ width: 300 }}>
		{STATUSES.map((status, index) => (
			<InfoBox
				key={String(status)}
				status={status}
				heading={`${label} ${String(status)}`}
				message={"Message"}
				defaultExpanded={index % 2 === 1}
			/>
		))}
	</div>
);

export const Issue3464Item6FocusRingInEveryStatusAndTheme: Story = {
	parameters: {
		a11y: {
			test: "error",
			config: {
				rules: [
					// white on MUI's default warning orange (light) and error red (dark)
					// is below 4.5:1 whether focused or not; the focused header's
					// contrast is checked by Issue3464Item6FocusKeepsStatusColorAndShowsRing
					{ id: "color-contrast", enabled: false },
					// each open message is an unnamed region, so several open boxes
					// repeat it; this story is about the headers
					{ id: "landmark-unique", enabled: false },
				],
			},
		},
		docs: {
			description: {
				story:
					"ISSUE-3464-ITEM-6: every status, open and collapsed, in light mode, in dark mode and with MUI's `focusVisible` theme option. A keyboard-focused header keeps its colors and shows a 2px ring in its text color inside its edges, where the box cannot clip it.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 16 }}>
			<FocusColumn label={"Light"} />
			<ThemeProvider theme={darkTheme}>
				<div
					style={{
						color: darkTheme.palette.text.primary,
						background: darkTheme.palette.background.default,
					}}
				>
					<FocusColumn label={"Dark"} />
				</div>
			</ThemeProvider>
			<ThemeProvider theme={ringTheme}>
				<FocusColumn label={"Theme ring"} />
			</ThemeProvider>
		</div>
	),
	play: async ({ canvas, userEvent }) => {
		const headers = canvas.getAllByRole("button");
		await expect(headers).toHaveLength(3 * STATUSES.length);
		for (const btn of headers) {
			const before = getComputedStyle(btn);
			const background = before.backgroundColor;
			const color = before.color;
			await expect(before.outlineStyle).toBe("none");
			await userEvent.tab();
			await expect(btn).toHaveFocus();
			await expect(btn).toHaveClass("Mui-focusVisible");
			await transitionsDone(btn);
			const cs = getComputedStyle(btn);
			await expect([cs.backgroundColor, cs.color]).toEqual([background, color]);
			// a ring in the text color, which contrasts with the header like the
			// heading does; forced colors keep outlines
			await expect([cs.outlineStyle, cs.outlineWidth, cs.outlineColor]).toEqual(
				["solid", "2px", color],
			);
			// inside the header: the box's overflow: hidden clips a ring outside it
			await expect(
				parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth),
			).toBeLessThanOrEqual(0);
		}
	},
};

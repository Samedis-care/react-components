import React, { useCallback, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button, createTheme, Stack, ThemeProvider } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, waitFor } from "storybook/test";
import InfoBox, { InfoBoxProps } from "./index";
import {
	edgesPast,
	pageScrollsSideways,
} from "../../stories/test-utils/hiddenTextLayout";

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
		// a React node; the control edits it as text
		heading: { control: "text" },
		status: {
			control: "select",
			options: ["info", "warning", "success", "error"],
		},
		headingVariant: {
			control: "select",
			options: [
				"caption",
				"body1",
				"body2",
				"subtitle1",
				"subtitle2",
				"h6",
				"inherit",
			],
		},
	},
};
export default meta;

type Story = StoryObj<typeof InfoBox>;

const WHITE = "rgb(255, 255, 255)";

const elementOf = (el: Element | null): HTMLElement => {
	if (!(el instanceof HTMLElement)) throw new Error("element missing");
	return el;
};

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

export const ErrorStatus: Story = {
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

const BetweenSiblingsDemo = ({ expanded }: { expanded: boolean }) => (
	<div style={{ width: 600 }}>
		<div>Above</div>
		<InfoBox
			heading={"Heading"}
			message={"Message"}
			defaultExpanded={expanded}
		/>
		<div>Below</div>
	</div>
);

export const Issue3464Item3HeaderAndMarginsStayWhenExpanded: StoryObj<
	typeof BetweenSiblingsDemo
> = {
	render: () => <BetweenSiblingsDemo expanded={false} />,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3464-ITEM-3: opening the box grows the 48px header to 60px and gives the box 16px margins above and below, so it and the content below it jump.",
			},
		},
	},
	play: async ({ canvasElement, canvas }) => {
		const btn = canvas.getByRole("button", { name: /Heading/ });
		const root = elementOf(canvasElement.querySelector(".MuiAccordion-root"));
		const margins = () => {
			const cs = getComputedStyle(root);
			return [cs.marginTop, cs.marginBottom];
		};
		await expect(btn.getBoundingClientRect().height).toBe(48);
		await expect(margins()).toEqual(["0px", "0px"]);
		// a click without moving focus, so no focus styling is involved
		btn.click();
		await waitFor(() =>
			expect(canvasElement.querySelector(".MuiCollapse-root")).toHaveClass(
				"MuiCollapse-entered",
			),
		);
		await transitionsDone(root);
		await expect(btn.getBoundingClientRect().height).toBe(48);
		await expect(margins()).toEqual(["0px", "0px"]);
	},
};

export const Issue3464Item3CornersRoundedBetweenSiblings: StoryObj<
	typeof BetweenSiblingsDemo
> = {
	render: () => <BetweenSiblingsDemo expanded />,
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3464-ITEM-3: the root of a box between two other `div`s has no rounded corners, so its colored header has square top corners. MUI rounds the top of only the first `div` among siblings and the bottom of only the last.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const cs = getComputedStyle(
			elementOf(canvasElement.querySelector(".MuiAccordion-root")),
		);
		await expect([
			cs.borderTopLeftRadius,
			cs.borderTopRightRadius,
			cs.borderBottomRightRadius,
			cs.borderBottomLeftRadius,
		]).toEqual(["4px", "4px", "4px", "4px"]);
	},
};

export const Issue3464Item3StackedBoxesRoundedWithoutMargins: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3464-ITEM-3: three InfoBoxes stacked directly, the middle one open. MUI styles accordions as a group: it rounds only the top of the first and the bottom of the last, and gives an open one a 16px margin. Every InfoBox is rounded on all four corners and has no margin of its own.",
			},
		},
	},
	render: () => (
		<div style={{ width: 600 }}>
			<InfoBox heading={"First"} message={"Message"} />
			<InfoBox heading={"Second"} message={"Message"} defaultExpanded />
			<InfoBox heading={"Third"} message={"Message"} />
		</div>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll(".MuiAccordion-root");
		await expect(roots).toHaveLength(3);
		for (const root of roots) {
			const cs = getComputedStyle(root);
			await expect([
				cs.borderTopLeftRadius,
				cs.borderTopRightRadius,
				cs.borderBottomRightRadius,
				cs.borderBottomLeftRadius,
				cs.marginTop,
				cs.marginBottom,
			]).toEqual(["4px", "4px", "4px", "4px", "0px", "0px"]);
		}
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

export const Issue3473Item16HiddenStatusNameStaysInside: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3473-ITEM-16: at 320px in a right-to-left part of a left-to-right page, the visually hidden status name read before the heading lies inside the box it is placed in (the nearest positioned ancestor), so it never makes the page scroll sideways. With MUI's visually hidden style, its -1px margin put it 1px past the top and start edges of its container wherever it began the container.",
			},
		},
	},
	// error: white on MUI's warning orange is below 4.5:1 (see
	// Issue3464Item6FocusRingInEveryStatusAndTheme)
	args: { status: "error", heading: "Please review" },
	render: (args) => (
		<Box dir={"rtl"}>
			<InfoBox {...args} />
		</Box>
	),
	play: async ({ canvas }) => {
		await expect(edgesPast(canvas.getByText("Error:"))).toEqual([]);
		await expect(pageScrollsSideways()).toBe(false);
	},
};

/** the computed form of a CSS color, e.g. rgb(25, 118, 210) for #1976d2 */
const cssColor = (color: string) => {
	const el = document.createElement("div");
	el.style.color = color;
	document.body.append(el);
	const computed = getComputedStyle(el).color;
	el.remove();
	return computed;
};

const defaultTheme = createTheme();

/** each status, the palette color of its header and its state class */
const STATUS_STATES = [
	[undefined, "primary", "CcInfoBox-statusInfo"],
	["info", "primary", "CcInfoBox-statusInfo"],
	["warning", "warning", "CcInfoBox-statusWarning"],
	["success", "success", "CcInfoBox-statusSuccess"],
	["error", "error", "CcInfoBox-statusError"],
] as const;

export const Issue3464Item4StatusStateClasses: Story = {
	parameters: {
		a11y: {
			test: "error",
			config: {
				rules: [
					// white on MUI's default warning orange is below 4.5:1 (see
					// Issue3464Item6FocusRingInEveryStatusAndTheme); this story is
					// about the state classes and the colors they select
					{ id: "color-contrast", enabled: false },
				],
			},
		},
		docs: {
			description: {
				story:
					"ISSUE-3464-ITEM-4: the box and its header carry the state class of the status (`CcInfoBox-statusInfo` also for an unset status), and of `alwaysExpanded` (`CcInfoBox-alwaysExpanded`). The header takes its colors from its status class: the palette color's main and contrast text.",
			},
		},
	},
	render: () => (
		<ThemeProvider theme={defaultTheme}>
			<div style={{ width: 400 }}>
				{STATUS_STATES.map(([status]) => (
					<InfoBox
						key={String(status)}
						status={status}
						heading={`Status ${String(status)}`}
						message={"Message"}
					/>
				))}
				<InfoBox
					status={"success"}
					heading={"Forced open"}
					message={"Message"}
					alwaysExpanded
				/>
			</div>
		</ThemeProvider>
	),
	play: async ({ canvas }) => {
		for (const [status, color, statusClass] of STATUS_STATES) {
			const header = canvas.getByRole("button", {
				name: new RegExp(`Status ${String(status)}$`),
			});
			const box = header.closest(".MuiAccordion-root");
			await expect(header).toHaveClass(statusClass);
			await expect(box).toHaveClass(statusClass);
			await expect(header).not.toHaveClass("CcInfoBox-alwaysExpanded");
			await expect(box).not.toHaveClass("CcInfoBox-alwaysExpanded");
			const cs = getComputedStyle(header);
			await expect([cs.backgroundColor, cs.color, cs.cursor]).toEqual([
				cssColor(defaultTheme.palette[color].main),
				cssColor(defaultTheme.palette[color].contrastText),
				"pointer",
			]);
		}
		const forced = canvas.getByRole("button", { name: /Forced open$/ });
		await expect(forced).toHaveClass(
			"CcInfoBox-statusSuccess",
			"CcInfoBox-alwaysExpanded",
		);
		await expect(forced.closest(".MuiAccordion-root")).toHaveClass(
			"CcInfoBox-statusSuccess",
			"CcInfoBox-alwaysExpanded",
		);
		await expect(getComputedStyle(forced).cursor).toBe("default");
	},
};

const PURPLE = "rgb(106, 27, 154)";

/** a theme that recolors the error header, and styles every message panel */
const errorRecolorTheme = createTheme({
	components: {
		CcInfoBox: {
			styleOverrides: {
				summary: {
					"&.CcInfoBox-statusError": { backgroundColor: PURPLE },
				},
				details: ({ theme }) => ({ borderColor: theme.palette.divider }),
			},
		},
	},
});

export const Issue3464Item4ThemeRecolorsOneStatus: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3464-ITEM-4: a theme recolors the error header through its state class (`summary: { "&.CcInfoBox-statusError": { backgroundColor } }`), and the header keeps that color while it has keyboard focus. The info header keeps its palette color, and a function override of the theme styles every message panel.',
			},
		},
	},
	render: () => (
		<ThemeProvider theme={errorRecolorTheme}>
			<div style={{ width: 400 }}>
				<InfoBox status={"error"} heading={"Upload failed"} message={"M"} />
				<InfoBox status={"info"} heading={"Did you know?"} message={"M"} />
			</div>
		</ThemeProvider>
	),
	play: async ({ canvas, userEvent }) => {
		const error = canvas.getByRole("button", { name: /Upload failed/ });
		const info = canvas.getByRole("button", { name: /Did you know/ });
		await expect(getComputedStyle(error).backgroundColor).toBe(PURPLE);
		await expect(getComputedStyle(info).backgroundColor).toBe(
			cssColor(errorRecolorTheme.palette.primary.main),
		);
		await expect(
			getComputedStyle(elementOf(canvas.getAllByText("M")[0].parentElement))
				.borderTopColor,
		).toBe(cssColor(errorRecolorTheme.palette.divider));

		await userEvent.tab();
		await expect(error).toHaveFocus();
		await expect(error).toHaveClass("Mui-focusVisible");
		await transitionsDone(error);
		const cs = getComputedStyle(error);
		await expect([cs.backgroundColor, cs.outlineStyle]).toEqual([
			PURPLE,
			"solid",
		]);
	},
};

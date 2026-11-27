import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { fn, expect, waitFor, within } from "storybook/test";
import {
	Save as SaveIcon,
	Delete as DeleteIcon,
	Cancel as CancelIcon,
	Home as HomeIcon,
	Add as AddIcon,
	Undo as UndoIcon,
	Redo as RedoIcon,
} from "@mui/icons-material";
import ActionButton from "./ActionButton";
import SubActionButton from "./SubActionButton";
import FormButtons from "./FormButtons";
import IconButtonWithText from "./IconButtonWithText";
import TextFieldWithHelp from "./TextFieldWithHelp";
import NumberFormatter from "./NumberFormatter";
import CenteredTypography from "./CenteredTypography";
import Checkbox from "./Checkbox";
import { TextFieldCC } from "./MuiFieldState";
import {
	Box,
	Button,
	createTheme,
	decomposeColor,
	getContrastRatio,
	getLuminance,
	hexToRgb,
	PaletteColor,
	recomposeColor,
	ThemeProvider,
} from "@mui/material";

// the palette of the Storybook preview theme
const palette = createTheme().palette;

// ---- ActionButton ----

const ActionButtonMeta: Meta<typeof ActionButton> = {
	title: "Standalone/UIKit/ActionButton",
	component: ActionButton,
	parameters: { layout: "centered" },
	args: {
		children: "Save",
		onClick: fn(),
	},
};
export default ActionButtonMeta;

type ActionButtonStory = StoryObj<typeof ActionButton>;

export const Default: ActionButtonStory = {
	args: {
		children: "Save",
		icon: <SaveIcon />,
	},
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole("button", { name: "Save" });
		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const ClickDisabled: ActionButtonStory = {
	name: "Disabled",
	args: {
		children: "Save",
		icon: <SaveIcon />,
		disabled: true,
	},
};

export const Small: ActionButtonStory = {
	args: {
		children: "Save",
		icon: <SaveIcon />,
		small: true,
	},
};

export const SmallDisabled: ActionButtonStory = {
	args: {
		children: "Save",
		icon: <SaveIcon />,
		small: true,
		disabled: true,
	},
};

export const NoIcon: ActionButtonStory = {
	args: {
		children: "Continue",
	},
};

export const Issue3482Item1IconOnlyButtonsHaveNames: ActionButtonStory = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-1: icon-only (`small`) buttons are named by their label in every state: with no tooltip open, while disabled, and with a node label (axe `button-name`). The label is visually hidden text inside the button.",
			},
		},
	},
	render: (args) => (
		<Box sx={{ display: "flex", gap: 2 }}>
			<ActionButton small icon={<SaveIcon />} onClick={args.onClick}>
				Save
			</ActionButton>
			<ActionButton small disabled icon={<CancelIcon />}>
				Discard
			</ActionButton>
			<SubActionButton small disabled icon={<DeleteIcon />}>
				Delete
			</SubActionButton>
			<SubActionButton small icon={<HomeIcon />} onClick={args.onClick}>
				<span>Go home</span>
			</SubActionButton>
		</Box>
	),
	play: async ({ canvas, canvasElement, userEvent }) => {
		for (const name of ["Save", "Discard", "Delete", "Go home"]) {
			const button = canvas.getByRole("button", { name });
			// the box that holds the label inside the button shows none of it
			const label = Array.from(button.children).find(
				(child) => child.textContent === name,
			);
			await expect(label, `${name} has no label inside`).toBeDefined();
			const { width, height } = label!.getBoundingClientRect();
			await expect(width * height, `${name}'s label shows`).toBeLessThanOrEqual(
				1,
			);
			await expect(getComputedStyle(label!).overflow).toBe("hidden");
		}
		// the tooltip shows the label on keyboard focus; the name does not change
		const save = canvas.getByRole("button", { name: "Save" });
		const page = within(canvasElement.ownerDocument.body);
		await userEvent.tab();
		await expect(save).toHaveFocus();
		await expect(await page.findByRole("tooltip")).toHaveTextContent("Save");
		await expect(save).toHaveAccessibleName("Save");
		// axe then checks the buttons with no tooltip open
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(page.queryByRole("tooltip")).toBeNull());
		await expect(save).toHaveAccessibleName("Save");
	},
};

// a focus indicator: an outline or a box-shadow on the element or its box
const focusRing = (el: Element | null) => {
	if (!el) return null;
	const style = getComputedStyle(el);
	if (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0)
		return { outline: style.outlineColor };
	if (style.boxShadow !== "none") return { shadow: style.boxShadow };
	return null;
};

// a colour composited over the paper below it, white by default
const overPaper = (color: string, paper = "#fff") => {
	const [r, g, b, a = 1] = decomposeColor(color).values;
	const below = decomposeColor(paper).values;
	const over = (channel: number, index: number) =>
		Math.round(channel * a + below[index] * (1 - a));
	return `rgb(${over(r, 0)}, ${over(g, 1)}, ${over(b, 2)})`;
};

export const Issue3482Item3KeyboardFocusRing: ActionButtonStory = {
	parameters: {
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-3: keyboard focus on ActionButton, SubActionButton and Checkbox shows only a faint ripple (1.5-1.9:1); there is no outline or ring (WCAG 2.4.7, 1.4.11).",
			},
		},
	},
	render: (args) => (
		<Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
			<ActionButton
				fullWidth={false}
				icon={<SaveIcon />}
				onClick={args.onClick}
			>
				Save
			</ActionButton>
			<Box sx={{ width: 200 }}>
				<SubActionButton icon={<HomeIcon />} onClick={args.onClick}>
					Go Home
				</SubActionButton>
			</Box>
			<Checkbox slotProps={{ input: { "aria-label": "Accept terms" } }} />
		</Box>
	),
	play: async ({ canvas, userEvent }) => {
		const box = canvas.getByRole("checkbox", {
			name: "Accept terms",
		}).parentElement;
		if (!box) throw new Error("the checkbox input has no box around it");
		const targets: [string, HTMLElement][] = [
			["ActionButton", canvas.getByRole("button", { name: "Save" })],
			["SubActionButton", canvas.getByRole("button", { name: "Go Home" })],
			["Checkbox", box],
		];
		for (const [name, target] of targets) {
			await userEvent.tab();
			// keyboard focus as MUI sees it, so the ring is the only open question
			await waitFor(() => expect(target).toHaveClass("Mui-focusVisible"));
			const ring =
				focusRing(target) ?? focusRing(target.querySelector(":scope > svg"));
			await expect(ring, `${name} shows no focus ring`).not.toBeNull();
			if (ring?.outline)
				await expect(
					getContrastRatio(overPaper(ring.outline), "#fff"),
					`${name}'s focus ring is too faint`,
				).toBeGreaterThanOrEqual(3);
		}
	},
};

const renderFocusTargets: ActionButtonStory["render"] = (args) => (
	<Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
		<ActionButton fullWidth={false} icon={<SaveIcon />} onClick={args.onClick}>
			Save
		</ActionButton>
		<Box sx={{ width: 200 }}>
			<SubActionButton icon={<HomeIcon />} onClick={args.onClick}>
				Go Home
			</SubActionButton>
		</Box>
		<Checkbox slotProps={{ input: { "aria-label": "Accept terms" } }} />
	</Box>
);

type PlayContext = Parameters<NonNullable<ActionButtonStory["play"]>>[0];

/** Tabs to each control of renderFocusTargets and reads the outline of its ring */
const tabToEachRing = async ({ canvas, userEvent }: PlayContext) => {
	const save = canvas.getByRole("button", { name: "Save" });
	const home = canvas.getByRole("button", { name: "Go Home" });
	const box = canvas.getByRole("checkbox", {
		name: "Accept terms",
	}).parentElement;
	if (!box) throw new Error("the checkbox input has no box around it");
	const checkIcon = box.querySelector(":scope > svg");
	if (!checkIcon) throw new Error("the checkbox box has no icon");
	const targets: [string, HTMLElement, Element][] = [
		["ActionButton", save, save],
		["SubActionButton", home, home],
		["Checkbox", box, checkIcon],
	];
	const rings: { name: string; style: string; width: string; color: string }[] =
		[];
	for (const [name, target, ring] of targets) {
		await userEvent.tab();
		await waitFor(() => expect(target).toHaveClass("Mui-focusVisible"));
		const style = getComputedStyle(ring);
		rings.push({
			name,
			style: style.outlineStyle,
			width: style.outlineWidth,
			color: style.outlineColor,
		});
	}
	return rings;
};

export const Issue3482Item3FocusRingIsAnOutline: ActionButtonStory = {
	parameters: {
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-3: the focus ring is a 2px outline, which forced colors keep in a system color (they drop box-shadows).",
			},
		},
	},
	render: renderFocusTargets,
	play: async (context) => {
		for (const ring of await tabToEachRing(context))
			await expect(ring, `${ring.name}'s ring`).toMatchObject({
				style: "solid",
				width: "2px",
			});
	},
};

// an app's theme ring, as MUI's createTheme({ focusVisible }) takes it
const GREEN_RING = createTheme({
	focusVisible: { outlineColor: "rgb(0, 128, 0)" },
});

export const Issue3482Item3ThemeFocusVisibleRing: ActionButtonStory = {
	parameters: {
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-3: a theme that sets MUI's `focusVisible` ring (here `outlineColor: rgb(0, 128, 0)`) styles the ring of all three controls.",
			},
		},
	},
	decorators: [
		(Story) => (
			<ThemeProvider theme={GREEN_RING}>
				<Story />
			</ThemeProvider>
		),
	],
	render: renderFocusTargets,
	play: async (context) => {
		for (const ring of await tabToEachRing(context))
			await expect(ring, `${ring.name}'s ring`).toMatchObject({
				style: "solid",
				color: "rgb(0, 128, 0)",
			});
	},
};

// Synthetic pointer events never set :hover. Copies every :hover rule of the page
// next to itself, with :hover replaced by this class, so a play can read hover styles.
const FORCED_HOVER = "story-forced-hover";
const copyHoverRules = (
	rules: CSSRuleList,
	insert: (rule: string, index: number) => void,
) => {
	for (let index = rules.length - 1; index >= 0; index--) {
		const rule = rules[index];
		if (rule instanceof CSSStyleRule && rule.selectorText.includes(":hover"))
			insert(
				`${rule.selectorText.replaceAll(":hover", `.${FORCED_HOVER}`)}{${rule.style.cssText}}`,
				index + 1,
			);
		else if (rule instanceof CSSGroupingRule)
			copyHoverRules(rule.cssRules, (text, at) => rule.insertRule(text, at));
	}
};
const forceHoverRules = () => {
	for (const sheet of Array.from(document.styleSheets))
		copyHoverRules(sheet.cssRules, (text, at) => sheet.insertRule(text, at));
};

/** The fill and text color an element shows now */
const colorsOf = (element: HTMLElement) => {
	const { backgroundColor, color } = getComputedStyle(element);
	return { backgroundColor, color };
};

/** The fill and text color an element shows under the pointer */
const hoverColors = (element: HTMLElement) => {
	// MUI's transition would report the fill it starts from
	element.style.transition = "none";
	element.classList.add(FORCED_HOVER);
	const hover = colorsOf(element);
	element.classList.remove(FORCED_HOVER);
	colorsOf(element); // back at rest before the transition returns
	element.style.transition = "";
	return hover;
};

// a palette color as getComputedStyle reports it
const computed = (color: string) => recomposeColor(decomposeColor(color));

// the contrast of a text color, also a translucent one, laid over its fill
const textContrast = ({
	color,
	backgroundColor,
}: {
	color: string;
	backgroundColor: string;
}) => {
	const [r, g, b, a = 1] = decomposeColor(color).values;
	const fill = decomposeColor(backgroundColor).values;
	const shown = [r, g, b].map((channel, i) =>
		Math.round(channel * a + fill[i] * (1 - a)),
	);
	return getContrastRatio(`rgb(${shown.join(", ")})`, backgroundColor);
};

// an app theme that recolors every ActionButton, its orange readable in both states
const ORANGE_ACTION_BUTTONS = createTheme({
	palette: { secondary: { main: "#b8501a" }, contrastThreshold: 4.5 },
	components: { CcActionButton: { defaultProps: { color: "secondary" } } },
});

export const Issue3482Item8RecolorWithColor: ActionButtonStory = {
	parameters: {
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-8: recolor an ActionButton with `color`, or for every ActionButton with the theme's `CcActionButton.defaultProps.color` (right: an orange `secondary` with `contrastThreshold: 4.5`). Fill, text and hover then come from that palette color (`main`, `contrastText`, `dark`), as on MUI's Button, where the text reaches 4.5:1 on them (otherwise see Issue3482Item8ReadableFills). Overriding only the background keeps primary's text color and hover.",
			},
		},
	},
	render: (args) => (
		<Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
			<ActionButton
				color="error"
				fullWidth={false}
				icon={<DeleteIcon />}
				onClick={args.onClick}
			>
				Delete
			</ActionButton>
			<ThemeProvider theme={ORANGE_ACTION_BUTTONS}>
				<ActionButton
					fullWidth={false}
					icon={<SaveIcon />}
					onClick={args.onClick}
				>
					Save
				</ActionButton>
			</ThemeProvider>
		</Box>
	),
	play: async ({ canvas }) => {
		forceHoverRules();
		const buttons: [HTMLElement, PaletteColor][] = [
			[
				canvas.getByRole("button", { name: "Delete" }),
				createTheme().palette.error,
			],
			[
				canvas.getByRole("button", { name: "Save" }),
				ORANGE_ACTION_BUTTONS.palette.secondary,
			],
		];
		for (const [button, palette] of buttons) {
			const name = button.textContent;
			const rest = colorsOf(button);
			await expect(rest.backgroundColor, `${name}'s fill`).toBe(
				computed(palette.main),
			);
			await expect(rest.color, `${name}'s text`).toBe(
				computed(palette.contrastText),
			);
			const hover = hoverColors(button);
			await expect(hover.backgroundColor, `${name}'s hover fill`).toBe(
				computed(palette.dark),
			);
			await expect(hover.color, `${name}'s hover text`).toBe(
				computed(palette.contrastText),
			);
			for (const [state, colors] of [
				["resting", rest],
				["hovered", hover],
			] as const)
				await expect(
					textContrast(colors),
					`${name}'s text while ${state}`,
				).toBeGreaterThanOrEqual(4.5);
		}
	},
};

// palette colors whose contrastText has less than 4.5:1 on MUI's fills
const LIGHT_GREEN_SUCCESS = createTheme({
	palette: { success: { main: "#4caf50" } },
});
const ORANGE_SECONDARY_ACTION_BUTTONS = createTheme({
	palette: { secondary: { main: "#eb6a28" } },
	components: { CcActionButton: { defaultProps: { color: "secondary" } } },
});
const ORANGE_PRIMARY = createTheme({
	palette: { primary: { main: "#ed6c02" } },
});

export const Issue3482Item8ReadableFills: ActionButtonStory = {
	parameters: {
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-8: palette colors whose `contrastText` has less than 4.5:1 on MUI's fills: MUI's default warning (on `main` and `dark`) and info (on `main`), a light green success with dark text (on `dark`), an orange secondary set through `defaultProps.color`, and an orange primary without `color`. ActionButton darkens those fills (behind dark text: lightens them) just enough, in their own hue. The text keeps the palette's `contrastText`, and the hover fill stays darker than the resting one.",
			},
		},
	},
	render: (args) => (
		<Box
			sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center" }}
		>
			<ActionButton color="warning" fullWidth={false} onClick={args.onClick}>
				Warning
			</ActionButton>
			<ActionButton color="info" fullWidth={false} onClick={args.onClick}>
				Info
			</ActionButton>
			<ThemeProvider theme={LIGHT_GREEN_SUCCESS}>
				<ActionButton color="success" fullWidth={false} onClick={args.onClick}>
					Success
				</ActionButton>
			</ThemeProvider>
			<ThemeProvider theme={ORANGE_SECONDARY_ACTION_BUTTONS}>
				<ActionButton fullWidth={false} onClick={args.onClick}>
					Secondary
				</ActionButton>
			</ThemeProvider>
			<ThemeProvider theme={ORANGE_PRIMARY}>
				<ActionButton fullWidth={false} onClick={args.onClick}>
					Primary
				</ActionButton>
			</ThemeProvider>
		</Box>
	),
	play: async ({ canvas }) => {
		forceHoverRules();
		const defaults = createTheme().palette;
		const buttons: [string, PaletteColor][] = [
			["Warning", defaults.warning],
			["Info", defaults.info],
			["Success", LIGHT_GREEN_SUCCESS.palette.success],
			["Secondary", ORANGE_SECONDARY_ACTION_BUTTONS.palette.secondary],
			["Primary", ORANGE_PRIMARY.palette.primary],
		];
		for (const [name, palette] of buttons) {
			const button = canvas.getByRole("button", { name });
			const rest = colorsOf(button);
			const hover = hoverColors(button);
			for (const [state, colors] of [
				["resting", rest],
				["hovered", hover],
			] as const) {
				await expect(colors.color, `${name}'s text while ${state}`).toBe(
					computed(palette.contrastText),
				);
				await expect(
					textContrast(colors),
					`${name}'s text contrast while ${state}`,
				).toBeGreaterThanOrEqual(4.5);
			}
			await expect(
				getLuminance(hover.backgroundColor),
				`${name}'s hover fill is darker than its resting fill`,
			).toBeLessThan(getLuminance(rest.backgroundColor));
		}
	},
};

const DARK = createTheme({ palette: { mode: "dark" } });
// an app theme that gives disabled ActionButtons a fill of its own
const OWN_DISABLED_FILL = createTheme({
	components: {
		CcActionButton: {
			styleOverrides: {
				button: { "&.Mui-disabled": { backgroundColor: "#bcbdbf" } },
			},
		},
	},
});

/** Disabled ActionButtons without and with a palette color, and a small one */
const DisabledActionButtons = () => (
	<Box
		sx={{
			display: "flex",
			gap: 2,
			alignItems: "center",
			p: 2,
			bgcolor: "background.paper",
		}}
	>
		<ActionButton disabled fullWidth={false} icon={<SaveIcon />}>
			Save
		</ActionButton>
		<ActionButton
			disabled
			fullWidth={false}
			color="error"
			icon={<DeleteIcon />}
		>
			Delete
		</ActionButton>
		<ActionButton disabled small icon={<CancelIcon />}>
			Discard
		</ActionButton>
	</Box>
);

export const Issue3482Item19DisabledFill: ActionButtonStory = {
	parameters: {
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-19: a disabled ActionButton is filled with `palette.action.disabled` and its label and icon are `background.paper`, with or without `color`, in the light and the dark palette. A theme that sets `&.Mui-disabled` in `CcActionButton.styleOverrides.button` paints its own fill (bottom).",
			},
		},
	},
	render: () => (
		<Box sx={{ display: "grid", gap: 2 }}>
			<Box data-testid="light">
				<DisabledActionButtons />
			</Box>
			<ThemeProvider theme={DARK}>
				<Box data-testid="dark">
					<DisabledActionButtons />
				</Box>
			</ThemeProvider>
			<ThemeProvider theme={OWN_DISABLED_FILL}>
				<Box data-testid="themed">
					<DisabledActionButtons />
				</Box>
			</ThemeProvider>
		</Box>
	),
	play: async ({ canvas }) => {
		const rows = [
			["light", createTheme().palette.action.disabled],
			["dark", DARK.palette.action.disabled],
			["themed", "#bcbdbf"],
		] as const;
		for (const [row, fill] of rows) {
			const paper = (row === "dark" ? DARK : createTheme()).palette.background
				.paper;
			for (const name of ["Save", "Delete", "Discard"]) {
				const button = within(canvas.getByTestId(row)).getByRole("button", {
					name,
				});
				const { backgroundColor, color } = colorsOf(button);
				await expect(backgroundColor, `${row} ${name}'s fill`).toBe(
					computed(fill),
				);
				await expect(color, `${row} ${name}'s text`).toBe(computed(paper));
			}
		}
	},
};

// how far the centre of a button's icon is from the button's centre, in px
const iconOffset = (button: HTMLElement) => {
	const icon = button.querySelector("svg");
	if (!icon) throw new Error(`${button.textContent} has no icon`);
	const box = button.getBoundingClientRect();
	const glyph = icon.getBoundingClientRect();
	return {
		x: (glyph.left + glyph.right - box.left - box.right) / 2,
		y: (glyph.top + glyph.bottom - box.top - box.bottom) / 2,
	};
};

export const Issue3482Item20SmallIconCentred: ActionButtonStory = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-20: the icon of a `small` button is centred in the button, with as much space on its left as on its right.",
			},
		},
	},
	args: {
		children: "Save",
		icon: <SaveIcon />,
		small: true,
	},
	play: async ({ canvas }) => {
		const button = canvas.getByRole("button", { name: "Save" });
		await expect(Math.abs(iconOffset(button).x)).toBeLessThanOrEqual(1);
	},
};

export const Issue3482Item20SmallIconCentredInEveryState: ActionButtonStory = {
	parameters: {
		layout: "padded",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-20: the icon of a `small` button is centred in every state: disabled, in a palette `color`, in MUI's `size`s, and stretched by `fullWidth`. A small SubActionButton for comparison.",
			},
		},
	},
	render: (args) => (
		<Box
			sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
		>
			<ActionButton small icon={<SaveIcon />} onClick={args.onClick}>
				Save
			</ActionButton>
			<ActionButton small disabled icon={<CancelIcon />}>
				Discard
			</ActionButton>
			<ActionButton
				small
				color="error"
				icon={<DeleteIcon />}
				onClick={args.onClick}
			>
				Delete
			</ActionButton>
			<ActionButton
				small
				size="small"
				icon={<UndoIcon />}
				onClick={args.onClick}
			>
				Undo
			</ActionButton>
			<ActionButton
				small
				size="large"
				icon={<RedoIcon />}
				onClick={args.onClick}
			>
				Redo
			</ActionButton>
			<Box sx={{ width: 200 }}>
				<ActionButton small fullWidth icon={<AddIcon />} onClick={args.onClick}>
					Add
				</ActionButton>
			</Box>
			<SubActionButton small icon={<HomeIcon />} onClick={args.onClick}>
				Go home
			</SubActionButton>
		</Box>
	),
	play: async ({ canvas }) => {
		for (const name of [
			"Save",
			"Discard",
			"Delete",
			"Undo",
			"Redo",
			"Add",
			"Go home",
		]) {
			const offset = iconOffset(canvas.getByRole("button", { name }));
			await expect(
				Math.abs(offset.x),
				`${name}'s icon is off centre sideways`,
			).toBeLessThanOrEqual(1);
			await expect(
				Math.abs(offset.y),
				`${name}'s icon is off centre vertically`,
			).toBeLessThanOrEqual(1);
		}
	},
};

export const SubActionButtonDefault: ActionButtonStory = {
	render: () => (
		<SubActionButton icon={<HomeIcon />} onClick={() => {}}>
			Go Home
		</SubActionButton>
	),
};

export const SubActionButtonSmall: ActionButtonStory = {
	render: () => (
		<SubActionButton icon={<HomeIcon />} small onClick={() => {}}>
			Go Home
		</SubActionButton>
	),
};

export const SubActionButtonDisabled: ActionButtonStory = {
	render: () => (
		<SubActionButton icon={<DeleteIcon />} disabled onClick={() => {}}>
			Delete
		</SubActionButton>
	),
};

/**
 * Shows the `:hover` style of `element` without a pointer: userEvent.hover is
 * synthetic and never matches `:hover`. Every `:hover` rule of the page is
 * copied right after itself, with `:hover` replaced by a class that `element`
 * then gets, so the cascade stays as it is. Returns the cleanup.
 */
const forceHover = (element: Element) => {
	const copies: [CSSStyleSheet | CSSGroupingRule, CSSRule][] = [];
	const copyHoverRules = (parent: CSSStyleSheet | CSSGroupingRule) => {
		for (let index = parent.cssRules.length - 1; index >= 0; index--) {
			const rule = parent.cssRules[index];
			if (
				rule instanceof CSSStyleRule &&
				rule.selectorText.includes(":hover")
			) {
				parent.insertRule(
					rule.cssText.replaceAll(":hover", `.${FORCED_HOVER}`),
					index + 1,
				);
				copies.push([parent, parent.cssRules[index + 1]]);
			} else if (rule instanceof CSSGroupingRule) copyHoverRules(rule);
		}
	};
	for (const sheet of Array.from(document.styleSheets)) copyHoverRules(sheet);
	element.classList.add(FORCED_HOVER);
	return () => {
		element.classList.remove(FORCED_HOVER);
		for (const [parent, copy] of copies)
			parent.deleteRule(Array.from(parent.cssRules).indexOf(copy));
	};
};

export const Issue3482Item12SmallSubActionButtonHoverContrast: ActionButtonStory =
	{
		parameters: {
			a11y: { test: "error" },
			docs: {
				description: {
					story:
						"ISSUE-3482-ITEM-12: hovering a `small` SubActionButton fills it `primary.light` and paints its icon white, 2.65:1 (WCAG 1.4.11).",
				},
			},
		},
		render: (args) => (
			<Box sx={{ display: "flex" }}>
				<SubActionButton small icon={<HomeIcon />} onClick={args.onClick}>
					Home
				</SubActionButton>
				<SubActionButton small icon={<SaveIcon />} onClick={args.onClick}>
					Save
				</SubActionButton>
			</Box>
		),
		play: async ({ canvas }) => {
			const home = canvas.getByRole("button", { name: "Home" });
			const icon = home.querySelector("svg");
			if (!icon) throw new Error("the button has no icon");
			const unhover = forceHover(home);
			try {
				// the fill and the background colour fade in
				await Promise.all(
					home
						.getAnimations({ subtree: true })
						.map((animation) => animation.finished),
				);
				const background = getComputedStyle(home).backgroundColor;
				await expect(background, "the hover fills the cell primary.light").toBe(
					"rgb(66, 165, 245)",
				);
				await expect(
					getContrastRatio(
						overPaper(getComputedStyle(icon).fill, background),
						background,
					),
					"the hovered icon is too faint on the hover fill",
				).toBeGreaterThanOrEqual(3);
			} finally {
				unhover();
			}
		},
	};

export const Issue3482Item23SubActionButtonColor: ActionButtonStory = {
	parameters: {
		docs: {
			description: {
				story:
					'ISSUE-3482-ITEM-23: `color="error"` changes nothing, and an icon\'s own color is repainted primary.',
			},
		},
	},
	render: (args) => (
		<Box sx={{ width: 300 }}>
			<SubActionButton
				color={"error"}
				icon={<DeleteIcon />}
				onClick={args.onClick}
			>
				Delete
			</SubActionButton>
			<SubActionButton
				icon={<DeleteIcon color={"error"} />}
				onClick={args.onClick}
			>
				Remove
			</SubActionButton>
		</Box>
	),
	play: async ({ canvas }) => {
		const error = hexToRgb(palette.error.main);
		const remove = canvas.getByRole("button", { name: "Remove" });
		const icon = remove.querySelector("svg");
		if (!icon) throw new Error("the button has no icon");
		await expect(
			getComputedStyle(icon).fill,
			"the icon's own color is repainted",
		).toBe(error);
		const del = canvas.getByRole("button", { name: "Delete" });
		await expect(
			getComputedStyle(del).color,
			'color="error" does not reach the label',
		).toBe(error);
	},
};

// an app theme that gives every SubActionButton a color
const SECONDARY_SUB_ACTION_BUTTONS = createTheme({
	components: { CcSubActionButton: { defaultProps: { color: "secondary" } } },
});

export const Issue3482Item23SubActionButtonColorStates: ActionButtonStory = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3482-ITEM-23: without `color` the label is `text.primary` and the icon `primary.main`; a disabled button is `text.disabled` with or without `color`; the hover of a `small` button fills the cell with the light shade of its color; the theme's `CcSubActionButton.defaultProps.color` colors every SubActionButton.",
			},
		},
	},
	render: (args) => (
		<Box sx={{ width: 300 }}>
			<SubActionButton icon={<HomeIcon />} onClick={args.onClick}>
				Home
			</SubActionButton>
			<SubActionButton
				color={"error"}
				disabled
				icon={<DeleteIcon />}
				onClick={args.onClick}
			>
				Retire
			</SubActionButton>
			<SubActionButton
				small
				color={"error"}
				icon={<DeleteIcon />}
				onClick={args.onClick}
			>
				Delete
			</SubActionButton>
			<ThemeProvider theme={SECONDARY_SUB_ACTION_BUTTONS}>
				<SubActionButton icon={<SaveIcon />} onClick={args.onClick}>
					Save
				</SubActionButton>
			</ThemeProvider>
		</Box>
	),
	play: async ({ canvas }) => {
		const colors = (name: string) => {
			const button = canvas.getByRole("button", { name });
			const icon = button.querySelector("svg");
			if (!icon) throw new Error(`${name} has no icon`);
			return {
				label: getComputedStyle(button).color,
				icon: getComputedStyle(icon).fill,
			};
		};
		// the colors settle after the first render's color transitions (MUI's
		// button transitions its color), so they are read once they reach the
		// expected value instead of at once
		await waitFor(() =>
			expect(colors("Home"), "the colors without color").toEqual({
				label: computed(palette.text.primary),
				icon: computed(palette.primary.main),
			}),
		);
		await waitFor(() =>
			expect(colors("Retire"), "the colors while disabled").toEqual({
				label: computed(palette.text.disabled),
				icon: computed(palette.text.disabled),
			}),
		);
		const secondary = computed(palette.secondary.main);
		await waitFor(() =>
			expect(colors("Save"), "the theme's default color").toEqual({
				label: secondary,
				icon: secondary,
			}),
		);
		const del = canvas.getByRole("button", { name: "Delete" });
		const unhover = forceHover(del);
		try {
			await Promise.all(
				del
					.getAnimations({ subtree: true })
					.map((animation) => animation.finished),
			);
			const background = getComputedStyle(del).backgroundColor;
			await expect(background, "the hover fill of a small button").toBe(
				computed(palette.error.light),
			);
			await expect(
				colors("Delete").icon,
				"the icon on the hover fill of a small button",
			).toBe(computed(palette.getContrastText(palette.error.light)));
		} finally {
			unhover();
		}
	},
};

export const FormButtonsSaveCancelDelete: ActionButtonStory = {
	render: () => (
		<FormButtons>
			<Button variant="contained" startIcon={<SaveIcon />} onClick={() => {}}>
				Save
			</Button>
			<Button variant="outlined" startIcon={<CancelIcon />} onClick={() => {}}>
				Cancel
			</Button>
			<Button
				variant="outlined"
				color="error"
				startIcon={<DeleteIcon />}
				onClick={() => {}}
			>
				Delete
			</Button>
		</FormButtons>
	),
};

export const FormButtonsSaveCancel: ActionButtonStory = {
	render: () => (
		<FormButtons>
			<Button variant="contained" startIcon={<SaveIcon />} onClick={() => {}}>
				Save
			</Button>
			<Button variant="outlined" startIcon={<CancelIcon />} onClick={() => {}}>
				Cancel
			</Button>
		</FormButtons>
	),
};

export const FormButtonsEmpty: ActionButtonStory = {
	render: () => (
		<FormButtons>
			{null}
			{false}
		</FormButtons>
	),
};

export const IconButtonWithTextStory: ActionButtonStory = {
	render: () => (
		<IconButtonWithText icon={<HomeIcon />} text="Home" onClick={() => {}} />
	),
};

export const TextFieldWithHelpBasic: ActionButtonStory = {
	render: () => <TextFieldWithHelp label="Name" placeholder="Enter name" />,
};

export const TextFieldWithHelpWithInfo: ActionButtonStory = {
	render: () => (
		<TextFieldWithHelp
			label="Email"
			placeholder="user@example.com"
			openInfo={() => alert("This is the email field")}
		/>
	),
};

export const TextFieldWithHelpError: ActionButtonStory = {
	render: () => (
		<TextFieldWithHelp
			label="Username"
			value="bad value"
			error
			helperText="Username already taken"
		/>
	),
};

export const TextFieldWithHelpDisabled: ActionButtonStory = {
	render: () => (
		<TextFieldWithHelp label="Read Only" value="fixed value" disabled />
	),
};

export const NumberFormatterBasic: ActionButtonStory = {
	render: () => <NumberFormatter value={1234567.89} />,
};

export const NumberFormatterNull: ActionButtonStory = {
	render: () => <NumberFormatter value={null} />,
};

export const NumberFormatterCurrency: ActionButtonStory = {
	render: () => (
		<NumberFormatter
			value={9999.5}
			options={{ style: "currency", currency: "USD" }}
		/>
	),
};

/**
 * A currency that is not three letters (`"EURO"`) is printed as if it were a
 * code, a missing one (`""`) leaves the currency out. Both are reported once,
 * unless `disableErrorReporting` is set (the third).
 */
export const NumberFormatterInvalidCurrency: ActionButtonStory = {
	render: () => (
		<ul>
			<li>
				<NumberFormatter
					value={9999.5}
					options={{ style: "currency", currency: "EURO" }}
				/>
			</li>
			<li>
				<NumberFormatter
					value={9999.5}
					options={{ style: "currency", currency: "" }}
				/>
			</li>
			<li>
				<NumberFormatter
					value={9999.5}
					options={{ style: "currency", currency: "" }}
					disableErrorReporting
				/>
			</li>
		</ul>
	),
	parameters: {
		a11y: { test: "error" },
	},
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll("li");
		// "EURO 9,999.50" in en, "9.999,50 EURO" in de
		await expect(items[0]).toHaveTextContent(
			/^(EURO\s9[.,]?999[.,]50|9[.,]?999[.,]50\sEURO)$/,
		);
		await expect(items[1]).toHaveTextContent(/^9[.,]?999[.,]50$/);
		await expect(items[2]).toHaveTextContent(/^9[.,]?999[.,]50$/);
	},
};

export const NumberFormatterPercent: ActionButtonStory = {
	render: () => <NumberFormatter value={0.75} options={{ style: "percent" }} />,
};

export const CenteredTypographyStory: ActionButtonStory = {
	render: () => (
		<div style={{ width: 400, height: 200, border: "1px dashed #ccc" }}>
			<CenteredTypography variant="h5">Centered Text</CenteredTypography>
		</div>
	),
};

// an enabled box's border reaches WCAG 1.4.11's 3:1 against the box
const expectBoxBoundaryContrast: ActionButtonStory["play"] = async ({
	canvas,
}) => {
	const root = canvas.getByRole("checkbox").parentElement!;
	const { borderTopColor, backgroundColor } = getComputedStyle(
		root.querySelector(":scope > svg")!,
	);
	const [r, g, b, a = 1] = decomposeColor(borderTopColor).values;
	const background = decomposeColor(backgroundColor).values;
	const over = (channel: number, i: number) =>
		Math.round(channel * a + background[i] * (1 - a));
	const border = `rgb(${over(r, 0)}, ${over(g, 1)}, ${over(b, 2)})`;
	await expect(
		getContrastRatio(border, backgroundColor),
	).toBeGreaterThanOrEqual(3);
};

export const CheckboxUnchecked: ActionButtonStory = {
	render: () => <Checkbox />,
	play: expectBoxBoundaryContrast,
};

export const CheckboxChecked: ActionButtonStory = {
	render: () => <Checkbox checked />,
	play: expectBoxBoundaryContrast,
};

export const CheckboxIndeterminate: ActionButtonStory = {
	render: () => <Checkbox indeterminate />,
	play: expectBoxBoundaryContrast,
};

export const Issue3482Item2IndeterminateCheckboxIsMixed: ActionButtonStory = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3482-ITEM-2: an indeterminate Checkbox is announced as "not checked": only `aria-checked="mixed"` is set, which browsers ignore on a native checkbox (axe `aria-conditional-attr`).',
			},
		},
	},
	render: () => (
		<Checkbox
			indeterminate
			slotProps={{ input: { "aria-label": "Select all rows" } }}
		/>
	),
};

export const CheckboxDisabled: ActionButtonStory = {
	render: () => <Checkbox disabled />,
};

export const CheckboxCheckedDisabled: ActionButtonStory = {
	render: () => <Checkbox checked disabled />,
};

export const CheckboxControlled: ActionButtonStory = {
	render: () => {
		const [checked, setChecked] = useState(false);
		return (
			<Checkbox
				checked={checked}
				onChange={(e) => setChecked(e.target.checked)}
			/>
		);
	},
};

export const FieldStateNormal: ActionButtonStory = {
	render: () => <TextFieldCC label="Normal field" />,
};

export const FieldStateWarning: ActionButtonStory = {
	render: () => <TextFieldCC label="Warning field" warning />,
};

export const FieldStateWithError: ActionButtonStory = {
	render: () => (
		<TextFieldCC
			label="Error overrides warning"
			warning
			error
			helperText="Error message"
		/>
	),
};

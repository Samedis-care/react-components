import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { fn, expect, waitFor } from "storybook/test";
import {
	Save as SaveIcon,
	Delete as DeleteIcon,
	Cancel as CancelIcon,
	Home as HomeIcon,
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
	ThemeProvider,
} from "@mui/material";

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

// a focus indicator: an outline or a box-shadow on the element or its box
const focusRing = (el: Element | null) => {
	if (!el) return null;
	const style = getComputedStyle(el);
	if (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0)
		return { outline: style.outlineColor };
	if (style.boxShadow !== "none") return { shadow: style.boxShadow };
	return null;
};

// an outline colour composited over white paper
const overPaper = (color: string) => {
	const [r, g, b, a = 1] = decomposeColor(color).values;
	const over = (channel: number) => Math.round(channel * a + 255 * (1 - a));
	return `rgb(${over(r)}, ${over(g)}, ${over(b)})`;
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
		const targets: [string, HTMLElement][] = [
			["ActionButton", canvas.getByRole("button", { name: "Save" })],
			["SubActionButton", canvas.getByRole("button", { name: "Go Home" })],
			[
				"Checkbox",
				canvas.getByRole("checkbox", { name: "Accept terms" }).parentElement,
			],
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
	const targets: [string, HTMLElement, Element][] = [
		["ActionButton", save, save],
		["SubActionButton", home, home],
		["Checkbox", box, box.querySelector(":scope > svg")],
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
	const root = canvas.getByRole("checkbox").parentElement;
	const { borderTopColor, backgroundColor } = getComputedStyle(
		root.querySelector(":scope > svg"),
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

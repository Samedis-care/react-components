import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { List, ListItem, ListItemText } from "@mui/material";
import {
	Delete as DeleteIcon,
	Home as HomeIcon,
	Settings as SettingsIcon,
	Tune as TuneIcon,
} from "@mui/icons-material";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor } from "storybook/test";
import {
	SmallIconButton,
	SmallestIconButton,
	SmallListItem,
	SmallListItemButton,
	SmallListItemIcon,
	SelectorSmallListItem,
	SelectorSmallListItemButton,
} from "./index";

// --- SmallIconButton ---

const SmallIconButtonMeta: Meta<typeof SmallIconButton> = {
	title: "Standalone/Small/SmallIconButton",
	component: SmallIconButton,
	parameters: { layout: "centered" },
};
export default SmallIconButtonMeta;

type SmallIconButtonStory = StoryObj<typeof SmallIconButton>;

export const Default: SmallIconButtonStory = {
	render: () => (
		<SmallIconButton>
			<SettingsIcon />
		</SmallIconButton>
	),
};

export const SmallestVariant: SmallIconButtonStory = {
	render: () => (
		<SmallestIconButton>
			<HomeIcon />
		</SmallestIconButton>
	),
};

export const BothSizes: SmallIconButtonStory = {
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<SmallIconButton>
				<SettingsIcon />
			</SmallIconButton>
			<SmallestIconButton>
				<HomeIcon />
			</SmallestIconButton>
		</div>
	),
};

export const SmallListItems: SmallIconButtonStory = {
	render: () => (
		<List>
			<SmallListItem>
				<SmallListItemIcon>
					<HomeIcon />
				</SmallListItemIcon>
				<ListItemText primary="SmallListItem with icon" />
			</SmallListItem>
			<SmallListItemButton>
				<SmallListItemIcon>
					<SettingsIcon />
				</SmallListItemIcon>
				<ListItemText primary="SmallListItemButton" />
			</SmallListItemButton>
			<SelectorSmallListItem>
				<ListItemText primary="SelectorSmallListItem" />
			</SelectorSmallListItem>
			<SelectorSmallListItemButton>
				<ListItemText primary="SelectorSmallListItemButton" />
			</SelectorSmallListItemButton>
		</List>
	),
};

export const Issue3459Item1ListItemGutters: SmallIconButtonStory = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-1: `SmallListItem` and `SmallListItemButton` have 8px left and right gutters, the Selector variants none on the left and 8px on the right; MUI's own list items have 16px.",
			},
		},
	},
	render: () => (
		<List sx={{ width: 320 }}>
			<SmallListItem>
				<ListItemText primary="SmallListItem" />
			</SmallListItem>
			<ListItem disablePadding>
				<SmallListItemButton>
					<ListItemText primary="SmallListItemButton" />
				</SmallListItemButton>
			</ListItem>
			<SelectorSmallListItem>
				<ListItemText primary="SelectorSmallListItem" />
			</SelectorSmallListItem>
			<ListItem disablePadding>
				<SelectorSmallListItemButton>
					<ListItemText primary="SelectorSmallListItemButton" />
				</SelectorSmallListItemButton>
			</ListItem>
		</List>
	),
	play: async ({ canvas }) => {
		// where the text starts and ends inside the row, in px
		const inset = (name: string) => {
			const text = canvas.getByText(name);
			const row = text.closest(".MuiListItem-root, .MuiListItemButton-root")!;
			const rowBox = row.getBoundingClientRect();
			const textBox = text.parentElement!.getBoundingClientRect();
			return [textBox.left - rowBox.left, rowBox.right - textBox.right];
		};
		await expect(inset("SmallListItem")).toEqual([8, 8]);
		await expect(inset("SmallListItemButton")).toEqual([8, 8]);
		await expect(inset("SelectorSmallListItem")).toEqual([0, 8]);
		await expect(inset("SelectorSmallListItemButton")).toEqual([0, 8]);
	},
};

interface KeyboardDemoProps {
	onSettings: () => void;
	onDelete: () => void;
	onDisabled: () => void;
}

const KeyboardDemo = (props: KeyboardDemoProps) => (
	<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
		<SmallIconButton aria-label={"Settings"} onClick={props.onSettings}>
			<SettingsIcon />
		</SmallIconButton>
		<SmallestIconButton aria-label={"Delete"} onClick={props.onDelete}>
			<DeleteIcon />
		</SmallestIconButton>
		<SmallestIconButton
			aria-label={"Disabled"}
			disabled
			onClick={props.onDisabled}
		>
			<TuneIcon />
		</SmallestIconButton>
	</div>
);

export const Issue3459Item8SmallestIconButtonShowsFocusRing: StoryObj<
	typeof KeyboardDemo
> = {
	args: { onSettings: fn(), onDelete: fn(), onDisabled: fn() },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-8: a keyboard-focused `SmallestIconButton` only gets MUI's focus ripple (a faint disc behind the glyph, nothing in forced colors). Expected: a focus outline.",
			},
		},
	},
	render: (args) => <KeyboardDemo {...args} />,
	play: async ({ canvas }) => {
		const del = canvas.getByRole("button", { name: "Delete" });
		await userEvent.tab();
		await userEvent.tab();
		await expect(del).toHaveFocus();
		await waitFor(() => expect(del).toHaveClass("Mui-focusVisible"));
		const style = getComputedStyle(del);
		await expect(style.outlineStyle).not.toBe("none");
		await expect(style.outlineColor).not.toBe("rgba(0, 0, 0, 0)");
	},
};

export const Issue3459Item8SmallIconButtonShowsFocusRing: StoryObj<
	typeof KeyboardDemo
> = {
	args: { onSettings: fn(), onDelete: fn(), onDisabled: fn() },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-8: a keyboard-focused `SmallIconButton` (the Selector's remove buttons) only gets MUI's focus ripple. Expected: a focus outline.",
			},
		},
	},
	render: (args) => <KeyboardDemo {...args} />,
	play: async ({ canvas }) => {
		const settings = canvas.getByRole("button", { name: "Settings" });
		await userEvent.tab();
		await expect(settings).toHaveFocus();
		await waitFor(() => expect(settings).toHaveClass("Mui-focusVisible"));
		const style = getComputedStyle(settings);
		await expect(style.outlineStyle).not.toBe("none");
		await expect(style.outlineColor).not.toBe("rgba(0, 0, 0, 0)");
	},
};

export const Issue3459Item13SmallestIconButtonTargetSize: SmallIconButtonStory =
	{
		parameters: {
			a11y: {
				test: "error",
				// target-size (WCAG 2.5.8) is off in axe by default
				options: { runOnly: { type: "rule", values: ["target-size"] } },
			},
			docs: {
				description: {
					story:
						"ISSUE-3459-ITEM-13: with small icons, `SmallestIconButton`s are 20x20 and closer together than 24px (axe `target-size`).",
				},
			},
		},
		render: () => (
			<div style={{ display: "flex", alignItems: "center" }}>
				<SmallestIconButton aria-label={"Edit filter"}>
					<TuneIcon fontSize={"small"} />
				</SmallestIconButton>
				<SmallestIconButton aria-label={"Delete filter"}>
					<DeleteIcon fontSize={"small"} />
				</SmallestIconButton>
			</div>
		),
	};

export const Issue3459Item13SmallestIconButtonMinimumSize: SmallIconButtonStory =
	{
		parameters: {
			a11y: { test: "error" },
			docs: {
				description: {
					story:
						"ISSUE-3459-ITEM-13: a `SmallestIconButton` is at least 24x24, with the icon centered in it; a default or larger icon sets the size itself.",
				},
			},
		},
		render: () => (
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<SmallestIconButton aria-label={"Default"}>
					<HomeIcon />
				</SmallestIconButton>
				<SmallestIconButton aria-label={"Small"}>
					<HomeIcon fontSize={"small"} />
				</SmallestIconButton>
				<SmallestIconButton aria-label={"Inherit (size small)"} size={"small"}>
					<HomeIcon fontSize={"inherit"} />
				</SmallestIconButton>
				<SmallestIconButton aria-label={"14px"}>
					<HomeIcon sx={{ fontSize: 14 }} />
				</SmallestIconButton>
				<SmallestIconButton aria-label={"Large"}>
					<HomeIcon fontSize={"large"} />
				</SmallestIconButton>
			</div>
		),
		play: async ({ canvas }) => {
			const box = (name: string) => {
				const rect = canvas
					.getByRole("button", { name })
					.getBoundingClientRect();
				return [rect.width, rect.height];
			};
			await expect(box("Default")).toEqual([24, 24]);
			await expect(box("Small")).toEqual([24, 24]);
			await expect(box("Inherit (size small)")).toEqual([24, 24]);
			await expect(box("14px")).toEqual([24, 24]);
			await expect(box("Large")).toEqual([35, 35]);
			// the icon is centered in the larger box
			const button = canvas.getByRole("button", { name: "14px" });
			const icon = button.querySelector("svg")!.getBoundingClientRect();
			const outer = button.getBoundingClientRect();
			await expect(icon.left - outer.left).toBe(outer.right - icon.right);
			await expect(icon.top - outer.top).toBe(outer.bottom - icon.bottom);
		},
	};

export const Issue3459Item15SmallIconButtonTargetSize: SmallIconButtonStory = {
	parameters: {
		a11y: {
			test: "error",
			// target-size (WCAG 2.5.8) is off in axe by default
			options: { runOnly: { type: "rule", values: ["target-size"] } },
		},
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-15: with icons smaller than 16px, `SmallIconButton`s are 22x22 and closer together than 24px (axe `target-size`).",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", alignItems: "center" }}>
			<SmallIconButton aria-label={"Edit filter"}>
				<TuneIcon sx={{ fontSize: 14 }} />
			</SmallIconButton>
			<SmallIconButton aria-label={"Delete filter"}>
				<DeleteIcon sx={{ fontSize: 14 }} />
			</SmallIconButton>
		</div>
	),
};

export const Issue3459Item15SmallIconButtonMinimumSize: SmallIconButtonStory = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-15: a `SmallIconButton` is at least 24x24, with the icon centered in it; an icon of 16px or more sets the size itself, with 4px padding around it.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
			<SmallIconButton aria-label={"Default"}>
				<HomeIcon />
			</SmallIconButton>
			<SmallIconButton aria-label={"Small"}>
				<HomeIcon fontSize={"small"} />
			</SmallIconButton>
			<SmallIconButton aria-label={"Inherit (size small)"} size={"small"}>
				<HomeIcon fontSize={"inherit"} />
			</SmallIconButton>
			<SmallIconButton aria-label={"16px"}>
				<HomeIcon sx={{ fontSize: 16 }} />
			</SmallIconButton>
			<SmallIconButton aria-label={"14px"}>
				<HomeIcon sx={{ fontSize: 14 }} />
			</SmallIconButton>
			<SmallIconButton aria-label={"Large"}>
				<HomeIcon fontSize={"large"} />
			</SmallIconButton>
		</div>
	),
	play: async ({ canvas }) => {
		const box = (name: string) => {
			const rect = canvas.getByRole("button", { name }).getBoundingClientRect();
			return [rect.width, rect.height];
		};
		await expect(box("Default")).toEqual([32, 32]);
		await expect(box("Small")).toEqual([28, 28]);
		await expect(box("Inherit (size small)")).toEqual([26, 26]);
		await expect(box("16px")).toEqual([24, 24]);
		await expect(box("14px")).toEqual([24, 24]);
		await expect(box("Large")).toEqual([43, 43]);
		// the icon is centered in the larger box
		const button = canvas.getByRole("button", { name: "14px" });
		const icon = button.querySelector("svg")!.getBoundingClientRect();
		const outer = button.getBoundingClientRect();
		await expect(icon.left - outer.left).toBe(outer.right - icon.right);
		await expect(icon.top - outer.top).toBe(outer.bottom - icon.bottom);
	},
};

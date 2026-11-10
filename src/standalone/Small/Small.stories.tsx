import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { List, ListItemText } from "@mui/material";
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

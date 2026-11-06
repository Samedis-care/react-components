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

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { List, ListItemText } from "@mui/material";
import {
	Home as HomeIcon,
	Settings as SettingsIcon,
} from "@mui/icons-material";
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

import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, within } from "storybook/test";
import { Button, MenuItem } from "@mui/material";
import PopupMenu from "./index";

const meta: Meta<typeof PopupMenu> = {
	title: "Standalone/PopupMenu",
	component: PopupMenu,
	parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof PopupMenu>;

const OpenMenuDemo = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const open = Boolean(anchorEl);

	return (
		<>
			<Button variant="contained" onClick={(e) => setAnchorEl(e.currentTarget)}>
				Open Menu
			</Button>
			<PopupMenu
				open={open}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
			>
				<MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
				<MenuItem onClick={() => setAnchorEl(null)}>Settings</MenuItem>
				<MenuItem onClick={() => setAnchorEl(null)}>Logout</MenuItem>
			</PopupMenu>
		</>
	);
};

export const Default: Story = {
	render: () => <OpenMenuDemo />,
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		// Click button to open
		await userEvent.click(
			await canvas.findByRole("button", { name: "Open Menu" }),
		);
		// Menu items should appear (MUI Menu renders in a portal)
		const profileItem = await body.findByRole(
			"menuitem",
			{ name: "Profile" },
			{ timeout: 5000 },
		);
		await expect(profileItem).toBeInTheDocument();
		await expect(
			body.getByRole("menuitem", { name: "Settings" }),
		).toBeInTheDocument();
		await expect(
			body.getByRole("menuitem", { name: "Logout" }),
		).toBeInTheDocument();
		// Click an item to close
		await userEvent.click(profileItem);
	},
};

const OpenByDefaultDemo = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Open on mount by setting the ref after first render
	const handleRef = (el: HTMLButtonElement | null) => {
		(buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current =
			el;
		if (el && !anchorEl) {
			setAnchorEl(el);
		}
	};

	return (
		<>
			<Button variant="outlined" ref={handleRef}>
				Anchor Button
			</Button>
			<PopupMenu
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
			>
				<MenuItem>Cut</MenuItem>
				<MenuItem>Copy</MenuItem>
				<MenuItem>Paste</MenuItem>
				<MenuItem disabled>Undo</MenuItem>
			</PopupMenu>
		</>
	);
};

export const OpenWithItems: Story = {
	render: () => <OpenByDefaultDemo />,
};

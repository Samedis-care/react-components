import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button, MenuItem, MenuProps } from "@mui/material";
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
		buttonRef.current = el;
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

// --- keyboard, focus, dialogs ---

interface MenuDemoProps {
	/** called with the label of the activated item */
	onSelect: (label: string) => void;
	/** called with the close reason */
	onClose: (reason: string) => void;
	labels?: string[];
	disabledLabels?: string[];
	keepMounted?: boolean;
	triggerLabel?: string;
	menuProps?: Partial<MenuProps>;
}

const MenuDemo = (props: MenuDemoProps) => {
	const {
		onSelect,
		onClose,
		labels = ["Alpha", "Beta", "Gamma", "Settings"],
		disabledLabels = ["Beta"],
		keepMounted,
		triggerLabel = "Options",
		menuProps,
	} = props;
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);
	return (
		<>
			<Button
				id={"menu-demo-trigger"}
				aria-haspopup={"menu"}
				aria-controls={open ? "menu-demo" : undefined}
				aria-expanded={open}
				onClick={(e) => setAnchorEl(e.currentTarget)}
			>
				{triggerLabel}
			</Button>
			<PopupMenu
				elevation={0}
				keepMounted={keepMounted}
				anchorEl={anchorEl}
				open={open}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				transformOrigin={{ vertical: "top", horizontal: "center" }}
				onClose={(_evt, reason) => {
					onClose(reason);
					setAnchorEl(null);
				}}
				slotProps={{
					list: { id: "menu-demo", "aria-labelledby": "menu-demo-trigger" },
				}}
				{...menuProps}
			>
				{labels.map((label) => (
					<MenuItem
						key={label}
						disabled={disabledLabels.includes(label)}
						onClick={() => {
							onSelect(label);
							setAnchorEl(null);
						}}
					>
						{label}
					</MenuItem>
				))}
			</PopupMenu>
		</>
	);
};

type MenuDemoStory = StoryObj<typeof MenuDemo>;

// --- bugs ---

export const Issue3459Item8FocusedItemShowsFocusRing: MenuDemoStory = {
	args: { onSelect: fn(), onClose: fn() },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-8: the keyboard-focused item is only tinted (`action.focus`, 1.33:1) and shows nothing in forced colors. Expected: a focus outline.",
			},
		},
	},
	render: (args) => <MenuDemo {...args} />,
	play: async ({ canvas }) => {
		await userEvent.tab();
		await expect(canvas.getByRole("button", { name: "Options" })).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		const alpha = await within(document.body).findByRole("menuitem", {
			name: "Alpha",
		});
		await waitFor(() => expect(alpha).toHaveFocus());
		await waitFor(() => expect(alpha).toHaveClass("Mui-focusVisible"));
		const style = getComputedStyle(alpha);
		await expect(style.outlineStyle).not.toBe("none");
		await expect(style.outlineColor).not.toBe("rgba(0, 0, 0, 0)");
	},
};

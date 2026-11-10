import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Box, Button, MenuItem, MenuProps } from "@mui/material";
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

const menuItem = (name: string) =>
	within(document.body).getByRole("menuitem", { name });
const menuClosed = () =>
	waitFor(() =>
		expect(within(document.body).queryByRole("menu")).not.toBeInTheDocument(),
	);

// --- bugs ---

const DefaultsDemo = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);
	return (
		// away from the viewport's edges, which MUI keeps the menu 16px off
		<Box sx={{ p: 8 }}>
			<Button
				id={"defaults-demo-trigger"}
				aria-haspopup={"menu"}
				aria-controls={open ? "defaults-demo" : undefined}
				aria-expanded={open}
				onClick={(e) => setAnchorEl(e.currentTarget)}
			>
				Options
			</Button>
			<PopupMenu
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				slotProps={{
					list: {
						id: "defaults-demo",
						"aria-labelledby": "defaults-demo-trigger",
					},
				}}
			>
				<MenuItem onClick={() => setAnchorEl(null)}>Alpha</MenuItem>
				<MenuItem onClick={() => setAnchorEl(null)}>Beta</MenuItem>
			</PopupMenu>
		</Box>
	);
};

export const Issue3459Item7FlatWithMuiPlacementByDefault: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-7: without props, PopupMenu is flat (its border is the only outline, no shadow), opens below its trigger aligned at the trigger's start edge, and removes its items from the page when it closes, as MUI's `Menu` does.",
			},
		},
	},
	render: () => <DefaultsDemo />,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", { name: "Options" });
		await userEvent.click(trigger);
		const alpha = await within(document.body).findByRole("menuitem", {
			name: "Alpha",
		});
		const paper = alpha.closest<HTMLElement>(".MuiMenu-paper")!;
		// the Grow transition scales the paper until it has entered
		await waitFor(() => expect(getComputedStyle(paper).transform).toBe("none"));
		const style = getComputedStyle(paper);
		await expect(style.borderTopWidth).toBe("1px");
		await expect(style.borderTopStyle).toBe("solid");
		await expect(style.boxShadow).toBe("none");

		const triggerBox = trigger.getBoundingClientRect();
		const paperBox = paper.getBoundingClientRect();
		await expect(Math.abs(paperBox.top - triggerBox.bottom)).toBeLessThan(1);
		await expect(Math.abs(paperBox.left - triggerBox.left)).toBeLessThan(1);

		await userEvent.keyboard("{Escape}");
		// by text: a hidden item has no accessible name to find it by
		await waitFor(() =>
			expect(
				within(document.body).queryByText("Alpha"),
			).not.toBeInTheDocument(),
		);
		await waitFor(() => expect(trigger).toHaveFocus());
	},
};

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

export const Issue3459Item9KeepMountedReopensOnFirstItem: MenuDemoStory = {
	args: {
		onSelect: fn(),
		onClose: fn(),
		keepMounted: true,
		labels: ["One", "Two", "Three", "Four"],
		disabledLabels: [],
	},
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-9: with `keepMounted` (as in every DataGrid menu), a menu that was closed on its third item opens on the third item again. Expected: every open starts on the first item.",
			},
		},
	},
	render: (args) => <MenuDemo {...args} />,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", { name: "Options" });
		await userEvent.click(trigger);
		await waitFor(() => expect(menuItem("One")).toHaveFocus());
		await userEvent.keyboard("{ArrowDown}{ArrowDown}");
		await expect(menuItem("Three")).toHaveFocus();
		await userEvent.keyboard("{Escape}");
		await menuClosed();
		await waitFor(() => expect(trigger).toHaveFocus());

		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(within(document.body).getByRole("menu")).toBeVisible(),
		);
		await waitFor(() => expect(menuItem("One")).toHaveFocus());
	},
};

const CountingItem = () => {
	const [count, setCount] = useState(0);
	return (
		<MenuItem onClick={() => setCount((prev) => prev + 1)}>
			{`Count ${count}`}
		</MenuItem>
	);
};

interface KeepMountedDemoProps {
	/** called with the label of the activated item */
	onSelect: (label: string) => void;
	variant?: MenuProps["variant"];
	/** label of the selected item */
	selectedLabel?: string;
	/** labels of the items after the counting one */
	labels?: string[];
	disabledLabels?: string[];
}

const KeepMountedDemo = (props: KeepMountedDemoProps) => {
	const {
		onSelect,
		variant,
		selectedLabel,
		labels = ["Two", "Three"],
		disabledLabels = [],
	} = props;
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	return (
		<>
			<Button onClick={(e) => setAnchorEl(e.currentTarget)}>Options</Button>
			<PopupMenu
				elevation={0}
				keepMounted
				variant={variant}
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
			>
				<CountingItem />
				{labels.map((label) => (
					<MenuItem
						key={label}
						selected={label === selectedLabel}
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

export const Issue3459Item9KeepMountedReopensOnFirstItemAfterActivation: StoryObj<
	typeof KeepMountedDemo
> = {
	args: { onSelect: fn() },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-9: an item activated with Enter has focus when the menu closes. The menu reopens on the first item, and the items keep their state (the first one counts its clicks without closing the menu).",
			},
		},
	},
	render: (args) => <KeepMountedDemo {...args} />,
	play: async ({ args, canvas }) => {
		const trigger = canvas.getByRole("button", { name: "Options" });
		await userEvent.tab();
		await expect(trigger).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(menuItem("Count 0")).toHaveFocus());
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(menuItem("Count 1")).toHaveFocus());
		await userEvent.keyboard("{ArrowDown}{ArrowDown}");
		await expect(menuItem("Three")).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(args.onSelect).toHaveBeenCalledWith("Three");
		await menuClosed();
		await waitFor(() => expect(trigger).toHaveFocus());

		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(within(document.body).getByRole("menu")).toBeVisible(),
		);
		await waitFor(() => expect(menuItem("Count 1")).toHaveFocus());
	},
};

export const Issue3459Item9KeepMountedReopensOnSelectedItem: StoryObj<
	typeof KeepMountedDemo
> = {
	args: { onSelect: fn(), selectedLabel: "Two", labels: ["Two", "Three"] },
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-9: with the default variant `selectedMenu`, every open starts on the selected item, as the first one does.",
			},
		},
	},
	render: (args) => <KeepMountedDemo {...args} />,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", { name: "Options" });
		await userEvent.click(trigger);
		await waitFor(() => expect(menuItem("Two")).toHaveFocus());
		await userEvent.keyboard("{ArrowDown}");
		await expect(menuItem("Three")).toHaveFocus();
		await userEvent.keyboard("{Escape}");
		await menuClosed();
		await waitFor(() => expect(trigger).toHaveFocus());

		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(within(document.body).getByRole("menu")).toBeVisible(),
		);
		await waitFor(() => expect(menuItem("Two")).toHaveFocus());
	},
};

export const Issue3459Item9KeepMountedMenuVariantReopensOnFirstEnabledItem: StoryObj<
	typeof KeepMountedDemo
> = {
	args: {
		onSelect: fn(),
		variant: "menu",
		selectedLabel: "Three",
		labels: ["Two", "Three", "Four"],
	},
	parameters: {
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-9: with variant `menu`, a selected item does not decide where an open starts; every open starts on the first item.",
			},
		},
	},
	render: (args) => <KeepMountedDemo {...args} />,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", { name: "Options" });
		await userEvent.click(trigger);
		await waitFor(() => expect(menuItem("Count 0")).toHaveFocus());
		await userEvent.keyboard("{End}");
		await expect(menuItem("Four")).toHaveFocus();
		await userEvent.keyboard("{Escape}");
		await menuClosed();
		await waitFor(() => expect(trigger).toHaveFocus());

		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(within(document.body).getByRole("menu")).toBeVisible(),
		);
		await waitFor(() => expect(menuItem("Count 0")).toHaveFocus());
	},
};

export const Issue3459Item9KeepMountedReopensOnFirstEnabledItem: MenuDemoStory =
	{
		args: {
			onSelect: fn(),
			onClose: fn(),
			keepMounted: true,
			labels: ["Zero", "One", "Two", "Three"],
			disabledLabels: ["Zero"],
		},
		parameters: {
			docs: {
				description: {
					story:
						"ISSUE-3459-ITEM-9: every open starts on the first enabled item; a disabled first item is skipped.",
				},
			},
		},
		render: (args) => <MenuDemo {...args} />,
		play: async ({ canvas }) => {
			const trigger = canvas.getByRole("button", { name: "Options" });
			await userEvent.click(trigger);
			await waitFor(() => expect(menuItem("One")).toHaveFocus());
			await userEvent.keyboard("{End}");
			await expect(menuItem("Three")).toHaveFocus();
			await userEvent.keyboard("{Escape}");
			await menuClosed();
			await waitFor(() => expect(trigger).toHaveFocus());

			await userEvent.keyboard("{Enter}");
			await waitFor(() =>
				expect(within(document.body).getByRole("menu")).toBeVisible(),
			);
			await waitFor(() => expect(menuItem("One")).toHaveFocus());
		},
	};

import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import {
	Box,
	Button,
	createTheme,
	ListItemIcon,
	ListItemText,
	MenuItem,
	MenuProps,
	ThemeProvider,
	Typography,
} from "@mui/material";
import PopupMenu from "./index";
import { ContentCopy, Description } from "@mui/icons-material";

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

// The right edge of a 320px window's 16px margin. MUI's Popover rounds the paper's position
// to whole pixels, so a paper with a fractional width can end up to half a pixel past it.
const PHONE_MARGIN_RIGHT = 304.5;

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

export const Issue3459Item10LongLabelsReadableOnPhone: MenuDemoStory = {
	args: {
		onSelect: fn(),
		onClose: fn(),
		// the French DataGrid reset menu
		labels: [
			"Recharger",
			"Réinitialiser le filtre",
			"Réinitialiser les paramètres de tri",
			"Réinitialiser les paramètres de la colonne",
			"Réinitialiser les largeurs de colonne",
			"Effacer tout",
		],
		disabledLabels: [],
		triggerLabel: "Réinitialiser",
	},
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-10: at 320px the paper is 288px wide; long labels are cut off without an ellipsis and cannot be scrolled into view. Expected: every label is readable.",
			},
		},
	},
	render: (args) => <MenuDemo {...args} />,
	play: async ({ canvas }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: "Réinitialiser" }),
		);
		const items = await within(document.body).findAllByRole("menuitem");
		await expect(items).toHaveLength(6);
		const paperEl = items[0].closest<HTMLElement>(".MuiMenu-paper")!;
		// the Grow transition scales the paper until it has entered
		await waitFor(() =>
			expect(getComputedStyle(paperEl).transform).toBe("none"),
		);
		const paper = paperEl.getBoundingClientRect();
		await expect(paper.left).toBeGreaterThanOrEqual(16);
		await expect(paper.right).toBeLessThanOrEqual(PHONE_MARGIN_RIGHT);
		const clipped = items
			.filter((item) => item.scrollWidth > item.clientWidth)
			.map((item) => item.textContent);
		await expect(clipped).toEqual([]);
	},
};

const resetLabels = {
	en: [
		"Refresh",
		"Reset filter",
		"Reset sort settings",
		"Reset column settings",
		"Reset column widths",
		"Reset all",
	],
	fr: [
		"Recharger",
		"Réinitialiser le filtre",
		"Réinitialiser les paramètres de tri",
		"Réinitialiser les paramètres de la colonne",
		"Réinitialiser les largeurs de colonne",
		"Effacer tout",
	],
};

const LanguageSwitchDemo = () => {
	const [language, setLanguage] = useState<keyof typeof resetLabels>("en");
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);
	return (
		<Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
			<Button onClick={() => setLanguage("fr")}>Français</Button>
			<Button
				id={"language-demo-trigger"}
				aria-haspopup={"menu"}
				aria-controls={open ? "language-demo" : undefined}
				aria-expanded={open}
				onClick={(e) => setAnchorEl(e.currentTarget)}
			>
				Reset
			</Button>
			<PopupMenu
				keepMounted
				anchorEl={anchorEl}
				open={open}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				transformOrigin={{ vertical: "top", horizontal: "center" }}
				onClose={() => setAnchorEl(null)}
				slotProps={{
					list: {
						id: "language-demo",
						"aria-labelledby": "language-demo-trigger",
					},
				}}
			>
				{resetLabels[language].map((label) => (
					<MenuItem key={label} onClick={() => setAnchorEl(null)}>
						{label}
					</MenuItem>
				))}
			</PopupMenu>
		</Box>
	);
};

export const Issue3459Item10KeepMountedMenuWidensForLongerLabels: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-10: a menu kept mounted (as every DataGrid menu) keeps its position between opens. After its labels got longer (here another language), it opens as wide as they need, up to 288px at 320px, and is moved left to fit, rather than wrapping them into the room right of its old position.",
			},
		},
	},
	render: () => <LanguageSwitchDemo />,
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole("button", { name: "Reset" });
		const openedPaper = async () => {
			await userEvent.click(trigger);
			const items = await within(document.body).findAllByRole("menuitem");
			const paper = items[0].closest<HTMLElement>(".MuiMenu-paper")!;
			// the Grow transition scales the paper until it has entered
			await waitFor(() =>
				expect(getComputedStyle(paper).transform).toBe("none"),
			);
			return { items, paper: paper.getBoundingClientRect() };
		};

		// the English labels fit, so the menu sits right of the window's margin
		const english = await openedPaper();
		await expect(english.paper.left).toBeGreaterThan(16);
		await expect(english.paper.right).toBeLessThanOrEqual(PHONE_MARGIN_RIGHT);
		await userEvent.keyboard("{Escape}");
		await menuClosed();

		await userEvent.click(canvas.getByRole("button", { name: "Français" }));
		const french = await openedPaper();
		await expect(french.items[3]).toHaveTextContent(
			"Réinitialiser les paramètres de la colonne",
		);
		await expect(french.paper.left).toBeGreaterThanOrEqual(16);
		await expect(french.paper.right).toBeLessThanOrEqual(PHONE_MARGIN_RIGHT);
		await expect(french.paper.width).toBeCloseTo(288, 0);
		const clipped = french.items
			.filter((item) => item.scrollWidth > item.clientWidth)
			.map((item) => item.textContent);
		await expect(clipped).toEqual([]);
	},
};

// an app's theme ring, as MUI's createTheme({ focusVisible }) takes it
const GREEN_RING = createTheme({
	focusVisible: { outlineColor: "rgb(0, 128, 0)" },
});

export const Issue3459Item14ThemeFocusVisibleRing: MenuDemoStory = {
	args: { onSelect: fn(), onClose: fn() },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-14: a theme that sets MUI's `focusVisible` ring (here `outlineColor: rgb(0, 128, 0)`) styles the keyboard-focused item's ring, as in every MUI `Menu`.",
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
		await expect(getComputedStyle(alpha).outlineColor).toBe("rgb(0, 128, 0)");
	},
};

// one German compound word, wider than a menu item's text at 320px
const longWord = "Medizinproduktebetreiberverordnungsprüfung";

interface LongWordDemoProps {
	/** called with the index of the activated item */
	onSelect: (index: number) => void;
}

const LongWordDemo = (props: LongWordDemoProps) => {
	const { onSelect } = props;
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);
	const select = (index: number) => {
		onSelect(index);
		setAnchorEl(null);
	};
	return (
		<>
			<Button
				id={"long-word-demo-trigger"}
				aria-haspopup={"menu"}
				aria-controls={open ? "long-word-demo" : undefined}
				aria-expanded={open}
				onClick={(e) => setAnchorEl(e.currentTarget)}
			>
				Actions
			</Button>
			<PopupMenu
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				slotProps={{
					list: {
						id: "long-word-demo",
						"aria-labelledby": "long-word-demo-trigger",
					},
				}}
			>
				{/* the item's own text, as DataGrid's reset menu and FilesGrid's file list */}
				<MenuItem onClick={() => select(0)}>{longWord}</MenuItem>
				{/* the item's own text after an icon, as DataGrid's data actions */}
				<MenuItem onClick={() => select(1)}>
					<ListItemIcon>
						<Description fontSize={"small"} />
					</ListItemIcon>
					{longWord}
				</MenuItem>
				{/* a ListItemText with a shortcut hint, as in MUI's menu demos */}
				<MenuItem onClick={() => select(2)}>
					<ListItemIcon>
						<ContentCopy fontSize={"small"} />
					</ListItemIcon>
					<ListItemText>{longWord}</ListItemText>
					<Typography variant={"body2"} sx={{ color: "text.secondary" }}>
						Ctrl+Shift+C
					</Typography>
				</MenuItem>
			</PopupMenu>
		</>
	);
};

/**
 * The line boxes of the text nodes in an element
 * @param element The element whose text is measured
 * @returns Per text node with text, its content and one rectangle per line
 */
const textLines = (element: HTMLElement) => {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	const lines: { text: string; rects: DOMRect[] }[] = [];
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		if (!node.textContent?.trim()) continue;
		const range = document.createRange();
		range.selectNodeContents(node);
		lines.push({
			text: node.textContent,
			rects: Array.from(range.getClientRects()),
		});
	}
	return lines;
};

/**
 * The texts of a menu item that reach past its padding, into the part the
 * paper cuts off
 * @param item The menu item
 * @returns The content of each text node that does not fit
 */
const textOutsideItem = (item: HTMLElement) => {
	const box = item.getBoundingClientRect();
	const style = getComputedStyle(item);
	const left = box.left + parseFloat(style.paddingLeft);
	const right = box.right - parseFloat(style.paddingRight);
	return textLines(item)
		.filter(({ rects }) =>
			rects.some((rect) => rect.left < left - 0.5 || rect.right > right + 0.5),
		)
		.map(({ text }) => text);
};

export const Issue3459Item16LongWordReadableOnPhone: StoryObj<
	typeof LongWordDemo
> = {
	args: { onSelect: fn() },
	globals: { viewport: { value: "mobile1", isRotated: false } },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3459-ITEM-16: at 320px, a word wider than an item's text (here a 42-character German compound) stays on one line and is cut off without an ellipsis: as the item's own text, after an icon (as DataGrid's data actions) and in a `ListItemText`. Expected: the word breaks onto more lines where it does not fit on a line of its own, and the shortcut hint beside it keeps its words whole.",
			},
		},
	},
	render: (args) => <LongWordDemo {...args} />,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
		const items = await within(document.body).findAllByRole("menuitem");
		await expect(items).toHaveLength(3);
		const paperEl = items[0].closest<HTMLElement>(".MuiMenu-paper")!;
		// the Grow transition scales the paper until it has entered
		await waitFor(() =>
			expect(getComputedStyle(paperEl).transform).toBe("none"),
		);
		const paper = paperEl.getBoundingClientRect();
		await expect(paper.left).toBeGreaterThanOrEqual(16);
		await expect(paper.right).toBeLessThanOrEqual(PHONE_MARGIN_RIGHT);
		await expect(items.flatMap(textOutsideItem)).toEqual([]);
		// the word is longer than a line in every item, so the test covers it
		const wordLines = items.map(
			(item) =>
				textLines(item).find(({ text }) => text === longWord)!.rects.length,
		);
		await expect(wordLines.every((count) => count > 1)).toBe(true);
		const hint = textLines(items[2]).find(
			({ text }) => text === "Ctrl+Shift+C",
		)!;
		await expect(hint.rects).toHaveLength(1);
	},
};

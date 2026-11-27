import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	BarChart as BarChartIcon,
	Dashboard as DashboardIcon,
	People as PeopleIcon,
	Settings as SettingsIcon,
} from "@mui/icons-material";
import {
	Box,
	Button,
	createTheme,
	List,
	Paper,
	Theme,
	ThemeProvider,
	Typography,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import PortalLayout, { PortalLayoutContext, PortalLayoutProps } from "./Layout";
import MenuBase from "./Menu";
import CollapsibleMenu from "./CollapsibleMenu";
import {
	JumboReactDarkMenuItem,
	JumboReactLightMenuItem,
	MaterialMenuItem,
} from "./MenuItem";
import type { IMenuItemDefinition, MenuItemComponent } from "./Menu";
import { createMemoryHistory } from "history";
import HistoryRouter from "../Routes/HistoryRouter";
import Routes from "../Routes/Routes";
import Route from "../Routes/Route";
import Link from "../Routes/Link";

// Provide a PortalLayoutContext so CollapsibleMenu doesn't throw
const MockPortalLayoutProvider = ({
	mobile = false,
	children,
}: {
	mobile?: boolean;
	children: React.ReactNode;
}) => {
	const [menuOpen, setMenuOpen] = React.useState(false);
	return (
		<PortalLayoutContext.Provider value={{ mobile, menuOpen, setMenuOpen }}>
			{children}
		</PortalLayoutContext.Provider>
	);
};

const menuDefinition: IMenuItemDefinition[] = [
	{
		title: "Dashboard",
		icon: DashboardIcon,
		onClick: () => {},
		shouldRender: true,
	},
	{
		title: "Reports",
		icon: BarChartIcon,
		onClick: () => {},
		shouldRender: true,
		children: [
			{
				title: "Monthly",
				onClick: () => {},
				shouldRender: true,
			},
			{
				title: "Annual",
				onClick: () => {},
				shouldRender: true,
			},
		],
	},
	{
		title: "Users",
		icon: PeopleIcon,
		onClick: () => {},
		shouldRender: true,
	},
	{
		title: "Settings",
		icon: SettingsIcon,
		onClick: () => {},
		shouldRender: true,
	},
	{
		title: "Hidden Item",
		onClick: () => {},
		shouldRender: false,
	},
];

const menuDefinitionForceExpand: IMenuItemDefinition[] = [
	{
		title: "Reports",
		icon: BarChartIcon,
		onClick: () => {},
		shouldRender: true,
		forceExpand: true,
		children: [
			{
				title: "Monthly",
				onClick: () => {},
				shouldRender: true,
			},
			{
				title: "Annual",
				onClick: () => {},
				shouldRender: true,
			},
		],
	},
	{
		title: "Settings",
		icon: SettingsIcon,
		onClick: () => {},
		shouldRender: true,
	},
];

const noop = () => {};

const longTitleDefinition: IMenuItemDefinition[] = [
	{ title: "Dashboard", onClick: noop, shouldRender: true },
	{
		title: "A very long menu title ".repeat(12).trim(),
		onClick: noop,
		shouldRender: true,
	},
];

const SimpleWrapper = ({ children }: { children: React.ReactNode }) => (
	<List>{children}</List>
);

const NavWrapper = ({ children }: { children: React.ReactNode }) => (
	<List component={"nav"} aria-label={"Main menu"}>
		{children}
	</List>
);

const menu = (
	definition: IMenuItemDefinition[] = menuDefinition,
	menuItem: MenuItemComponent = MaterialMenuItem,
) => (
	<MenuBase
		definition={definition}
		wrapper={SimpleWrapper}
		menuItem={menuItem}
	/>
);

const pageTitle = (text = "Page Title") => (
	<Typography variant="h6" style={{ flexGrow: 1 }}>
		{text}
	</Typography>
);

const MOBILE = { viewport: { value: "mobile1", isRotated: false } };

// Axe in error mode, minus two rules the open drawer breaks until their items are
// fixed (drop each rule with its fix): the drawer is an unnamed modal dialog
// ("aria-dialog-name", ISSUE-3479-ITEM-13), and with MUI List as the wrapper the
// entries are `ul > div[role=button]` ("list", ISSUE-3479-ITEM-19).
const A11Y_OPEN_DRAWER_EXCEPTION = {
	test: "error",
	config: {
		rules: [
			{ id: "aria-dialog-name", enabled: false },
			{ id: "list", enabled: false },
		],
	},
} as const;

const meta: Meta<typeof PortalLayout> = {
	title: "Standalone/Portal/PortalLayout",
	component: PortalLayout,
	parameters: { layout: "fullscreen" },
};
export default meta;

type LayoutArgs = Partial<
	Pick<
		PortalLayoutProps,
		| "drawerWidth"
		| "collapseMenu"
		| "collapseBreakpoint"
		| "mobileViewCondition"
	>
>;

type LayoutStory = StoryObj<LayoutArgs>;

type Story = StoryObj<typeof PortalLayout>;

// WCAG contrast of two computed colors; fg may be translucent over an opaque bg
type Rgba = { r: number; g: number; b: number; a: number };

const parseColor = (color: string): Rgba => {
	const m = /rgba?\(([^)]+)\)/.exec(color);
	if (!m) throw new Error(`cannot parse color ${color}`);
	const [r, g, b, a = 1] = m[1]
		.split(/[\s,/]+/)
		.filter(Boolean)
		.map(Number);
	return { r, g, b, a };
};

const luminance = ({ r, g, b }: Rgba) => {
	const channel = (v: number) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (fgColor: string, bgColor: string) => {
	const fg = parseColor(fgColor);
	const bg = parseColor(bgColor);
	const blended = {
		r: fg.r * fg.a + bg.r * (1 - fg.a),
		g: fg.g * fg.a + bg.g * (1 - fg.a),
		b: fg.b * fg.a + bg.b * (1 - fg.a),
		a: 1,
	};
	const [hi, lo] = [luminance(blended), luminance(bg)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

const fullHeight = { height: "100vh" };

const drawerRoot = () => {
	const el = document.querySelector<HTMLElement>(".MuiDrawer-root");
	if (!el) throw new Error("no drawer rendered");
	return el;
};

const drawerPaper = () => {
	const el = drawerRoot().querySelector<HTMLElement>(".MuiDrawer-paper");
	if (!el) throw new Error("no drawer paper rendered");
	return el;
};

// hidden: true, because an open drawer hides the rest of the page from AT
const burgerIn = (canvasElement: HTMLElement) =>
	within(canvasElement).getByRole("button", {
		name: "Toggle menu",
		hidden: true,
	});

const openDrawer = async (canvasElement: HTMLElement) => {
	await userEvent.click(burgerIn(canvasElement));
	await waitFor(() => expect(drawerRoot()).not.toHaveAttribute("aria-hidden"));
	// the slide-in is over
	await waitFor(() => expect(drawerPaper().getBoundingClientRect().x).toBe(0));
};

export const BasicLayout: Story = {
	render: () => (
		<div style={{ height: "100vh" }}>
			<PortalLayout
				variant="basic"
				topLeft={
					<div style={{ padding: 8, fontWeight: "bold", fontSize: 20 }}>
						MyApp
					</div>
				}
				headerContent={
					<Typography variant="h6" style={{ flexGrow: 1 }}>
						Page Title
					</Typography>
				}
				menuContent={
					<MenuBase
						definition={menuDefinition}
						wrapper={SimpleWrapper}
						menuItem={MaterialMenuItem}
					/>
				}
				content={
					<div style={{ padding: 24 }}>
						<Typography variant="h4">Main Content</Typography>
						<Typography>This is the main content area.</Typography>
					</div>
				}
			/>
		</div>
	),
};

export const NoTopLeftLayout: Story = {
	render: () => (
		<div style={{ height: "100vh" }}>
			<PortalLayout
				variant="no-top-left"
				headerContent={
					<Typography variant="h6" style={{ flexGrow: 1 }}>
						Page Title
					</Typography>
				}
				menuContent={
					<MenuBase
						definition={menuDefinition}
						wrapper={SimpleWrapper}
						menuItem={MaterialMenuItem}
					/>
				}
				content={
					<div style={{ padding: 24 }}>
						<Typography variant="h4">Main Content</Typography>
					</div>
				}
			/>
		</div>
	),
};

export const CollapsedMobileLayout: Story = {
	render: () => (
		<div style={{ height: "100vh" }}>
			<PortalLayout
				variant="basic"
				topLeft={<div style={{ padding: 8, fontWeight: "bold" }}>MyApp</div>}
				headerContent={
					<Typography variant="h6" style={{ flexGrow: 1 }}>
						Mobile View
					</Typography>
				}
				menuContent={
					<MenuBase
						definition={menuDefinition}
						wrapper={SimpleWrapper}
						menuItem={MaterialMenuItem}
					/>
				}
				content={
					<div style={{ padding: 24 }}>
						<Typography>Content area (menu collapsed)</Typography>
					</div>
				}
				collapseMenu
			/>
		</div>
	),
};

export const MenuBaseStory: Story = {
	render: () => (
		<div style={{ width: 280 }}>
			<MenuBase
				definition={menuDefinition}
				wrapper={SimpleWrapper}
				menuItem={MaterialMenuItem}
			/>
		</div>
	),
};

export const MenuBaseForceExpanded: Story = {
	render: () => (
		<div style={{ width: 280 }}>
			<MenuBase
				definition={menuDefinitionForceExpand}
				wrapper={SimpleWrapper}
				menuItem={MaterialMenuItem}
			/>
		</div>
	),
};

export const CollapsibleMenuExpanded: Story = {
	render: () => (
		<div style={{ height: 400, display: "flex" }}>
			<MockPortalLayoutProvider mobile={false}>
				<CollapsibleMenu width={240}>
					<MenuBase
						definition={menuDefinition}
						wrapper={SimpleWrapper}
						menuItem={MaterialMenuItem}
					/>
				</CollapsibleMenu>
			</MockPortalLayoutProvider>
		</div>
	),
};

export const CollapsibleMenuMobile: Story = {
	render: () => (
		<div style={{ height: 400, display: "flex" }}>
			<MockPortalLayoutProvider mobile={true}>
				<CollapsibleMenu width={240}>
					<MenuBase
						definition={menuDefinition}
						wrapper={SimpleWrapper}
						menuItem={MaterialMenuItem}
					/>
				</CollapsibleMenu>
			</MockPortalLayoutProvider>
		</div>
	),
};

export const MaterialMenuItemActive: Story = {
	render: () => (
		<List>
			<MaterialMenuItem
				title="Dashboard"
				icon={DashboardIcon}
				expandable={false}
				active={true}
				onClick={() => {}}
				onAuxClick={() => {}}
				depth={0}
			/>
			<MaterialMenuItem
				title="Settings"
				icon={SettingsIcon}
				expandable={false}
				active={false}
				onClick={() => {}}
				onAuxClick={() => {}}
				depth={0}
			/>
			<MaterialMenuItem
				title="Reports"
				icon={BarChartIcon}
				expandable={true}
				expanded={false}
				onClick={() => {}}
				onAuxClick={() => {}}
				depth={0}
			/>
			<MaterialMenuItem
				title="Monthly"
				expandable={false}
				active={false}
				onClick={() => {}}
				onAuxClick={() => {}}
				depth={1}
			/>
		</List>
	),
};

const darkSurface = { width: 280, backgroundColor: "#121212", py: 1 };

const lightSurface = { width: 280, py: 1 };

export const Issue3479Item15FocusedEntryHasOutline: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-15: a keyboard-focused entry shows only a faint background tint (Material) or nothing at all (active Jumbo entry); there is no outline, also not in forced-colors mode.",
			},
		},
	},
	render: () => (
		<Paper sx={lightSurface}>
			<Button>Start</Button>
			<NavWrapper>
				<MaterialMenuItem
					title="Material entry"
					expandable={false}
					active={false}
					onClick={noop}
					onAuxClick={noop}
					depth={0}
				/>
				<JumboReactLightMenuItem
					title="Active Jumbo entry"
					expandable={false}
					active={true}
					onClick={noop}
					onAuxClick={noop}
					depth={0}
				/>
			</NavWrapper>
		</Paper>
	),
	play: async ({ canvas }) => {
		canvas.getByRole("button", { name: "Start" }).focus();
		for (const name of ["Material entry", "Active Jumbo entry"]) {
			await userEvent.tab();
			const entry = canvas.getByRole("button", { name });
			await expect(document.activeElement).toBe(entry);
			await waitFor(() => expect(entry).toHaveClass("Mui-focusVisible"));
			const style = getComputedStyle(entry);
			await expect(style.outlineStyle).not.toBe("none");
			await expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
		}
	},
};

// the opaque color the (possibly translucent) backgrounds under an element add up to
const backgroundBehind = (el: Element) => {
	const layers: Rgba[] = [];
	for (let node: Element | null = el; node; node = node.parentElement) {
		const layer = parseColor(getComputedStyle(node).backgroundColor);
		if (layer.a === 0) continue;
		layers.unshift(layer);
		if (layer.a === 1) break;
	}
	const { r, g, b } = layers.reduce(
		(under, over) => ({
			r: over.r * over.a + under.r * (1 - over.a),
			g: over.g * over.a + under.g * (1 - over.a),
			b: over.b * over.a + under.b * (1 - over.a),
			a: 1,
		}),
		{ r: 255, g: 255, b: 255, a: 1 },
	);
	return `rgb(${r}, ${g}, ${b})`;
};

// a keyboard focus ring: a solid outline of at least 2px inside the element (a
// scrolling menu cannot clip it), at least 3:1 against what it is drawn on
const expectFocusRing = async (el: HTMLElement) => {
	await waitFor(() => expect(el).toHaveClass("Mui-focusVisible"));
	const style = getComputedStyle(el);
	await expect(style.outlineStyle).toBe("solid");
	const width = parseFloat(style.outlineWidth);
	await expect(width).toBeGreaterThanOrEqual(2);
	await expect(parseFloat(style.outlineOffset)).toBeLessThanOrEqual(-width);
	await expect(
		contrast(style.outlineColor, backgroundBehind(el)),
	).toBeGreaterThanOrEqual(3);
};

export const Issue3479Item15FocusRingContrast: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-15: every renderer shows a keyboard focus ring with at least 3:1 contrast, also on the active Jumbo entry (primary background) and on JumboReactDarkMenuItem's dark surface.",
			},
		},
	},
	render: () => (
		<Paper sx={lightSurface}>
			<Button>Start</Button>
			<NavWrapper>
				<MaterialMenuItem
					title="Material"
					expandable={false}
					active={false}
					onClick={noop}
					onAuxClick={noop}
					depth={0}
				/>
				<MaterialMenuItem
					title="Material active"
					expandable={false}
					active={true}
					onClick={noop}
					onAuxClick={noop}
					depth={0}
				/>
				<JumboReactLightMenuItem
					title="Jumbo light"
					expandable={false}
					active={false}
					onClick={noop}
					onAuxClick={noop}
					depth={0}
				/>
				<JumboReactLightMenuItem
					title="Jumbo light active"
					expandable={false}
					active={true}
					onClick={noop}
					onAuxClick={noop}
					depth={0}
				/>
				<Paper sx={darkSurface}>
					<JumboReactDarkMenuItem
						title="Jumbo dark"
						expandable={false}
						active={false}
						onClick={noop}
						onAuxClick={noop}
						depth={0}
					/>
					<JumboReactDarkMenuItem
						title="Jumbo dark active"
						expandable={false}
						active={true}
						onClick={noop}
						onAuxClick={noop}
						depth={0}
					/>
				</Paper>
			</NavWrapper>
		</Paper>
	),
	play: async ({ canvas }) => {
		canvas.getByRole("button", { name: "Start" }).focus();
		for (const name of [
			"Material",
			"Material active",
			"Jumbo light",
			"Jumbo light active",
			"Jumbo dark",
			"Jumbo dark active",
		]) {
			await userEvent.tab();
			const entry = canvas.getByRole("button", { name });
			await expect(document.activeElement).toBe(entry);
			await expectFocusRing(entry);
		}
	},
};

export const Issue3479Item15FocusedButtonsHaveOutline: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-15: the burger on the AppBar and CollapsibleMenu's collapse button show a keyboard focus ring with at least 3:1 contrast.",
			},
		},
	},
	render: () => (
		<>
			<Button>Start</Button>
			<div style={{ height: 200 }}>
				<PortalLayout
					variant="no-top-left"
					collapseMenu
					headerContent={
						<Typography variant="h6" style={{ flexGrow: 1 }}>
							Page Title
						</Typography>
					}
					menuContent={
						<MenuBase
							definition={menuDefinition}
							wrapper={SimpleWrapper}
							menuItem={MaterialMenuItem}
						/>
					}
					content={<div style={{ padding: 24 }}>Content</div>}
				/>
			</div>
			<div style={{ height: 300, display: "flex" }}>
				<MockPortalLayoutProvider mobile={false}>
					<CollapsibleMenu width={240}>
						<MenuBase
							definition={menuDefinition}
							wrapper={NavWrapper}
							menuItem={MaterialMenuItem}
						/>
					</CollapsibleMenu>
				</MockPortalLayoutProvider>
			</div>
			<Button>End</Button>
		</>
	),
	play: async ({ canvas }) => {
		canvas.getByRole("button", { name: "Start" }).focus();
		await userEvent.tab();
		const burger = canvas.getByRole("button", { name: "Toggle menu" });
		await expect(document.activeElement).toBe(burger);
		await expectFocusRing(burger);
		canvas.getByRole("button", { name: "End" }).focus();
		await userEvent.tab({ shift: true });
		const collapse = canvas.getByRole("button", { name: "Collapse menu" });
		await expect(document.activeElement).toBe(collapse);
		await expectFocusRing(collapse);
	},
};

export const Issue3479Item2PhoneDrawerLeavesRoomToClose: LayoutStory = {
	globals: MOBILE,
	args: { drawerWidth: 320 },
	parameters: {
		a11y: A11Y_OPEN_DRAWER_EXCEPTION,
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-2: with `drawerWidth={320}` (the identity-management admin UI) the open drawer covers a 320px phone completely: there is no backdrop left to tap.",
			},
		},
	},
	render: (args) => (
		<div style={fullHeight}>
			<PortalLayout
				{...args}
				variant="no-top-left"
				headerContent={pageTitle()}
				menuContent={menu()}
				content={<div style={{ padding: 16 }}>Content</div>}
			/>
		</div>
	),
	play: async ({ canvasElement }) => {
		await openDrawer(canvasElement);
		await expect(
			drawerPaper().getBoundingClientRect().width,
		).toBeLessThanOrEqual(window.innerWidth - 56);
		const atRightEdge = document.elementFromPoint(window.innerWidth - 8, 300);
		await expect(atRightEdge?.closest(".MuiBackdrop-root")).not.toBeNull();
	},
};

export const Issue3479Item2LongTitleDrawerLeavesRoomToClose: LayoutStory = {
	globals: MOBILE,
	parameters: {
		a11y: A11Y_OPEN_DRAWER_EXCEPTION,
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-2: without `drawerWidth` the drawer is as wide as its longest title, but never wider than the screen minus 56px: the long title wraps and a backdrop strip stays to tap.",
			},
		},
	},
	render: (args) => (
		<div style={fullHeight}>
			<PortalLayout
				{...args}
				variant="no-top-left"
				headerContent={pageTitle()}
				menuContent={menu(longTitleDefinition)}
				content={<div style={{ padding: 16 }}>Content</div>}
			/>
		</div>
	),
	play: async ({ canvasElement }) => {
		await openDrawer(canvasElement);
		await expect(drawerPaper().getBoundingClientRect().width).toBe(
			window.innerWidth - 56,
		);
		const atRightEdge = document.elementFromPoint(window.innerWidth - 8, 300);
		await expect(atRightEdge?.closest(".MuiBackdrop-root")).not.toBeNull();
		// the title wraps inside the drawer instead of overflowing it
		const title = within(drawerPaper()).getByText(/^A very long menu title/);
		await expect(title.getBoundingClientRect().right).toBeLessThanOrEqual(
			drawerPaper().getBoundingClientRect().right,
		);
	},
};

// the menu's own element: MenuBase's root, around the List
const menuRootIn = (container: HTMLElement) => {
	const root = within(container).getByRole("list", {
		hidden: true,
	}).parentElement;
	if (!root) throw new Error("no menu rendered");
	return root;
};

const LayoutWithModeSwitch = (args: LayoutArgs) => {
	const [mobile, setMobile] = React.useState(false);
	const toggle = React.useCallback(() => setMobile((prev) => !prev), []);
	return (
		<div style={fullHeight}>
			<PortalLayout
				{...args}
				variant="no-top-left"
				collapseMenu={mobile}
				headerContent={pageTitle()}
				menuContent={menu()}
				content={
					<div style={{ padding: 16 }}>
						<Button variant="contained" onClick={toggle}>
							{mobile ? "Switch to desktop view" : "Switch to mobile view"}
						</Button>
					</div>
				}
				menuId={"mnu"}
			/>
		</div>
	);
};

export const Issue3479Item25MenuKeepsStateAcrossViews: LayoutStory = {
	args: { drawerWidth: 240 },
	parameters: {
		a11y: A11Y_OPEN_DRAWER_EXCEPTION,
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-25: the menu stays mounted when the layout switches between desktop and mobile view (the button sets `collapseMenu`, as crossing the breakpoint does): an expanded group and the highlighted entry are still there in the drawer. The menu fills the paper in both views.",
			},
		},
	},
	render: (args) => <LayoutWithModeSwitch {...args} />,
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Reports" }));
		const monthly = await canvas.findByRole("button", { name: "Monthly" });
		await userEvent.click(monthly);
		// menuId is on the nav inside the menu column's paper
		const columnPaper = document
			.getElementById("mnu")!
			.closest<HTMLElement>(".MuiPaper-root")!;
		await expect(menuRootIn(columnPaper).getBoundingClientRect().height).toBe(
			columnPaper.getBoundingClientRect().height,
		);

		await userEvent.click(
			canvas.getByRole("button", { name: "Switch to mobile view" }),
		);
		await openDrawer(canvasElement);
		const dialog = within(drawerPaper());
		await expect(
			dialog
				.getByRole("button", { name: "Reports" })
				.querySelector("[data-testid=ExpandLessIcon]"),
		).not.toBeNull();
		const monthlyInDrawer = dialog.getByRole("button", { name: "Monthly" });
		await expect(monthlyInDrawer).toHaveClass("Mui-selected");
		await expect(menuRootIn(drawerPaper()).getBoundingClientRect().height).toBe(
			drawerPaper().getBoundingClientRect().height,
		);

		// Escape on an entry closes the drawer, as on the drawer itself
		monthlyInDrawer.focus();
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(drawerRoot()).toHaveAttribute("aria-hidden"));
		await waitFor(() =>
			expect(document.activeElement).toBe(burgerIn(canvasElement)),
		);
	},
};

// by role and name, as a screen reader finds it
const closeMenuButton = () =>
	within(drawerPaper()).getByRole("button", { name: "Close menu" });

// in the accessibility tree, but no more than a clipped 1px box on screen
const expectVisuallyHidden = async (el: HTMLElement) => {
	await waitFor(() =>
		expect(el.getBoundingClientRect().width).toBeLessThanOrEqual(1),
	);
	await expect(el.getBoundingClientRect().height).toBeLessThanOrEqual(1);
};

// shown at the top of the drawer, over its content: a full-size target with a
// focus ring that a pointer at its center would hit
const expectShownAtTop = async (el: HTMLElement) => {
	await expectFocusRing(el);
	const box = el.getBoundingClientRect();
	const paper = drawerPaper().getBoundingClientRect();
	await expect(box.width).toBeGreaterThanOrEqual(44);
	await expect(box.height).toBeGreaterThanOrEqual(44);
	await expect(box.left).toBeGreaterThanOrEqual(paper.left);
	await expect(box.right).toBeLessThanOrEqual(paper.right);
	await expect(box.top).toBeGreaterThanOrEqual(paper.top);
	await expect(box.bottom).toBeLessThanOrEqual(paper.top + 56);
	await expect(
		el.contains(
			document.elementFromPoint(
				box.left + box.width / 2,
				box.top + box.height / 2,
			),
		),
	).toBe(true);
};

/**
 * Opens the drawer with a pointer click and checks the close button: there for
 * screen readers, not on screen; Tab shows it without moving the entries, the
 * next Tab hides it again; on it again, Enter closes the drawer.
 * @param canvasElement The story's canvas
 * @param firstStop The element that has to start at the top of the drawer and
 * stay there (the menu, or topLeft in variant basic)
 * @param secondStop The drawer's Tab stop after the close button
 */
const checkCloseMenuButton = async (
	canvasElement: HTMLElement,
	firstStop: () => HTMLElement,
	secondStop: () => HTMLElement,
) => {
	await openDrawer(canvasElement);
	const close = closeMenuButton();
	await expect(document.activeElement).not.toBe(close);
	await expectVisuallyHidden(close);
	const paperTop = drawerPaper().getBoundingClientRect().top;
	await expect(firstStop().getBoundingClientRect().top).toBe(paperTop);

	await userEvent.tab();
	await expect(document.activeElement).toBe(close);
	await expectShownAtTop(close);
	await expect(firstStop().getBoundingClientRect().top).toBe(paperTop);

	await userEvent.tab();
	await expect(document.activeElement).toBe(secondStop());
	await expectVisuallyHidden(close);

	await userEvent.tab({ shift: true });
	await expect(document.activeElement).toBe(close);
	await expectShownAtTop(close);
	await userEvent.keyboard("{Enter}");
	await waitFor(() => expect(drawerRoot()).toHaveAttribute("aria-hidden"));
	await waitFor(() =>
		expect(document.activeElement).toBe(burgerIn(canvasElement)),
	);
};

export const Issue3479Item11CloseButtonShownOnKeyboardFocus: LayoutStory = {
	globals: MOBILE,
	args: { drawerWidth: 320 },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-11: the drawer has a close button for screen readers and keyboard users. Opened with a pointer, the drawer looks as before: the button is visually hidden and the entries start at the top. It is the first stop of Tab in the drawer and shown, at the top of the drawer over the entries, only while it has keyboard focus. It closes the drawer and focus returns to the burger, also for touch screen-reader users, whose dismiss gestures do not send Escape.",
			},
		},
	},
	render: (args) => (
		<div style={fullHeight}>
			<PortalLayout
				{...args}
				variant="no-top-left"
				headerContent={pageTitle()}
				menuContent={menu()}
				content={<div style={{ padding: 16 }}>Content</div>}
			/>
		</div>
	),
	play: async ({ canvasElement }) => {
		await checkCloseMenuButton(
			canvasElement,
			() => menuRootIn(drawerPaper()),
			() => within(drawerPaper()).getByRole("button", { name: "Dashboard" }),
		);
	},
};

export const Issue3479Item11CloseButtonOverTopLeft: LayoutStory = {
	globals: MOBILE,
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-11: in variant `basic` the drawer starts with the `topLeft` row as before; the close button, shown while it has keyboard focus, sits over that row. It comes before a focusable `topLeft` in the Tab order.",
			},
		},
	},
	render: (args) => (
		<div style={fullHeight}>
			<PortalLayout
				{...args}
				variant="basic"
				topLeft={
					<a href={"#home"} style={{ display: "block", padding: 8 }}>
						MyApp
					</a>
				}
				headerContent={pageTitle()}
				menuContent={menu()}
				content={<div style={{ padding: 16 }}>Content</div>}
			/>
		</div>
	),
	play: async ({ canvasElement }) => {
		const home = () =>
			within(drawerPaper()).getByRole("link", { name: "MyApp" });
		await checkCloseMenuButton(
			canvasElement,
			() => home().parentElement!,
			home,
		);
	},
};

export const Issue3479Item16BurgerContrast: LayoutStory = {
	args: { collapseMenu: true },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-16: the burger icon takes the AppBar's text color, as in MUI's AppBar examples (4.6:1 here), not IconButton's default action color (54% black, 2.65:1 on `primary.main`), so it reaches the 3:1 non-text contrast minimum.",
			},
		},
	},
	render: (args) => (
		<div style={fullHeight}>
			<PortalLayout
				{...args}
				variant="no-top-left"
				headerContent={pageTitle()}
				menuContent={menu()}
				content={<div style={{ padding: 24 }}>Content</div>}
			/>
		</div>
	),
	play: async ({ canvas }) => {
		const burger = canvas.getByRole("button", { name: "Toggle menu" });
		const icon = burger.querySelector("svg")!;
		const appBar = burger.closest("header")!;
		const ratio = contrast(
			getComputedStyle(icon).color,
			getComputedStyle(appBar).backgroundColor,
		);
		await expect(ratio).toBeGreaterThanOrEqual(3);
	},
};

/** PortalLayout in mobile view, in its own theme */
const LayoutInTheme = ({ theme }: { theme: Theme }) => (
	<ThemeProvider theme={theme}>
		<div style={fullHeight}>
			<PortalLayout
				variant="no-top-left"
				collapseMenu
				headerContent={pageTitle()}
				menuContent={menu()}
				content={<div style={{ padding: 24 }}>Content</div>}
			/>
		</div>
	</ThemeProvider>
);

const expectBurgerInAppBarTextColor = async (canvasElement: HTMLElement) => {
	const burger = within(canvasElement).getByRole("button", {
		name: "Toggle menu",
	});
	const iconColor = getComputedStyle(burger.querySelector("svg")!).color;
	const appBar = getComputedStyle(burger.closest("header")!);
	await expect(iconColor).toBe(appBar.color);
	await expect(
		contrast(iconColor, appBar.backgroundColor),
	).toBeGreaterThanOrEqual(3);
};

const iconButtonPrimaryTheme = createTheme({
	palette: { primary: { main: "#425159" } },
	components: { MuiIconButton: { defaultProps: { color: "primary" } } },
});

export const Issue3479Item16BurgerIgnoresThemeIconButtonColor: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-16: the theme's IconButtons default to `color: \"primary\"`. The burger keeps the AppBar's text color; in the primary color it would vanish in the AppBar (1:1).",
			},
		},
	},
	render: () => <LayoutInTheme theme={iconButtonPrimaryTheme} />,
	play: async ({ canvasElement }) => {
		await expectBurgerInAppBarTextColor(canvasElement);
	},
};

const coloredDarkAppBarTheme = createTheme({
	palette: { mode: "dark" },
	components: { MuiAppBar: { defaultProps: { enableColorOnDark: true } } },
});

export const Issue3479Item16BurgerOnColoredDarkAppBar: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-16: MUI's dark palette with an AppBar in `primary.main` (`enableColorOnDark`). The burger has the AppBar's dark text color; the palette's white action color would have 1.75:1 on the light blue.",
			},
		},
	},
	render: () => <LayoutInTheme theme={coloredDarkAppBarTheme} />,
	play: async ({ canvasElement }) => {
		await expectBurgerInAppBarTextColor(canvasElement);
	},
};

export const Issue3479Item14BurgerControlsDrawer: LayoutStory = {
	globals: MOBILE,
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3479-ITEM-14: the burger names the drawer it opens (`aria-controls`) and says whether it is open (`aria-expanded`). The drawer stays mounted while closed, so the reference always resolves, to the drawer that holds the close button and the menu.",
			},
		},
	},
	render: (args) => (
		<div style={fullHeight}>
			<PortalLayout
				{...args}
				variant="no-top-left"
				headerContent={pageTitle()}
				menuContent={menu()}
				content={<div style={{ padding: 16 }}>Content</div>}
			/>
		</div>
	),
	play: async ({ canvasElement }) => {
		const burger = burgerIn(canvasElement);
		const id = burger.getAttribute("aria-controls");
		await expect(id).toMatch(/\S/);
		await expect(document.getElementById(id!)).toBe(drawerPaper());

		await openDrawer(canvasElement);
		await expect(burger).toHaveAttribute("aria-expanded", "true");
		await expect(burger).toHaveAttribute("aria-controls", id);
		const drawer = document.getElementById(id!)!;
		await expect(drawer).toBe(drawerPaper());
		await expect(drawer).toHaveAttribute("role", "dialog");
		await expect(
			within(drawer).getByRole("button", { name: "Close menu" }),
		).toBeInTheDocument();
		await expect(
			within(drawer).getByRole("button", { name: "Dashboard" }),
		).toBeVisible();

		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(drawerRoot()).toHaveAttribute("aria-hidden"));
		await expect(burger).toHaveAttribute("aria-expanded", "false");
		await expect(document.getElementById(id!)).toBe(drawerPaper());
	},
};

// Axe in error mode, minus the "list" rule the desktop menu breaks until its item
// is fixed (drop it with the fix): with MUI List as the wrapper the entries are
// `ul > div[role=button]` (ISSUE-3479-ITEM-19).
const A11Y_MENU_LIST_EXCEPTION = {
	test: "error",
	config: { rules: [{ id: "list", enabled: false }] },
} as const;

// a link in the AppBar's text color
const skipLinkStyle = { color: "inherit", marginInlineEnd: 16 };

/** PortalLayout with a skip link in its header, to its main landmark */
const PortalWithSkipLink = () => {
	const [history] = useState(() =>
		createMemoryHistory({ initialEntries: ["/"] }),
	);
	return (
		<HistoryRouter history={history}>
			<div style={fullHeight}>
				<PortalLayout
					variant="no-top-left"
					headerContent={
						<>
							<Link to="#main-pane" style={skipLinkStyle}>
								Skip to content
							</Link>
							{pageTitle("App")}
						</>
					}
					menuContent={menu()}
					menuId="menu-nav"
					mainId="main-pane"
					content={
						<Box sx={{ p: 3 }}>
							<Typography variant="h4" component="h1">
								Page
							</Typography>
							<Button>First action</Button>
						</Box>
					}
				/>
			</div>
		</HistoryRouter>
	);
};

export const Issue3479Item12LandmarksAndFocusableMain: Story = {
	parameters: {
		a11y: A11Y_MENU_LIST_EXCEPTION,
		docs: {
			description: {
				story:
					'ISSUE-3479-ITEM-12: the content is in the page\'s main landmark (`<main>`, with `mainId`), the menu in its navigation landmark (`<nav>` "Main menu", with `menuId`). The main landmark takes focus without being a stop of Tab: a skip link (here `<Link to="#main-pane">` in the header) moves the focus to it, it shows a focus ring inside its edge, and Tab goes on into the content.',
			},
		},
	},
	render: () => <PortalWithSkipLink />,
	play: async ({ canvas }) => {
		const main = canvas.getByRole("main");
		await expect(main).toHaveAttribute("id", "main-pane");
		await expect(main).toContainElement(
			canvas.getByRole("heading", { name: "Page" }),
		);
		const nav = canvas.getByRole("navigation", { name: "Main menu" });
		await expect(nav).toHaveAttribute("id", "menu-nav");
		await expect(
			within(nav).getByRole("button", { name: "Dashboard" }),
		).toBeVisible();

		canvas.getByRole("link", { name: "Skip to content" }).focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(document.activeElement).toBe(main));
		const style = getComputedStyle(main);
		await expect(style.outlineStyle).toBe("solid");
		const width = parseFloat(style.outlineWidth);
		await expect(width).toBeGreaterThanOrEqual(2);
		await expect(parseFloat(style.outlineOffset)).toBeLessThanOrEqual(-width);
		await expect(
			contrast(style.outlineColor, backgroundBehind(main)),
		).toBeGreaterThanOrEqual(3);

		await userEvent.tab();
		await expect(document.activeElement).toBe(
			canvas.getByRole("button", { name: "First action" }),
		);
		// the main landmark is no stop of Tab: back to the menu
		await userEvent.tab({ shift: true });
		await expect(nav).toContainElement(document.activeElement as HTMLElement);
	},
};

/** A page longer than the pane, with a link to another page at its end */
const LongPage = (props: { name: string; to: string; link: string }) => (
	<Box sx={{ p: 3 }}>
		<Typography variant="h4" component="h1">
			{props.name}
		</Typography>
		{Array.from({ length: 30 }, (_, index) => (
			<Typography key={index} sx={{ py: 2 }}>
				{props.name}, paragraph {index + 1}
			</Typography>
		))}
		<Link to={props.to}>{props.link}</Link>
	</Box>
);

/** PortalLayout with two long pages routed in its main pane */
const RoutedPortal = () => {
	const [history] = useState(() =>
		createMemoryHistory({ initialEntries: ["/a"] }),
	);
	return (
		<HistoryRouter history={history}>
			<div style={fullHeight}>
				<PortalLayout
					variant="no-top-left"
					headerContent={pageTitle("App")}
					menuContent={<Typography sx={{ p: 2 }}>Menu</Typography>}
					mainId="main-pane"
					content={
						<Routes>
							{[
								<Route
									key="a"
									path="/a"
									element={<LongPage name="Page A" to="/b" link="Next page" />}
								/>,
								<Route
									key="b"
									path="/b"
									element={<LongPage name="Page B" to="/a" link="Back to A" />}
								/>,
							]}
						</Routes>
					}
				/>
			</div>
		</HistoryRouter>
	);
};

export const Issue3475Item20NavigationScrollsMainPaneToTop: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3475-ITEM-20: the pages scroll in the layout's main pane, not in the window. Scroll to the end of page A and follow its link: page B opens at its top, not at the offset page A was scrolled to.",
			},
		},
	},
	render: () => <RoutedPortal />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const pane = document.getElementById("main-pane")!;
		const link = canvas.getByRole("link", { name: "Next page" });
		link.scrollIntoView({ block: "center" });
		await waitFor(() => expect(pane.scrollTop).toBeGreaterThan(0));
		await userEvent.click(link);
		const heading = await canvas.findByRole("heading", { name: "Page B" });
		await expect(pane.scrollTop).toBe(0);
		const box = heading.getBoundingClientRect();
		const paneBox = pane.getBoundingClientRect();
		await expect(
			box.top >= paneBox.top && box.bottom <= paneBox.bottom,
			`heading at ${Math.round(box.top)}..${Math.round(box.bottom)} in a pane at ${Math.round(paneBox.top)}..${Math.round(paneBox.bottom)}`,
		).toBe(true);
	},
};

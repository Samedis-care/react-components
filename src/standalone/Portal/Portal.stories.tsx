import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	BarChart as BarChartIcon,
	Dashboard as DashboardIcon,
	People as PeopleIcon,
	Settings as SettingsIcon,
} from "@mui/icons-material";
import { Button, List, Paper, Typography } from "@mui/material";
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

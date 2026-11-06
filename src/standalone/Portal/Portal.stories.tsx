import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Dashboard as DashboardIcon,
	Settings as SettingsIcon,
	People as PeopleIcon,
	BarChart as BarChartIcon,
} from "@mui/icons-material";
import { List, Typography } from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor, within } from "storybook/test";
import PortalLayout, { PortalLayoutContext, PortalLayoutProps } from "./Layout";
import MenuBase from "./Menu";
import CollapsibleMenu from "./CollapsibleMenu";
import { MaterialMenuItem } from "./MenuItem";
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

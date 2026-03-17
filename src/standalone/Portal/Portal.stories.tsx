import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Dashboard as DashboardIcon,
	Settings as SettingsIcon,
	People as PeopleIcon,
	BarChart as BarChartIcon,
} from "@mui/icons-material";
import { List, Typography } from "@mui/material";
import PortalLayout, { PortalLayoutContext } from "./Layout";
import MenuBase from "./Menu";
import CollapsibleMenu from "./CollapsibleMenu";
import { MaterialMenuItem } from "./MenuItem";
import type { IMenuItemDefinition } from "./Menu";

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

const SimpleWrapper = ({ children }: { children: React.ReactNode }) => (
	<List>{children}</List>
);

const meta: Meta<typeof PortalLayout> = {
	title: "Standalone/Portal/PortalLayout",
	component: PortalLayout,
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof PortalLayout>;

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

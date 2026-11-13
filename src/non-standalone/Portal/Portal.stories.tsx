import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, List, ListItem, Typography } from "@mui/material";
import { createMemoryHistory } from "history";
import { Home, Info, Settings } from "@mui/icons-material";
// eslint-disable-next-line import/no-unresolved
import { expect, userEvent, waitFor } from "storybook/test";
import HistoryRouter from "../../standalone/Routes/HistoryRouter";
import Routes from "../../standalone/Routes/Routes";
import Route from "../../standalone/Routes/Route";
import useLocation from "../../standalone/Routes/useLocation";
import { MaterialMenuItem } from "../../standalone/Portal/MenuItem";
import RoutedMenu, { IRoutedMenuItemDefinition } from "./Menu";

const meta: Meta = {
	title: "non-standalone/Portal/RoutedMenu",
	parameters: { layout: "fullscreen" },
};

export default meta;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PageHome = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">Home</Typography>
		<Typography>Welcome to the home page.</Typography>
	</Box>
);

const PageAbout = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">About</Typography>
		<Typography>About this application.</Typography>
	</Box>
);

const PageSettings = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">Settings</Typography>
		<Typography>Application settings page.</Typography>
	</Box>
);

const PageSettingsProfile = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">Profile Settings</Typography>
		<Typography>Edit your profile here.</Typography>
	</Box>
);

const PageSettingsNotifications = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h5">Notification Settings</Typography>
		<Typography>Manage your notification preferences.</Typography>
	</Box>
);

const MenuWrapper = (props: { children: React.ReactNode }) => (
	<List>{props.children}</List>
);

const MenuItem = (props: {
	icon?: React.ComponentType;
	title: string;
	onClick: React.MouseEventHandler;
	onAuxClick: React.MouseEventHandler;
	expandable: boolean;
	active?: boolean;
	expanded?: boolean;
	depth: number;
}) => (
	<ListItem
		onClick={props.onClick}
		sx={{
			pl: 2 + props.depth * 2,
			cursor: "pointer",
			bgcolor: props.active ? "action.selected" : "transparent",
			fontWeight: props.active ? "bold" : "normal",
			"&:hover": { bgcolor: "action.hover" },
		}}
	>
		{props.icon && <Box component={props.icon} sx={{ mr: 1, fontSize: 20 }} />}
		{props.title}
		{props.expandable && (props.expanded ? " [-]" : " [+]")}
	</ListItem>
);

const menuDefinition: IRoutedMenuItemDefinition[] = [
	{
		icon: Home,
		title: "Home",
		route: "/",
		shouldRender: true,
	},
	{
		icon: Info,
		title: "About",
		route: "/about",
		shouldRender: true,
	},
	{
		icon: Settings,
		title: "Settings",
		route: "/settings",
		shouldRender: true,
		children: [
			{
				title: "Profile",
				route: "/settings/profile",
				shouldRender: true,
			},
			{
				title: "Notifications",
				route: "/settings/notifications",
				shouldRender: true,
			},
		],
	},
];

// ─── Story ───────────────────────────────────────────────────────────────────

export const BasicRoutedMenu: StoryObj = {
	name: "Basic RoutedMenu",
	render: () => {
		const history = createMemoryHistory({ initialEntries: ["/"] });
		return (
			<HistoryRouter history={history}>
				<Box sx={{ display: "flex", height: "100vh" }}>
					<Box
						sx={{
							width: 250,
							borderRight: "1px solid #ccc",
							overflow: "auto",
						}}
					>
						<RoutedMenu
							definition={menuDefinition}
							wrapper={MenuWrapper}
							menuItem={MenuItem}
						/>
					</Box>
					<Box sx={{ flex: 1 }}>
						<Routes>
							{[
								<Route key="home" path="/" element={<PageHome />} />,
								<Route key="about" path="/about" element={<PageAbout />} />,
								<Route
									key="settings"
									path="/settings"
									element={<PageSettings />}
								/>,
								<Route
									key="settings-profile"
									path="/settings/profile"
									element={<PageSettingsProfile />}
								/>,
								<Route
									key="settings-notifications"
									path="/settings/notifications"
									element={<PageSettingsNotifications />}
								/>,
							]}
						</Routes>
					</Box>
				</Box>
			</HistoryRouter>
		);
	},
};

export const StartingOnSettings: StoryObj = {
	name: "Starting on Settings",
	render: () => {
		const history = createMemoryHistory({
			initialEntries: ["/settings/profile"],
		});
		return (
			<HistoryRouter history={history}>
				<Box sx={{ display: "flex", height: "100vh" }}>
					<Box
						sx={{
							width: 250,
							borderRight: "1px solid #ccc",
							overflow: "auto",
						}}
					>
						<RoutedMenu
							definition={menuDefinition}
							wrapper={MenuWrapper}
							menuItem={MenuItem}
						/>
					</Box>
					<Box sx={{ flex: 1 }}>
						<Routes>
							{[
								<Route key="home" path="/" element={<PageHome />} />,
								<Route key="about" path="/about" element={<PageAbout />} />,
								<Route
									key="settings"
									path="/settings"
									element={<PageSettings />}
								/>,
								<Route
									key="settings-profile"
									path="/settings/profile"
									element={<PageSettingsProfile />}
								/>,
								<Route
									key="settings-notifications"
									path="/settings/notifications"
									element={<PageSettingsNotifications />}
								/>,
							]}
						</Routes>
					</Box>
				</Box>
			</HistoryRouter>
		);
	},
};

// ─── Menu swapped by path ────────────────────────────────────────────────────

const NavWrapper = (props: { children: React.ReactNode }) => (
	<List component={"nav"} aria-label={"Main menu"}>
		{props.children}
	</List>
);

const Page = (props: { title: string }) => {
	const location = useLocation();
	return (
		<Box sx={{ p: 2 }}>
			<Typography variant="h5" component="h1">
				{props.title}
			</Typography>
			<Typography data-testid="current-path">{location.pathname}</Typography>
		</Box>
	);
};

const currentPath = () =>
	document.querySelector("[data-testid=current-path]")?.textContent;

const appMenu: IRoutedMenuItemDefinition[] = [
	{ title: "Back", route: "/apps", shouldRender: true },
	{ title: "General", route: "/apps/:app", shouldRender: true },
	{ title: "Roles", route: "/apps/:app/roles", shouldRender: true },
	{ title: "Users", route: "/apps/:app/users", shouldRender: true },
];

// IMF's admin UI picks a whole flat menu per path: the app menu (with "Back")
// below /apps/<id>, the top menu elsewhere
const topMenu: IRoutedMenuItemDefinition[] = [
	{ title: "Profile", route: "/profile", shouldRender: true },
	{ title: "Apps", route: "/apps", shouldRender: true },
];

const SwappingMenu = () => {
	const { pathname } = useLocation();
	return (
		<RoutedMenu
			definition={/^\/apps\/.+/.test(pathname) ? appMenu : topMenu}
			wrapper={NavWrapper}
			menuItem={MaterialMenuItem}
		/>
	);
};

const SwappingDemo = () => {
	const [history] = useState(() =>
		createMemoryHistory({ initialEntries: ["/apps/a1/roles"] }),
	);
	return (
		<HistoryRouter history={history}>
			<SwappingMenu />
			<Box component="main">
				<Page title="Content" />
			</Box>
		</HistoryRouter>
	);
};

export const Issue3498Item8FocusStaysWhenTheMenuIsSwapped: StoryObj = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3498-ITEM-8: the definition depends on the path (as in IMF\'s admin UI). Enter on "Back" navigates to `/apps`, where the menu has no "Back" entry: the focused entry unmounts and keyboard focus falls to the document body.',
			},
		},
	},
	render: () => <SwappingDemo />,
	play: async ({ canvas }) => {
		canvas.getByRole("button", { name: "Back" }).focus();
		await userEvent.keyboard("{Enter}");
		await waitFor(() =>
			expect(canvas.getByRole("button", { name: "Apps" })).toHaveClass(
				"Mui-selected",
			),
		);
		await expect(currentPath()).toBe("/apps");
		await expect(document.activeElement).not.toBe(document.body);
	},
};

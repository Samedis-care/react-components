import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, List, ListItem, Typography } from "@mui/material";
import { createMemoryHistory } from "history";
import { Home, Info, Settings } from "@mui/icons-material";
import HistoryRouter from "../../standalone/Routes/HistoryRouter";
import Routes from "../../standalone/Routes/Routes";
import Route from "../../standalone/Routes/Route";
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

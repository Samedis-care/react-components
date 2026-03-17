import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Tab, Typography } from "@mui/material";
import { createMemoryHistory } from "history";
import HistoryRouter from "../../standalone/Routes/HistoryRouter";
import Routes from "../../standalone/Routes/Routes";
import Route from "../../standalone/Routes/Route";
import RoutedTabs from "./RoutedTabs";
import RoutedTabPanelWrapper from "./RoutedTabPanelWrapper";
import useRoutedTabPanel from "./useRoutedTabPanel";

const meta: Meta = {
	title: "non-standalone/RoutedTabs",
	parameters: { layout: "fullscreen" },
};

export default meta;

// ─── Tab content components ──────────────────────────────────────────────────

const GeneralPanel = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h6">General</Typography>
		<Typography>General settings and preferences.</Typography>
	</Box>
);

const SecurityPanel = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h6">Security</Typography>
		<Typography>Password, two-factor authentication, and more.</Typography>
	</Box>
);

const NotificationsPanel = () => (
	<Box sx={{ p: 2 }}>
		<Typography variant="h6">Notifications</Typography>
		<Typography>Configure email and push notification settings.</Typography>
	</Box>
);

// ─── RoutedTabs demo (needs to be inside a Route context) ────────────────────

const TabsDemo = () => {
	const createTab = useRoutedTabPanel();
	return (
		<Box sx={{ width: "100%" }}>
			<RoutedTabs>
				<Tab label="General" value="general" />
				<Tab label="Security" value="security" />
				<Tab label="Notifications" value="notifications" />
			</RoutedTabs>
			<RoutedTabPanelWrapper>
				{[
					createTab("general", <GeneralPanel />),
					createTab("security", <SecurityPanel />),
					createTab("notifications", <NotificationsPanel />),
				]}
			</RoutedTabPanelWrapper>
		</Box>
	);
};

// ─── Stories ─────────────────────────────────────────────────────────────────

export const DefaultTab: StoryObj = {
	name: "Default Tab (General)",
	render: () => {
		const history = createMemoryHistory({
			initialEntries: ["/settings/general"],
		});
		return (
			<HistoryRouter history={history}>
				<Routes>
					{[<Route key="settings" path="/settings/*" element={<TabsDemo />} />]}
				</Routes>
			</HistoryRouter>
		);
	},
};

export const SecurityTab: StoryObj = {
	name: "Security Tab Selected",
	render: () => {
		const history = createMemoryHistory({
			initialEntries: ["/settings/security"],
		});
		return (
			<HistoryRouter history={history}>
				<Routes>
					{[<Route key="settings" path="/settings/*" element={<TabsDemo />} />]}
				</Routes>
			</HistoryRouter>
		);
	},
};

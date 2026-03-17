import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
import { createMemoryHistory } from "history";
import SignalPortlet from "./index";
import { HistoryRouter } from "../Routes";

const meta: Meta<typeof SignalPortlet> = {
	title: "Standalone/SignalPortlet",
	component: SignalPortlet,
	parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof SignalPortlet>;

const WithRouter = ({ children }: { children: React.ReactNode }) => {
	const history = useMemo(() => createMemoryHistory(), []);
	return (
		<HistoryRouter history={history}>
			<Box sx={{ width: 320 }}>{children}</Box>
		</HistoryRouter>
	);
};

export const Default: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="System Status"
				items={[
					{ count: 5, text: "Open Incidents" },
					{ count: 0, text: "Warnings" },
					{ count: 12, text: "Resolved Today" },
				]}
			/>
		</WithRouter>
	),
};

export const WithRefresh: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="Dashboard"
				items={[
					{ count: 3, text: "Pending Tasks" },
					{ count: 1, text: "Critical Alerts" },
					{ count: 0, text: "Errors" },
				]}
				updatedAt={new Date(Date.now() - 5 * 60 * 1000)}
				onRefresh={() => alert("Refreshing...")}
			/>
		</WithRouter>
	),
};

export const WithLinks: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="Linked Items"
				items={[
					{ count: 7, text: "Active Users", link: "/users" },
					{ count: 2, text: "Failed Jobs", link: "/jobs" },
					{ count: 0, text: "Queue Empty", link: "/queue" },
				]}
			/>
		</WithRouter>
	),
};

export const Loading: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="Loading State"
				items={[
					{ count: null, text: "Fetching data..." },
					{ count: null, text: "Also loading..." },
				]}
			/>
		</WithRouter>
	),
};

export const LargeCount: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="High Volume"
				items={[
					{ count: 1500, text: "Total Records (capped at 999)" },
					{ count: 42, text: "Processed" },
				]}
			/>
		</WithRouter>
	),
};

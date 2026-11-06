import React, { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
import { createMemoryHistory } from "history";
// eslint-disable-next-line import/no-unresolved
import { expect } from "storybook/test";
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
					{ count: 1500, text: "Total Records" },
					{ count: 42, text: "Processed" },
				]}
			/>
		</WithRouter>
	),
};

/**
 * A count above 999 shows "999+" within its round 40px avatar, and the full
 * number for assistive technology
 */
export const Issue3469Item1CappedCountFitsItsAvatar: Story = {
	render: () => (
		<WithRouter>
			<SignalPortlet
				title="High Volume"
				items={[
					{ count: 999, text: "Exactly 999" },
					{ count: 1500, text: "Total Records" },
					{ count: 123456, text: "Archived" },
				]}
			/>
		</WithRouter>
	),
	parameters: { a11y: { test: "error" } },
	play: async ({ canvas, canvasElement }) => {
		const avatars = Array.from(
			canvasElement.querySelectorAll<HTMLElement>(".MuiAvatar-root"),
		);
		await expect(avatars).toHaveLength(3);
		await expect(avatars[0]).toHaveTextContent(/^999$/);
		// every glyph box of "999+" lies inside the circle, so nothing is clipped
		for (const av of avatars.slice(1)) {
			const circle = av.getBoundingClientRect();
			const radius = circle.width / 2;
			const cx = circle.left + radius;
			const cy = circle.top + radius;
			const text = av.querySelector<HTMLElement>("[aria-hidden='true']");
			if (!text) throw new Error("no visible capped count");
			await expect(text).toHaveTextContent(/^999\+$/);
			const box = text.getBoundingClientRect();
			const dy = Math.max(Math.abs(box.top - cy), Math.abs(box.bottom - cy));
			const halfChord = Math.sqrt(radius * radius - dy * dy);
			await expect(box.left).toBeGreaterThanOrEqual(cx - halfChord);
			await expect(box.right).toBeLessThanOrEqual(cx + halfChord);
		}
		// the full numbers, for assistive technology
		for (const full of ["1500", "123456"]) {
			await expect(canvas.getByText(full)).not.toHaveAttribute("aria-hidden");
		}
	},
};

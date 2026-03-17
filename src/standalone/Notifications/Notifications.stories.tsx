import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line import/no-unresolved
import { fn, expect, within } from "storybook/test";
import Notifications, { Notification } from "./index";

const now = new Date("2026-03-17T12:00:00Z");

const sampleNotifications: Notification[] = [
	{
		id: "1",
		message: "Your report is ready",
		origin: "Reports",
		created: new Date(now.getTime() - 2 * 60 * 1000), // 2 min ago
		read: false,
	},
	{
		id: "2",
		message: "New user registered: john.doe@example.com",
		origin: "Users",
		created: new Date(now.getTime() - 45 * 60 * 1000), // 45 min ago
		read: false,
	},
	{
		id: "3",
		message: "Scheduled maintenance tonight at 22:00",
		created: new Date(now.getTime() - 3 * 3600 * 1000), // 3 hours ago
		read: true,
	},
	{
		id: "4",
		message: "Invoice #1042 was paid",
		origin: "Billing",
		created: new Date(now.getTime() - 2 * 86400 * 1000), // 2 days ago
		read: true,
	},
];

const expiredNotification: Notification = {
	id: "expired",
	message: "This notification should not show",
	created: new Date(now.getTime() - 100000),
	expires: new Date(now.getTime() - 1000), // already expired
	read: false,
};

const meta: Meta<typeof Notifications> = {
	title: "Standalone/Notifications",
	component: Notifications,
	parameters: { layout: "centered" },
	args: {
		loadLatest: fn(),
		loadRead: fn(),
		loadUnread: undefined,
		notifications: sampleNotifications,
		refreshInterval: 999999999, // effectively disable polling in stories
	},
};
export default meta;

type Story = StoryObj<typeof Notifications>;

export const WithUnread: Story = {
	args: {
		notifications: sampleNotifications,
	},
	play: async ({ canvas, userEvent }) => {
		const body = within(document.body);
		// Click the notification bell to open the popover
		const bell = await canvas.findByRole("button");
		await userEvent.click(bell);
		// Notification messages should appear (popover renders in a portal)
		await expect(
			await body.findByText("Your report is ready", {}, { timeout: 5000 }),
		).toBeInTheDocument();
	},
};

export const NoNotifications: Story = {
	args: {
		notifications: [],
	},
};

export const AllRead: Story = {
	args: {
		notifications: sampleNotifications.map((n) => ({ ...n, read: true })),
	},
};

export const ExplicitUnreadCount: Story = {
	args: {
		notifications: sampleNotifications,
		unreadCount: 99,
	},
};

export const WithExpiredNotification: Story = {
	args: {
		notifications: [...sampleNotifications, expiredNotification],
	},
};

export const WithLoadUnread: Story = {
	args: {
		notifications: sampleNotifications,
		loadUnread: fn(),
	},
};

export const WithCustomRenderer: Story = {
	args: {
		notifications: sampleNotifications,
		notificationRenderer: (notification: Notification) => (
			<div
				key={notification.id}
				style={{
					padding: 12,
					borderBottom: "1px solid #eee",
					opacity: notification.read ? 0.5 : 1,
					fontWeight: notification.read ? "normal" : "bold",
				}}
			>
				<div>{notification.message}</div>
				{notification.origin && (
					<div style={{ fontSize: 12, color: "#888" }}>
						{notification.origin as React.ReactNode}
					</div>
				)}
			</div>
		),
	},
};

export const WithImage: Story = {
	args: {
		notifications: [
			{
				id: "img-1",
				message: "Profile picture updated",
				image: "https://picsum.photos/seed/notif/96/96",
				created: new Date(now.getTime() - 5 * 60 * 1000),
				read: false,
			},
			...sampleNotifications,
		],
	},
};

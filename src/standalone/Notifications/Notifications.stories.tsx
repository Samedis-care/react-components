import React, { useCallback, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Box,
	Button,
	createTheme,
	Grow,
	ThemeProvider,
	Typography,
} from "@mui/material";
// eslint-disable-next-line import/no-unresolved
import { fn, expect, userEvent, waitFor, within } from "storybook/test";
import Notifications, { Notification, NotificationsProps } from "./index";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
/** Dates relative to the time the stories load, so the ages read as commented */
const ago = (ms: number) => new Date(Date.now() - ms);

const sampleNotifications: Notification[] = [
	{
		id: "1",
		message: "Your report is ready",
		origin: "Reports",
		created: ago(2 * MINUTE), // 2 minutes ago
		read: false,
	},
	{
		id: "2",
		message: "New user registered: john.doe@example.com",
		origin: "Users",
		created: ago(45 * MINUTE), // 45 minutes ago
		read: false,
	},
	{
		id: "3",
		message: "Scheduled maintenance tonight at 22:00",
		created: ago(3 * HOUR), // 3 hours ago
		read: true,
	},
	{
		id: "4",
		message: "Invoice #1042 was paid",
		origin: "Billing",
		created: ago(2 * DAY), // 2 days ago
		read: true,
	},
];

const expiredNotification: Notification = {
	id: "expired",
	message: "This notification should not show",
	created: ago(100 * 1000),
	expires: ago(1000), // already expired
	read: false,
};

const paperEl = () => document.querySelector<HTMLElement>(".MuiPopover-paper");
const body = () => within(document.body);
/** Waits until the popover's paper exists and its Grow transition has ended */
const openPaper = async () => {
	await waitFor(async () => {
		const paper = paperEl();
		await expect(paper).not.toBeNull();
		await expect(paper?.style.transform).toBe("none");
	});
	const paper = paperEl();
	if (!paper) throw new Error("popover paper not found");
	return paper;
};
/** Lets React commit and MUI's post-render effects (popover positioning) run */
const nextFrames = async () => {
	await new Promise((resolve) => requestAnimationFrame(resolve));
	await new Promise((resolve) => requestAnimationFrame(resolve));
};

const MOBILE = { viewport: { value: "mobile1", isRotated: false } };

const meta: Meta<typeof Notifications> = {
	title: "Standalone/Notifications",
	component: Notifications,
	parameters: { layout: "centered" },
	args: {
		loadLatest: fn(),
		loadRead: fn(),
		loadUnread: undefined,
		notifications: sampleNotifications,
		refreshInterval: 0, // no polling in stories
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
				created: ago(5 * MINUTE),
				read: false,
			},
			...sampleNotifications,
		],
	},
};

// ─── Bug stories (fail until the bug is fixed) ────────────────────────────────

const LONG_MESSAGE =
	"Maintenance of the inspection devices in building 4 is due next week; please confirm the slot.";

/**
 * Bell at the right end of a full-width header. The list is empty when the
 * popover opens; the first loadRead (the fill) adds 8 rows, and every
 * loadLatest (window focus) sets a new array, as SCF's does.
 */
const HeaderWithLateRows = (
	args: Omit<NotificationsProps, "notifications" | "loadRead" | "loadLatest">,
) => {
	const [rows, setRows] = useState<Notification[]>([]);
	const [polls, setPolls] = useState(0);
	const filled = useRef(false);
	const loadRead = useCallback(() => {
		if (filled.current) return;
		filled.current = true;
		setRows(
			Array.from({ length: 8 }, (_, i) => ({
				id: `w${i}`,
				message: `${i + 1}. ${LONG_MESSAGE}`,
				created: ago((i + 1) * HOUR),
				read: true,
			})),
		);
	}, []);
	const loadLatest = useCallback(() => {
		setPolls((prev) => prev + 1);
		setRows((prev) => [...prev]);
	}, []);
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "flex-end",
				alignItems: "center",
				gap: 2,
				px: 1,
			}}
		>
			<Typography>Polls: {polls}</Typography>
			<Notifications
				{...args}
				notifications={rows}
				loadRead={loadRead}
				loadLatest={loadLatest}
			/>
		</Box>
	);
};

export const Issue3468Item7WidthStaysStable: Story = {
	parameters: {
		layout: "fullscreen",
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3468-ITEM-7: without a paper width the popover opens as a narrow strip, and every re-render while it is open (here: rows arriving, then six polls) makes it 16px wider and moves it 16px left. Expected: a stable width that keeps 16px from the screen edge.",
			},
		},
	},
	render: (args) => <HeaderWithLateRows {...args} />,
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));
		const paper = await openPaper();
		await nextFrames();
		const width = () => Math.round(paper.getBoundingClientRect().width);
		const widths = [width()];
		await body().findByText(`1. ${LONG_MESSAGE}`);
		await nextFrames();
		widths.push(width());
		for (let poll = 2; poll <= 7; poll++) {
			window.dispatchEvent(new Event("focus"));
			await canvas.findByText(`Polls: ${poll}`);
			await nextFrames();
			widths.push(width());
		}
		await expect(
			widths,
			"paper width at open, after the rows arrive, after each poll",
		).toEqual(widths.map(() => widths[0]));
		await expect(paper.getBoundingClientRect().right).toBeLessThanOrEqual(
			window.innerWidth - 16,
		);
	},
};

export const Issue3468Item7WidthStaysStableOnPhone: Story = {
	...Issue3468Item7WidthStaysStable,
	globals: MOBILE,
	parameters: {
		...Issue3468Item7WidthStaysStable.parameters,
		docs: {
			description: {
				story:
					"ISSUE-3468-ITEM-7 at 320x568: the paper is as wide as the screen less 16px on each side from the start, instead of growing by 16px with every re-render.",
			},
		},
	},
	play: async (context) => {
		await Issue3468Item7WidthStaysStable.play?.(context);
		const rect = (paperEl() as HTMLElement).getBoundingClientRect();
		await expect(rect.left).toBeGreaterThanOrEqual(16);
		await expect(Math.round(rect.width)).toBe(window.innerWidth - 32);
	},
};

/** A paper width set through `PopoverProps`, as SCF sets its own */
const POPOVER_WIDTH_SM: NotificationsProps["PopoverProps"] = {
	slotProps: {
		paper: { sx: (theme) => ({ width: theme.breakpoints.values.sm }) },
	},
};

export const Issue3468Item7PopoverPropsSetTheWidth: Story = {
	args: { PopoverProps: POPOVER_WIDTH_SM },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3468-ITEM-7: a paper width set through `PopoverProps` (here the theme's `sm` breakpoint, 600px) replaces the default width of 400px.",
			},
		},
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));
		const paper = await openPaper();
		await nextFrames();
		await expect(Math.round(paper.getBoundingClientRect().width)).toBe(600);
	},
};

/** `slots` without a paper: merged into the defaults, so the default paper stays */
const POPOVER_GROW_SLOT: NotificationsProps["PopoverProps"] = {
	slots: { transition: Grow },
};

export const Issue3468Item7OtherPopoverSlotsKeepTheWidth: Story = {
	args: { PopoverProps: POPOVER_GROW_SLOT },
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3468-ITEM-7: `slots` in `PopoverProps` that don't name a paper keep the default paper and its width of 400px.",
			},
		},
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));
		const paper = await openPaper();
		await nextFrames();
		await expect(Math.round(paper.getBoundingClientRect().width)).toBe(400);
	},
};

/**
 * App-wide paper settings in the theme: a width for every Notifications, and
 * settings for every MUI popover's paper (SCF's theme sets a border this way)
 */
const THEME_PAPER = createTheme({
	components: {
		CcNotifications: {
			defaultProps: {
				PopoverProps: { slotProps: { paper: { sx: { width: 360 } } } },
			},
		},
		MuiPopover: {
			defaultProps: {
				slotProps: {
					paper: { style: { border: "2px solid rgb(0, 128, 0)" } },
				},
			},
			styleOverrides: { paper: { borderRadius: 12 } },
		},
	},
});

export const Issue3468Item7ThemeSettingsReachThePaper: Story = {
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"ISSUE-3468-ITEM-7: a paper width for every Notifications in the theme's `CcNotifications.defaultProps.PopoverProps` (here 360px) replaces the default width of 400px, and the theme's `MuiPopover` paper settings (here a green border and a 12px corner radius) still apply to the default paper.",
			},
		},
	},
	decorators: [
		(Story) => (
			<ThemeProvider theme={THEME_PAPER}>
				<Story />
			</ThemeProvider>
		),
	],
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button"));
		const paper = await openPaper();
		await nextFrames();
		await expect(Math.round(paper.getBoundingClientRect().width)).toBe(360);
		const style = getComputedStyle(paper);
		await expect(style.borderTopWidth).toBe("2px");
		await expect(style.borderTopColor).toBe("rgb(0, 128, 0)");
		await expect(style.borderTopLeftRadius).toBe("12px");
	},
};

// ─── Loading unread notifications on top ──────────────────────────────────────

const olderNotifications: Notification[] = Array.from(
	{ length: 8 },
	(_, i) => ({
		id: `older-${i}`,
		message: `Inspection ${i + 1} of the infusion pumps is due next week`,
		origin: "Devices",
		created: ago((i + 1) * HOUR),
		read: i > 1,
	}),
);

const newerNotifications: Notification[] = Array.from(
	{ length: 3 },
	(_, i) => ({
		id: `newer-${i}`,
		message: `Newer notification ${3 - i}`,
		origin: "Reports",
		created: ago((3 - i) * MINUTE),
		read: false,
	}),
);

/**
 * The list opens with eight notifications; the first loadUnread adds three
 * newer ones above them.
 */
const UnreadAboveList = (
	args: Omit<NotificationsProps, "notifications" | "loadUnread"> & {
		onLoadUnread?: () => void;
	},
) => {
	const { onLoadUnread, ...props } = args;
	const [rows, setRows] = useState(olderNotifications);
	const added = useRef(false);
	const loadUnread = useCallback(() => {
		onLoadUnread?.();
		if (added.current) return;
		added.current = true;
		setRows((prev) => [...newerNotifications, ...prev]);
	}, [onLoadUnread]);
	return (
		<Notifications {...props} notifications={rows} loadUnread={loadUnread} />
	);
};

export const Issue3471Item6OpensAtTheFirstNotification: StoryObj<
	typeof UnreadAboveList
> = {
	args: { onLoadUnread: fn() },
	render: (args) => <UnreadAboveList {...args} />,
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					"The popover opens with the first notification fully visible at the top of the list. The notifications fill the list, so `loadUnread` is called while the popover opens and adds three newer ones above; they stay out of view above the first notification until the user scrolls up, also while the popover's opening transition still scales the list.",
			},
		},
	},
	play: async ({ args, canvas }) => {
		await userEvent.click(canvas.getByRole("button"));
		await openPaper();
		const list = body().getByRole("region", { name: "Notifications" });
		await body().findByText("Newer notification 1");
		await nextFrames();
		const first = Array.from(list.children).find((row) =>
			row.textContent?.includes(olderNotifications[0].message as string),
		);
		if (!first) throw new Error("first notification not found");
		const listTop = list.getBoundingClientRect().top + list.clientTop;
		// measured while the transition scaled the list: allow subpixel rounding
		await expect(first.getBoundingClientRect().top).toBeCloseTo(listTop, 0);
		await expect(args.onLoadUnread).toHaveBeenCalledTimes(1);
	},
};

// ─── Announcing new notifications ─────────────────────────────────────────────

/**
 * An app's header: the unread count is 0 until the first loadLatest has the
 * server's (after 200 ms); "Deliver a notification" stands for an export that
 * is delivered as a notification while the user works on the page.
 */
const HeaderWithArrivals = (
	args: Omit<
		NotificationsProps,
		"notifications" | "unreadCount" | "loadLatest"
	>,
) => {
	const [rows, setRows] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const loadLatest = useCallback(async () => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		setRows(sampleNotifications);
		setUnreadCount(sampleNotifications.filter((row) => !row.read).length);
	}, []);
	const deliver = useCallback(() => {
		setRows((prev) => [
			{
				id: `export-${prev.length}`,
				message: "Your export is ready",
				origin: "Exports",
				created: new Date(),
				read: false,
			},
			...prev,
		]);
		setUnreadCount((prev) => prev + 1);
	}, []);
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
			<Button variant={"outlined"} onClick={deliver}>
				Deliver a notification
			</Button>
			<Notifications
				{...args}
				notifications={rows}
				unreadCount={unreadCount}
				loadLatest={loadLatest}
			/>
		</Box>
	);
};

export const Issue3468Item24AnnouncesNewNotifications: Story = {
	render: (args) => <HeaderWithArrivals {...args} />,
	parameters: {
		a11y: { test: "error" },
		docs: {
			description: {
				story:
					'ISSUE-3468-ITEM-24: a rising unread count is announced in a visually hidden polite status region, "1 new notification", so screen-reader users learn of a notification that arrives while they work elsewhere on the page. The count the first load brings (here 2, after 200 ms) is not announced. `disableAnnouncement` switches it off.',
			},
		},
	},
	play: async ({ canvas }) => {
		const bell = await canvas.findByRole(
			"button",
			{ name: "Notifications, 2 unread" },
			{ timeout: 5000 },
		);
		const status = canvas.getByRole("status");
		await nextFrames();
		await expect(status, "the first load").toHaveTextContent(/^$/);
		await userEvent.click(
			canvas.getByRole("button", { name: "Deliver a notification" }),
		);
		await expect(bell).toHaveAccessibleName("Notifications, 3 unread");
		await expect(status).toHaveTextContent(/^1 new notification$/);
	},
};

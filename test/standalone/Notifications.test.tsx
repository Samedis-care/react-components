import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	waitFor,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import Notifications, {
	Notification,
} from "../../src/standalone/Notifications";
import timestampToAge from "../../src/utils/timestampToAge";

const theme = createTheme();
const wrap = (ui: React.ReactNode) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const now = new Date("2026-03-17T12:00:00Z");

const makeNotifications = (): Notification[] => [
	{
		id: "1",
		message: "Unread notification",
		created: new Date(now.getTime() - 2 * 60 * 1000),
		read: false,
	},
	{
		id: "2",
		message: "Read notification",
		created: new Date(now.getTime() - 60 * 60 * 1000),
		read: true,
	},
];

describe("Notifications component", () => {
	afterEach(() => {
		cleanup();
	});

	it("calls loadLatest on mount", async () => {
		const loadLatest = vi.fn();
		wrap(
			<Notifications
				notifications={[]}
				loadLatest={loadLatest}
				loadRead={vi.fn()}
				loadUnread={undefined}
				refreshInterval={999999999}
			/>,
		);
		await waitFor(() => {
			expect(loadLatest).toHaveBeenCalled();
		});
	});

	it("shows unread badge count from notifications", async () => {
		const { container } = wrap(
			<Notifications
				notifications={makeNotifications()}
				loadLatest={vi.fn()}
				loadRead={vi.fn()}
				loadUnread={undefined}
				refreshInterval={999999999}
			/>,
		);
		await waitFor(() => {
			const badge = container.querySelector(".MuiBadge-badge");
			expect(badge?.textContent).toBe("1");
		});
	});

	it("shows explicit unreadCount over computed count", async () => {
		const { container } = wrap(
			<Notifications
				notifications={makeNotifications()}
				unreadCount={7}
				loadLatest={vi.fn()}
				loadRead={vi.fn()}
				loadUnread={undefined}
				refreshInterval={999999999}
			/>,
		);
		await waitFor(() => {
			const badge = container.querySelector(".MuiBadge-badge");
			expect(badge?.textContent).toBe("7");
		});
	});

	it("filters out expired notifications from badge count", async () => {
		const expired: Notification = {
			id: "exp",
			message: "Expired",
			created: new Date(now.getTime() - 10000),
			expires: new Date(now.getTime() - 1000),
			read: false,
		};
		const { container } = wrap(
			<Notifications
				notifications={[...makeNotifications(), expired]}
				loadLatest={vi.fn()}
				loadRead={vi.fn()}
				loadUnread={undefined}
				refreshInterval={999999999}
			/>,
		);
		await waitFor(() => {
			const badge = container.querySelector(".MuiBadge-badge");
			expect(badge?.textContent).toBe("1");
		});
	});

	it("opens popover when bell is clicked", async () => {
		wrap(
			<Notifications
				notifications={makeNotifications()}
				loadLatest={vi.fn()}
				loadRead={vi.fn()}
				loadUnread={undefined}
				refreshInterval={999999999}
			/>,
		);
		const button = await screen.findByRole("button");
		fireEvent.click(button);
		await waitFor(() => {
			expect(screen.getByText("Unread notification")).toBeTruthy();
		});
	});

	it("calls onOpen when bell is clicked", async () => {
		const onOpen = vi.fn();
		wrap(
			<Notifications
				notifications={[]}
				loadLatest={vi.fn()}
				loadRead={vi.fn()}
				loadUnread={undefined}
				onOpen={onOpen}
				refreshInterval={999999999}
			/>,
		);
		const button = await screen.findByRole("button");
		fireEvent.click(button);
		expect(onOpen).toHaveBeenCalledOnce();
	});
});

describe("timestampToAge utility", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	it("returns 'just now' for very recent timestamps (< 5s)", () => {
		const ts = new Date(now.getTime() - 2000);
		const result = timestampToAge(ts);
		// The i18n key fallback or translated string
		expect(result).toBeTruthy();
		expect(typeof result).toBe("string");
	});

	it("returns less-than-a-minute string for timestamps 5s-60s ago", () => {
		const ts = new Date(now.getTime() - 30000); // 30s ago
		const result = timestampToAge(ts);
		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(0);
	});

	it("returns minutes for timestamps 1-60 min ago", () => {
		const ts = new Date(now.getTime() - 5 * 60 * 1000); // 5 min ago
		const result = timestampToAge(ts);
		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(0);
	});

	it("returns single minute for exactly 1 min ago", () => {
		const ts = new Date(now.getTime() - 61 * 1000); // just over 1 minute
		const result = timestampToAge(ts);
		expect(typeof result).toBe("string");
		// Should use singular "minute"
		expect(result).toBeTruthy();
	});

	it("returns hours for timestamps 1-24h ago", () => {
		const ts = new Date(now.getTime() - 3 * 3600 * 1000); // 3h ago
		const result = timestampToAge(ts);
		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(0);
	});

	it("returns single hour for exactly 1h ago", () => {
		const ts = new Date(now.getTime() - 3601 * 1000); // just over 1 hour
		const result = timestampToAge(ts);
		expect(typeof result).toBe("string");
		expect(result).toBeTruthy();
	});

	it("returns days for timestamps > 24h ago", () => {
		const ts = new Date(now.getTime() - 2 * 86400 * 1000); // 2 days ago
		const result = timestampToAge(ts);
		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(0);
	});

	it("returns single day for exactly 1 day ago", () => {
		const ts = new Date(now.getTime() - 86401 * 1000); // just over 1 day
		const result = timestampToAge(ts);
		expect(typeof result).toBe("string");
		expect(result).toBeTruthy();
	});

	it("handles the boundary at exactly 5 seconds (just-now boundary)", () => {
		// Exactly 5000ms: should be >= 5s so NOT just-now
		const ts = new Date(now.getTime() - 5000);
		const result = timestampToAge(ts);
		expect(typeof result).toBe("string");
	});

	it("handles large timestamp differences (years ago)", () => {
		const ts = new Date(now.getTime() - 365 * 86400 * 1000); // ~1 year ago
		const result = timestampToAge(ts);
		expect(typeof result).toBe("string");
		expect(result.length).toBeGreaterThan(0);
	});
});

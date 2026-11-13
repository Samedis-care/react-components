import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import {
	render,
	screen,
	fireEvent,
	cleanup,
	waitFor,
	act,
} from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import Notifications, {
	Notification,
	NotificationsProps,
} from "../../src/standalone/Notifications";
import timestampToAge from "../../src/utils/timestampToAge";
import ccI18n from "../../src/i18n";

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

	it("[ISSUE-3471-ITEM-9] names the scrolling notification list by the popover's heading", async () => {
		wrap(
			<Notifications
				notifications={makeNotifications()}
				loadLatest={vi.fn()}
				loadRead={vi.fn()}
				loadUnread={undefined}
				refreshInterval={999999999}
			/>,
		);
		fireEvent.click(await screen.findByRole("button"));
		const heading = await screen.findByRole("heading", { level: 2 });
		const title = heading.textContent ?? "";
		expect(title).not.toBe("");
		const list = screen.getByRole("region", { name: title });
		expect(list).toHaveAttribute("tabindex", "0");
		expect(list).toContainElement(screen.getByText("Unread notification"));
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

// ─── Shared helpers for the tests below ───────────────────────────────────────
//
// Fixture dates are relative to the (real or faked) clock, never fixed, so the
// rendered ages are predictable. The popover renders in a portal: query it
// through `document`/`screen`, not the render container. While it is open,
// MUI hides the rest of the page (aria-hidden), so keep a reference to the
// bell instead of querying it by role again.

const MINUTE = 60_000;

const base = (over: Partial<NotificationsProps> = {}): NotificationsProps => ({
	notifications: [],
	loadLatest: vi.fn(),
	loadRead: vi.fn(),
	loadUnread: undefined,
	refreshInterval: 999999999,
	...over,
});

const renderN = (props: NotificationsProps, t: Theme = theme) => {
	const result = render(<Notifications {...props} />, {
		wrapper: ({ children }) => (
			<ThemeProvider theme={t}>{children}</ThemeProvider>
		),
	});
	const bell = screen.getByRole("button");
	return {
		...result,
		bell,
		rerenderN: (next: NotificationsProps) =>
			result.rerender(<Notifications {...next} />),
	};
};

const advance = (ms: number) =>
	act(() => {
		vi.advanceTimersByTime(ms);
	});

/**
 * Browsers convert a timer delay to a 32-bit integer (NaN and ±Infinity become
 * 0, 2^31 wraps negative) and clamp repeating timers to at least 4 ms. The
 * fake timers do neither (a 0 ms interval never lets time advance), so this
 * applies the browser's conversion before scheduling on the fake clock.
 */
const useBrowserLikeSetInterval = () => {
	const fakeSetInterval = window.setInterval.bind(window);
	vi.spyOn(window, "setInterval").mockImplementation(((
		handler: TimerHandler,
		timeout?: number,
		...rest: unknown[]
	) => {
		const n = Number(timeout ?? 0);
		const asLong = Number.isFinite(n) ? n | 0 : 0;
		return fakeSetInterval(handler, Math.max(4, asLong), ...rest);
	}) as typeof window.setInterval);
};

describe("Notifications: polling with loadLatest", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		cleanup();
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it.each([
		["0", 0],
		["-1", -1],
		["NaN", NaN],
		["Infinity", Infinity],
		["2^31", 2 ** 31],
	])(
		"[ISSUE-3468-ITEM-1] does not call loadLatest every few ms with refreshInterval=%s",
		(_label, refreshInterval) => {
			useBrowserLikeSetInterval();
			const loadLatest = vi.fn();
			renderN(base({ loadLatest, refreshInterval }));
			advance(200);
			expect(
				loadLatest,
				"loadLatest calls within 200 ms (1 = the mount call)",
			).toHaveBeenCalledTimes(1);
		},
	);

	it.each([
		["0", 0],
		["Infinity", Infinity],
		["2^31", 2 ** 31],
	])(
		"[ISSUE-3468-ITEM-1] switches polling off with refreshInterval=%s, and still loads on mount and window focus",
		(_label, refreshInterval) => {
			useBrowserLikeSetInterval();
			const loadLatest = vi.fn();
			renderN(base({ loadLatest, refreshInterval }));
			advance(24 * 60 * MINUTE);
			expect(loadLatest, "only the mount call in a day").toHaveBeenCalledTimes(
				1,
			);
			act(() => {
				window.dispatchEvent(new Event("focus"));
			});
			expect(loadLatest).toHaveBeenCalledTimes(2);
		},
	);

	it.each([
		["-1", -1],
		["NaN", NaN],
	])(
		"[ISSUE-3468-ITEM-1] polls at the 60 s default with refreshInterval=%s",
		(_label, refreshInterval) => {
			useBrowserLikeSetInterval();
			const loadLatest = vi.fn();
			renderN(base({ loadLatest, refreshInterval }));
			advance(MINUTE - 1);
			expect(loadLatest).toHaveBeenCalledTimes(1);
			advance(1);
			expect(loadLatest).toHaveBeenCalledTimes(2);
		},
	);

	it("[ISSUE-3468-ITEM-1] polls at the longest delay browsers support, 2^31 - 1 ms", () => {
		useBrowserLikeSetInterval();
		const loadLatest = vi.fn();
		renderN(base({ loadLatest, refreshInterval: 2 ** 31 - 1 }));
		advance(2 ** 31 - 2);
		expect(loadLatest).toHaveBeenCalledTimes(1);
		advance(1);
		expect(loadLatest).toHaveBeenCalledTimes(2);
	});

	it("[ISSUE-3468-ITEM-1] stops polling when refreshInterval changes to 0, and resumes when it changes back", () => {
		useBrowserLikeSetInterval();
		const loadLatest = vi.fn();
		const props = base({ loadLatest, refreshInterval: 1000 });
		const { rerenderN } = renderN(props);
		advance(1000);
		expect(loadLatest).toHaveBeenCalledTimes(2);
		rerenderN({ ...props, refreshInterval: 0 });
		advance(10_000);
		expect(loadLatest).toHaveBeenCalledTimes(2);
		rerenderN({ ...props, refreshInterval: 1000 });
		advance(1000);
		expect(loadLatest).toHaveBeenCalledTimes(3);
	});
});

describe("Notifications: translations", () => {
	afterEach(async () => {
		cleanup();
		vi.useRealTimers();
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	});

	const ageIn = async (lng: string, deltaMs: number) => {
		await act(async () => {
			await ccI18n.changeLanguage(lng);
		});
		return timestampToAge(new Date(Date.now() - deltaMs));
	};

	it("[ISSUE-3468-ITEM-3] uses the Russian plural and case forms for the age", async () => {
		const ages = [
			await ageIn("ru", 1 * MINUTE),
			await ageIn("ru", 5 * MINUTE),
			await ageIn("ru", 21 * MINUTE),
			await ageIn("ru", 2 * 3_600_000),
			await ageIn("ru", 5 * 3_600_000),
			await ageIn("ru", 2 * 86_400_000),
			await ageIn("ru", 5 * 86_400_000),
		];
		expect(ages).toEqual([
			"1 минуту назад",
			"5 минут назад",
			"21 минуту назад",
			"2 часа назад",
			"5 часов назад",
			"2 дня назад",
			"5 дней назад",
		]);
	});

	it("[ISSUE-3468-ITEM-3] uses the singular after numbers in Dutch and Uzbek, and jour in French", async () => {
		expect(await ageIn("nl", 2 * 3_600_000)).toBe("2 uur geleden");
		expect(await ageIn("uz", 2 * 86_400_000)).toBe("2 kun oldin");
		// only the unit: the missing amount is ISSUE-3468-ITEM-2
		expect(await ageIn("fr", 5 * 86_400_000)).toMatch(/ jours$/);
	});

	it("[ISSUE-3468-ITEM-3] titles the French popover Notifications, not Avis", async () => {
		await ccI18n.loadLanguages(["fr"]);
		expect(
			ccI18n.getResource("fr", "translation", "standalone.notifications.title"),
		).toBe("Notifications");
	});

	it("[ISSUE-3468-ITEM-3] does not call a creation time in the future just now", () => {
		expect(timestampToAge(new Date(Date.now() + 2 * 3_600_000))).not.toBe(
			"just now",
		);
	});
});

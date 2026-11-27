import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import React from "react";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { createTheme, Theme, ThemeProvider } from "@mui/material";
import { createMemoryHistory, MemoryHistory } from "history";
import SignalPortlet, {
	SignalPortletProps,
} from "../../src/standalone/SignalPortlet";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import ccI18n from "../../src/i18n";
import { waitForCcI18n } from "../waitForCcI18n";
import timestampToAge from "../../src/utils/timestampToAge";

// The component-level tests. SignalPortlet.test.ts next to this file mocks the
// i18n module for the timestampToAge helper, so the component, which needs the
// real translations, is tested here.

const MINUTE = 60_000;

const theme = createTheme();

const renderP = (
	props: SignalPortletProps,
	opts: { history?: MemoryHistory; theme?: Theme } = {},
) => {
	const history = opts.history ?? createMemoryHistory();
	const t = opts.theme ?? theme;
	const Wrapper = ({ children }: { children: React.ReactNode }) => (
		<ThemeProvider theme={t}>
			<HistoryRouter history={history}>{children}</HistoryRouter>
		</ThemeProvider>
	);
	const result = render(<SignalPortlet {...props} />, { wrapper: Wrapper });
	return {
		...result,
		history,
		rerenderP: (next: SignalPortletProps) =>
			result.rerender(<SignalPortlet {...next} />),
	};
};

/** The count avatars, in item order */
const avatars = (container: HTMLElement) =>
	Array.from(container.querySelectorAll<HTMLElement>(".MuiAvatar-root"));

const ageLabel = () => screen.queryByText(/^Last refresh: /);

const refreshButton = () => screen.queryByRole("button", { name: "Refresh" });

beforeAll(async () => {
	await waitForCcI18n();
	await ccI18n.changeLanguage("en");
});

afterEach(async () => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
	if (ccI18n.language !== "en") {
		await act(async () => {
			await ccI18n.changeLanguage("en");
		});
	}
});

describe("SignalPortlet: content", () => {
	it("[ISSUE-3469-ITEM-1] does not show a count above 999 as 999", () => {
		const { container } = renderP({
			title: "T",
			items: [
				{ count: 999, text: "exactly" },
				{ count: 1500, text: "more" },
			],
		});
		const [exactly, more] = avatars(container).map((a) => a.textContent);
		expect(exactly).toBe("999");
		// e.g. "999+", with the full number for assistive technology
		expect(more, "1500 reads exactly like 999").not.toBe(exactly);
	});

	it('[ISSUE-3469-ITEM-1] shows a count above 999 as "999+" and names the row with the full number', () => {
		const { container, rerenderP } = renderP({
			title: "T",
			items: [
				{ count: 1000, text: "Records", link: "/records" },
				{ count: 1500, text: "Devices" },
			],
		});
		const [linked, plain] = avatars(container);
		// the visible "999+" is hidden from assistive technology, which gets
		// the full number instead
		for (const [avatar, full] of [
			[linked, "1000"],
			[plain, "1500"],
		] as const) {
			const capped = within(avatar).getByText("999+");
			expect(capped).toHaveAttribute("aria-hidden", "true");
			expect(within(avatar).getByText(full)).not.toHaveAttribute("aria-hidden");
		}
		expect(
			screen.getByRole("link", { name: "1000 Records" }),
		).toBeInTheDocument();

		// a count that drops to 999 or below shows as it is again
		rerenderP({
			title: "T",
			items: [
				{ count: 999, text: "Records", link: "/records" },
				{ count: 12, text: "Devices" },
			],
		});
		expect(avatars(container).map((a) => a.textContent)).toEqual(["999", "12"]);
		expect(
			screen.getByRole("link", { name: "999 Records" }),
		).toBeInTheDocument();
		expect(screen.queryByText("999+")).toBeNull();
	});

	it("[ISSUE-3469-ITEM-1] applies an item's classes.countCapped and countFull", () => {
		renderP({
			title: "T",
			items: [
				{
					count: 1500,
					text: "Devices",
					classes: { countCapped: "capped", countFull: "full" },
				},
			],
		});
		expect(screen.getByText("999+")).toHaveClass("capped");
		expect(screen.getByText("1500")).toHaveClass("full");
	});
});

describe("SignalPortlet: footer", () => {
	it("[ISSUE-3469-ITEM-2] updates the age while mounted, without new props", () => {
		vi.useFakeTimers();
		const props: SignalPortletProps = {
			title: "T",
			items: [],
			updatedAt: Date.now(),
		};
		renderP(props);
		expect(ageLabel()).toHaveTextContent("Last refresh: now");
		act(() => {
			vi.advanceTimersByTime(10 * MINUTE);
		});
		expect(ageLabel()).toHaveTextContent("Last refresh: 10 minutes ago");
	});

	it("[ISSUE-3469-ITEM-2] changes the age when it reaches the next minute, also when mounted mid-minute", () => {
		vi.useFakeTimers();
		const updatedAt = new Date(Date.now() - 90_000);
		renderP({ title: "T", items: [], updatedAt });
		const shown = ageLabel()?.textContent;
		act(() => {
			vi.advanceTimersByTime(30_000 - 1);
		});
		expect(ageLabel()?.textContent).toBe(shown);
		act(() => {
			vi.advanceTimersByTime(1);
		});
		expect(ageLabel()?.textContent).not.toBe(shown);
		expect(ageLabel()?.textContent).toBe(
			`Last refresh: ${timestampToAge(updatedAt)}`,
		);
		// the changing age is not announced
		expect(
			ageLabel()?.closest(
				'[aria-live]:not([aria-live="off"]), [role="status"]',
			),
		).toBeNull();
	});

	it("[ISSUE-3469-ITEM-2] leaves no timer behind once unmounted", () => {
		vi.useFakeTimers();
		const { unmount } = renderP({
			title: "T",
			items: [],
			updatedAt: Date.now(),
		});
		expect(vi.getTimerCount()).toBeGreaterThan(0);
		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});

	it.each([
		["0", 0],
		["NaN", NaN],
	])(
		"[ISSUE-3469-ITEM-3] shows no stray text for updatedAt=%s next to the Refresh button",
		(_, updatedAt) => {
			renderP({ title: "T", items: [], updatedAt, onRefresh: vi.fn() });
			const footer = (refreshButton() as HTMLElement).parentElement
				?.parentElement as HTMLElement;
			expect(footer.textContent).not.toBe("0");
			expect(footer.textContent).not.toContain("NaN");
		},
	);

	it("[ISSUE-3469-ITEM-3] shows no NaN age for an invalid Date", () => {
		renderP({ title: "T", items: [], updatedAt: new Date("garbage") });
		expect(screen.queryByText(/NaN/)).toBeNull();
	});

	it.each([
		["null", null],
		["undefined", undefined],
		["0", 0],
		["NaN", NaN],
		['new Date("garbage")', new Date("garbage")],
		["new Date(0)", new Date(0)],
	])(
		"[ISSUE-3469-ITEM-3] treats updatedAt=%s as no time: no label, no timer, and no footer text besides the Refresh button",
		(_, updatedAt) => {
			vi.useFakeTimers();
			const { rerenderP } = renderP({
				title: "T",
				items: [],
				updatedAt,
				onRefresh: vi.fn(),
			});
			const footer = (refreshButton() as HTMLElement).parentElement
				?.parentElement as HTMLElement;
			expect(footer.textContent).toBe("");
			expect(vi.getTimerCount()).toBe(0);

			// without onRefresh, nothing shows below the title
			rerenderP({ title: "T", items: [], updatedAt });
			expect(refreshButton()).toBeNull();
			expect(
				screen.getByRole("heading").closest(".MuiPaper-root"),
			).toHaveTextContent(/^T$/);
		},
	);

	it("[ISSUE-3469-ITEM-3] shows the label once updatedAt turns from 0 to a time, as react-query's dataUpdatedAt does after the first fetch", () => {
		vi.useFakeTimers();
		const onRefresh = vi.fn();
		const { rerenderP } = renderP({
			title: "T",
			items: [],
			updatedAt: 0,
			onRefresh,
		});
		expect(ageLabel()).toBeNull();
		const fetchedAt = Date.now() - 2 * MINUTE;
		rerenderP({ title: "T", items: [], updatedAt: fetchedAt, onRefresh });
		expect(ageLabel()).toHaveTextContent(
			`Last refresh: ${timestampToAge(new Date(fetchedAt))}`,
		);
	});

	it("[ISSUE-3469-ITEM-7] calls onRefresh without arguments", () => {
		const onRefresh = vi.fn();
		renderP({ title: "T", items: [], onRefresh });
		fireEvent.click(refreshButton() as HTMLElement);
		expect(onRefresh).toHaveBeenCalledWith();
	});

	it("[ISSUE-3469-ITEM-7] calls an onRefresh replaced after mount, and only that one, without arguments", () => {
		const first = vi.fn();
		const second = vi.fn();
		const { rerenderP } = renderP({ title: "T", items: [], onRefresh: first });
		rerenderP({ title: "T", items: [], onRefresh: second });
		fireEvent.click(refreshButton() as HTMLElement);
		expect(first).not.toHaveBeenCalled();
		expect(second.mock.calls).toEqual([[]]);
	});
});

describe("SignalPortlet: theme and classes", () => {
	it("[ISSUE-3469-ITEM-13] puts a row's className, classes.item and root on its <li>, and rootBtn on the link of a linked row", () => {
		const t = createTheme({
			components: {
				CcSignalPortlet: { styleOverrides: { item: { columnGap: "8px" } } },
				CcSignalPortletItem: {
					styleOverrides: {
						root: { rowGap: "6px" },
						rootBtn: { rowGap: "7px" },
					},
				},
			},
		});
		const itemClasses = { root: "i-root", rootBtn: "i-btn" };
		renderP(
			{
				title: "T",
				classes: { item: "c-item" },
				items: [
					{ count: 1, text: "linked", link: "/a", classes: itemClasses },
					{ count: 2, text: "plain", classes: itemClasses },
				],
			},
			{ theme: t },
		);
		const [linked, plain] = Array.from(screen.getByRole("list").children);
		for (const row of [linked, plain]) {
			expect(row).toHaveClass("c-item", "i-root");
			expect(row).not.toHaveClass("i-btn");
			expect(getComputedStyle(row).columnGap).toBe("8px");
			expect(getComputedStyle(row).rowGap).toBe("6px");
		}
		const btn = screen.getByRole("link", { name: "1 linked" });
		expect(btn.parentElement).toBe(linked);
		expect(btn).toHaveClass("i-btn");
		expect(btn).not.toHaveClass("c-item");
		expect(btn).not.toHaveClass("i-root");
		expect(getComputedStyle(btn).rowGap).toBe("7px");
		expect(getComputedStyle(btn).columnGap).not.toBe("8px");
		// a row without link has no link
		expect(within(plain as HTMLElement).queryByRole("link")).toBeNull();
	});

	it("[ISSUE-3469-ITEM-4] applies classes.lastUpdatedAt, refreshIconButton and refreshIcon, and an item's classes.listText", () => {
		renderP({
			title: "T",
			items: [{ count: 1, text: "row", classes: { listText: "i-listText" } }],
			updatedAt: Date.now(),
			onRefresh: vi.fn(),
			classes: {
				lastUpdatedAt: "c-last",
				refreshIconButton: "c-btn",
				refreshIcon: "c-icon",
			},
		});
		const btn = refreshButton() as HTMLElement;
		expect({
			lastUpdatedAt: ageLabel()?.classList.contains("c-last"),
			refreshIconButton: btn.classList.contains("c-btn"),
			refreshIcon: btn.querySelector("svg")?.classList.contains("c-icon"),
			listText: screen
				.getByText("row")
				.closest(".MuiListItemText-root")
				?.classList.contains("i-listText"),
		}).toEqual({
			lastUpdatedAt: true,
			refreshIconButton: true,
			refreshIcon: true,
			listText: true,
		});
	});

	it("[ISSUE-3469-ITEM-4] keeps the theme's styleOverrides of those slots next to their classes", () => {
		const t = createTheme({
			components: {
				CcSignalPortlet: {
					styleOverrides: {
						lastUpdatedAt: { columnGap: "1px" },
						refreshIconButton: { columnGap: "2px" },
						refreshIcon: { columnGap: "3px" },
					},
				},
				CcSignalPortletItem: {
					styleOverrides: { listText: { columnGap: "4px" } },
				},
			},
		});
		renderP(
			{
				title: "T",
				items: [{ count: 1, text: "row", classes: { listText: "i-listText" } }],
				updatedAt: Date.now(),
				onRefresh: vi.fn(),
				classes: {
					lastUpdatedAt: "c-last",
					refreshIconButton: "c-btn",
					refreshIcon: "c-icon",
				},
			},
			{ theme: t },
		);
		const label = ageLabel() as HTMLElement;
		const btn = refreshButton() as HTMLElement;
		const icon = btn.querySelector("svg") as SVGElement;
		const text = screen
			.getByText("row")
			.closest(".MuiListItemText-root") as HTMLElement;
		expect(label).toHaveClass("c-last");
		expect(getComputedStyle(label).columnGap).toBe("1px");
		expect(btn).toHaveClass("c-btn");
		expect(getComputedStyle(btn).columnGap).toBe("2px");
		expect(icon).toHaveClass("c-icon");
		expect(getComputedStyle(icon).columnGap).toBe("3px");
		expect(text).toHaveClass("i-listText");
		expect(getComputedStyle(text).columnGap).toBe("4px");
	});

	it("[ISSUE-3469-ITEM-5] keeps classes.item on a row that has its own className", () => {
		renderP({
			title: "T",
			classes: { item: "c-item" },
			items: [
				{ count: 1, text: "own", className: "own-class" },
				{ count: 1, text: "plain" },
			],
		});
		const [own, plain] = Array.from(screen.getByRole("list").children);
		expect(plain).toHaveClass("c-item");
		expect(own).toHaveClass("own-class", "c-item");
	});
});

describe("SignalPortlet: accessibility", () => {
	it("[ISSUE-3469-ITEM-12] exposes a linked row as a link to its path, and leaves modified clicks to the browser", () => {
		const { history } = renderP({
			title: "T",
			items: [{ count: 5, text: "Open", link: "/a?x=1" }],
		});
		const link = screen.getByRole("link", { name: "5 Open" });
		expect(link).toHaveAttribute("href", "/a?x=1");
		fireEvent.click(link, { ctrlKey: true });
		expect(history.location.pathname).toBe("/");
	});

	it("[ISSUE-3469-ITEM-12] routes a plain click on a linked row in the app, and follows a changed link", () => {
		vi.spyOn(window, "scrollTo").mockImplementation(() => {});
		const { history, rerenderP } = renderP({
			title: "T",
			items: [
				{ count: 5, text: "Open", link: "/a?x=1" },
				{ count: 2, text: "Plain" },
			],
		});
		// no button left: the linked row is the link, the plain row is static
		expect(screen.queryByRole("button")).toBeNull();
		const link = screen.getByRole("link", { name: "5 Open" });
		// a plain click goes through the history instead of loading the href
		expect(fireEvent.click(link), "default prevented").toBe(false);
		expect(history.location).toMatchObject({ pathname: "/a", search: "?x=1" });

		rerenderP({ title: "T", items: [{ count: 5, text: "Open", link: "/b" }] });
		expect(screen.getByRole("link", { name: "5 Open" })).toHaveAttribute(
			"href",
			"/b",
		);
	});

	it("[ISSUE-3469-ITEM-12] links a row to a URL with a scheme as a plain link", () => {
		renderP({
			title: "T",
			items: [{ count: 1, text: "Docs", link: "https://example.com/docs" }],
		});
		expect(screen.getByRole("link", { name: "1 Docs" })).toHaveAttribute(
			"href",
			"https://example.com/docs",
		);
	});

	it("[ISSUE-3469-ITEM-13] renders every row, linked or not, as a list item", () => {
		renderP({
			title: "T",
			items: [
				{ count: 1, text: "linked", link: "/a" },
				{ count: 2, text: "plain" },
				{ count: null, text: "loading", link: "/b" },
			],
		});
		const list = screen.getByRole("list");
		expect(Array.from(list.children).map((c) => c.tagName)).toEqual([
			"LI",
			"LI",
			"LI",
		]);
		expect(within(list).getAllByRole("listitem")).toHaveLength(3);
	});
});

import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup, act, within } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import { createMemoryHistory, MemoryHistory } from "history";
import SignalPortlet, {
	SignalPortletProps,
} from "../../src/standalone/SignalPortlet";
import HistoryRouter from "../../src/standalone/Routes/HistoryRouter";
import ccI18n from "../../src/i18n";
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
			screen.getByRole("button", { name: "1000 Records" }),
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
			screen.getByRole("button", { name: "999 Records" }),
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
});

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

// The component-level tests. SignalPortlet.test.ts next to this file mocks the
// i18n module for the timestampToAge helper, so the component, which needs the
// real translations, is tested here.

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

import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import ccI18n from "../../src/i18n";
import WeekView from "../../src/standalone/Schedule/Weekly";
import type { IDayData } from "../../src/standalone/Schedule/Common/DayContents";

/** 7 days, one entry each, titled `<tag>-idx<i>` (i = index in the loadData result) */
const week = (tag: string): IDayData[][] =>
	Array.from({ length: 7 }, (_, i) => [
		{ id: `${tag}-${i}`, title: `${tag}-idx${i}` },
	]);

/** lets the async load IIFE settle (real macrotask; only Date is faked) */
const flush = async () => {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
};

const click = (name: string | RegExp) =>
	fireEvent.click(screen.getByRole("button", { name }));

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

describe("header layout of filters and actions", () => {
	/**
	 * the action button inline in the header, or else inside the settings menu.
	 * Inline is looked up while the menu is closed: an open menu hides the rest
	 * of the page from AT (aria-hidden), so getByRole would not see it then.
	 */
	const findAction = async (name: string) => {
		const inline = screen.queryByRole("button", { name });
		if (inline) return inline;
		click("Filter settings");
		const menu = await screen.findByRole("menu");
		return within(menu).getByRole("button", { name });
	};

	it("[ISSUE-3477-ITEM-1] with the settings menu, the first action is still reachable", async () => {
		const first = vi.fn();
		render(
			<WeekView
				loadData={() => week("w")}
				actions={[
					{ id: "a", label: "First action", onClick: first },
					{ id: "b", label: "Second action", onClick: vi.fn() },
				]}
			/>,
		);
		await flush();
		fireEvent.click(await findAction("First action"));
		expect(first).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3477-ITEM-1] 3 filters and 1 action: the action is still reachable", async () => {
		const only = vi.fn();
		render(
			<WeekView
				loadData={() => week("w")}
				filters={{
					a: { type: "checkbox", label: "Alpha", defaultValue: false },
					b: { type: "checkbox", label: "Beta", defaultValue: false },
					c: { type: "checkbox", label: "Gamma", defaultValue: false },
				}}
				actions={[{ id: "a", label: "Only action", onClick: only }]}
			/>,
		);
		await flush();
		fireEvent.click(await findAction("Only action"));
		expect(only).toHaveBeenCalledTimes(1);
	});

	it("[ISSUE-3477-ITEM-1] 3 filters and no actions: the menu ends without a divider", async () => {
		render(
			<WeekView
				loadData={() => week("w")}
				filters={{
					a: { type: "checkbox", label: "Alpha", defaultValue: false },
					b: { type: "checkbox", label: "Beta", defaultValue: false },
					c: { type: "checkbox", label: "Gamma", defaultValue: false },
				}}
			/>,
		);
		await flush();
		click("Filter settings");
		const menu = await screen.findByRole("menu");
		expect(within(menu).queryByRole("separator")).toBeNull();
	});

	it("[ISSUE-3477-ITEM-1] 2 filters and 2 actions: the menu lists filter 2, a divider, then both actions in order", async () => {
		render(
			<WeekView
				loadData={() => week("w")}
				filters={{
					a: { type: "checkbox", label: "Alpha", defaultValue: false },
					b: { type: "checkbox", label: "Beta", defaultValue: false },
				}}
				actions={[
					{ id: "a", label: "First action", onClick: vi.fn() },
					{ id: "b", label: "Second action", onClick: vi.fn() },
				]}
			/>,
		);
		await flush();
		click("Filter settings");
		const menu = await screen.findByRole("menu");
		const order = Array.from(
			menu.querySelectorAll("input, hr, button"),
			(el) =>
				el.tagName === "HR"
					? "divider"
					: el.tagName === "INPUT"
						? el.getAttribute("name")
						: el.textContent,
		);
		expect(order).toEqual(["b", "divider", "First action", "Second action"]);
	});

	it("[ISSUE-3477-ITEM-1] 1 filter and 2 actions: the menu holds only the actions, without a divider", async () => {
		render(
			<WeekView
				loadData={() => week("w")}
				filters={{
					a: { type: "checkbox", label: "Alpha", defaultValue: false },
				}}
				actions={[
					{ id: "a", label: "First action", onClick: vi.fn() },
					{ id: "b", label: "Second action", onClick: vi.fn() },
				]}
			/>,
		);
		await flush();
		click("Filter settings");
		const menu = await screen.findByRole("menu");
		expect(within(menu).queryByRole("separator")).toBeNull();
		expect(within(menu).queryByRole("checkbox")).toBeNull();
		expect(
			within(menu)
				.getAllByRole("button")
				.map((b) => b.textContent),
		).toEqual(["First action", "Second action"]);
	});
});

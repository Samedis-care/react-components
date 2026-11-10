import { describe, it, expect, afterEach, beforeAll, beforeEach } from "vitest";
import React from "react";
import { render, cleanup, screen, act } from "@testing-library/react";
import { Framework } from "../../src/framework";

// jsdom does not implement matchMedia, which the Framework's ThemeProvider needs.
beforeAll(() => {
	if (!window.matchMedia) {
		window.matchMedia = (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		});
	}
});

const removeViewportMetas = () =>
	document
		.querySelectorAll("meta[name='viewport']")
		.forEach((meta) => meta.remove());
const viewportContent = () =>
	document.querySelector<HTMLMetaElement>("meta[name='viewport']")?.content;

// An app whose first render never stops suspending: the Framework keeps
// showing its Loader.
const never = new Promise<void>(() => {});
const SuspendingApp = () => {
	React.use(never);
	return null;
};

beforeEach(removeViewportMetas);
afterEach(() => {
	cleanup();
	removeViewportMetas();
});

describe("MobileScalingFix in Framework", () => {
	it("is mounted with mobileScalingFixProps", async () => {
		render(
			<Framework mobileScalingFixProps={{ minWidth: 320 }}>
				<div>app</div>
			</Framework>,
		);
		await screen.findByText("app");
		expect(viewportContent()).toBe("width=320, initial-scale=1");
	});

	it("uses device-width without mobileScalingFixProps", async () => {
		render(
			<Framework>
				<div>app</div>
			</Framework>,
		);
		await screen.findByText("app");
		expect(viewportContent()).toBe("width=device-width, initial-scale=1");
	});

	it("is not mounted with disableMobileScalingFix", async () => {
		render(
			<Framework disableMobileScalingFix>
				<div>app</div>
			</Framework>,
		);
		await screen.findByText("app");
		expect(viewportContent()).toBeUndefined();
	});

	it("[ISSUE-3459-ITEM-5] restores the page's viewport when disableMobileScalingFix turns true", async () => {
		const meta = document.createElement("meta");
		meta.name = "viewport";
		meta.content = "width=device-width, initial-scale=1";
		document.head.appendChild(meta);
		const { rerender } = render(
			<Framework mobileScalingFixProps={{ minWidth: 1000 }}>
				<div>app</div>
			</Framework>,
		);
		await screen.findByText("app");
		expect(meta.content).toBe("width=1000, initial-scale=1");
		rerender(
			<Framework
				mobileScalingFixProps={{ minWidth: 1000 }}
				disableMobileScalingFix
			>
				<div>app</div>
			</Framework>,
		);
		expect(meta.content).toBe("width=device-width, initial-scale=1");
	});

	it("[ISSUE-3459-ITEM-3] sets the viewport while the app's first render suspends", async () => {
		// awaited, because React leaves a commit's effects pending when it
		// suspends inside an act() that is not awaited
		await act(async () => {
			render(
				<Framework mobileScalingFixProps={{ minWidth: 320 }}>
					<SuspendingApp />
				</Framework>,
			);
			await Promise.resolve();
		});
		// the Framework's Suspense fallback (the Loader) is on screen
		await screen.findByRole("progressbar");
		expect(viewportContent()).toBe("width=320, initial-scale=1");
	});
});

describe("DragAndDropPrevention in Framework", () => {
	it("[ISSUE-3459-ITEM-3] cancels dropped files while the app's first render suspends", async () => {
		await act(async () => {
			render(
				<Framework>
					<SuspendingApp />
				</Framework>,
			);
			await Promise.resolve();
		});
		// the Framework's Suspense fallback (the Loader) is on screen
		await screen.findByRole("progressbar");
		// a file dropped on the page would otherwise replace it
		const dragOver = new Event("dragover", { bubbles: true, cancelable: true });
		const drop = new Event("drop", { bubbles: true, cancelable: true });
		document.body.dispatchEvent(dragOver);
		document.body.dispatchEvent(drop);
		expect(dragOver.defaultPrevented).toBe(true);
		expect(drop.defaultPrevented).toBe(true);
	});
});

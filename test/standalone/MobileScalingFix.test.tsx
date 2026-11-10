import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import MobileScalingFix from "../../src/standalone/MobileScalingFix/MobileScalingFix";

const viewportMetas = () =>
	Array.from(
		document.querySelectorAll<HTMLMetaElement>("meta[name='viewport']"),
	);
const viewportContent = () => viewportMetas()[0]?.content;

/** Parses "a=1, b=2" into { a: "1", b: "2" } */
const directives = (content: string | undefined): Record<string, string> =>
	Object.fromEntries(
		(content ?? "")
			.split(",")
			.map((part) => part.trim())
			.filter(Boolean)
			.map((part) => {
				const [key, value] = part.split("=").map((s) => s.trim());
				return [key, value] as const;
			}),
	);

const addViewportMeta = (content: string) => {
	const meta = document.createElement("meta");
	meta.name = "viewport";
	meta.content = content;
	document.head.appendChild(meta);
	return meta;
};

/** Stubs navigator.platform; the own property shadows the prototype getter */
const setPlatform = (platform: string) =>
	Object.defineProperty(navigator, "platform", {
		value: platform,
		configurable: true,
	});

describe("MobileScalingFix", () => {
	beforeEach(() => {
		// Remove any pre-existing viewport meta so tests start clean
		const existing = document.querySelector("meta[name='viewport']");
		if (existing) existing.remove();
	});

	afterEach(() => {
		// auto-cleanup is off in this repo
		cleanup();
		viewportMetas().forEach((meta) => meta.remove());
		// deleting the own property restores jsdom's "" platform
		delete (navigator as unknown as Record<string, unknown>).platform;
	});

	it("renders without crashing", () => {
		const { container } = render(<MobileScalingFix />);
		// Component renders an empty fragment — container has no element children
		expect(container.firstChild).toBeNull();
	});

	it("creates a viewport meta tag when none exists", () => {
		render(<MobileScalingFix />);
		const meta = document.querySelector("meta[name='viewport']");
		expect(meta).not.toBeNull();
	});

	it("sets viewport content to device-width when no minWidth is provided", () => {
		render(<MobileScalingFix />);
		const meta = document.querySelector(
			"meta[name='viewport']",
		) as HTMLMetaElement;
		expect(meta.content).toContain("width=device-width");
		expect(meta.content).toContain("initial-scale=1");
	});

	it("sets viewport content to the specified minWidth", () => {
		render(<MobileScalingFix minWidth={1024} />);
		const meta = document.querySelector(
			"meta[name='viewport']",
		) as HTMLMetaElement;
		expect(meta.content).toContain("width=1024");
		expect(meta.content).toContain("initial-scale=1");
	});

	it("reuses an existing viewport meta tag instead of creating a duplicate", () => {
		const existingMeta = document.createElement("meta");
		existingMeta.name = "viewport";
		existingMeta.content = "width=device-width";
		document.head.appendChild(existingMeta);

		render(<MobileScalingFix minWidth={800} />);

		const allMeta = document.querySelectorAll("meta[name='viewport']");
		expect(allMeta.length).toBe(1);
		expect((allMeta[0] as HTMLMetaElement).content).toContain("width=800");
	});

	it("[ISSUE-3459-ITEM-4] keeps the other directives of an existing viewport meta", () => {
		const meta = addViewportMeta(
			"width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
		);
		render(<MobileScalingFix minWidth={320} />);
		expect(directives(meta.content)).toEqual({
			width: "320",
			"initial-scale": "1",
			"viewport-fit": "cover",
			"interactive-widget": "resizes-content",
		});
	});

	it("[ISSUE-3459-ITEM-4] keeps the other directives when minWidth changes", () => {
		const meta = addViewportMeta("width=device-width, viewport-fit=cover");
		const { rerender } = render(<MobileScalingFix minWidth={320} />);
		expect(meta.content).toBe("width=320, viewport-fit=cover, initial-scale=1");
		rerender(<MobileScalingFix minWidth={1024} />);
		expect(meta.content).toBe(
			"width=1024, viewport-fit=cover, initial-scale=1",
		);
		rerender(<MobileScalingFix />);
		expect(meta.content).toBe(
			"width=device-width, viewport-fit=cover, initial-scale=1",
		);
	});

	it("[ISSUE-3459-ITEM-4] replaces width and initial-scale however the page wrote them", () => {
		// browsers match names case-insensitively, allow spaces around "=",
		// and some also take ";" or whitespace between directives; a name
		// given twice is written once
		const meta = addViewportMeta(
			"Width = 500;viewport-fit=cover  INITIAL-SCALE=2, width=600, minimal-ui",
		);
		render(<MobileScalingFix minWidth={320} />);
		expect(meta.content).toBe(
			"width=320, viewport-fit=cover, initial-scale=1, minimal-ui",
		);
	});

	it("[ISSUE-3459-ITEM-5] restores the previous viewport content on unmount", () => {
		const meta = addViewportMeta("width=device-width, initial-scale=1");
		const { unmount } = render(<MobileScalingFix minWidth={1000} />);
		expect(meta.content).toBe("width=1000, initial-scale=1");
		unmount();
		expect(meta.content).toBe("width=device-width, initial-scale=1");
	});

	it("[ISSUE-3459-ITEM-5] removes the viewport meta it created on unmount", () => {
		const { unmount } = render(<MobileScalingFix minWidth={1000} />);
		expect(viewportMetas()).toHaveLength(1);
		unmount();
		expect(viewportMetas()).toHaveLength(0);
	});

	it("[ISSUE-3459-ITEM-5] restores the content from before mount after minWidth changed", () => {
		addViewportMeta("width=device-width, viewport-fit=cover");
		const { rerender, unmount } = render(<MobileScalingFix minWidth={320} />);
		rerender(<MobileScalingFix minWidth={1024} />);
		expect(viewportContent()).toBe(
			"width=1024, viewport-fit=cover, initial-scale=1",
		);
		unmount();
		expect(viewportMetas()).toHaveLength(1);
		expect(viewportContent()).toBe("width=device-width, viewport-fit=cover");
	});

	it("[ISSUE-3459-ITEM-5] keeps a single meta after minWidth changed and removes it on unmount", () => {
		const { rerender, unmount } = render(<MobileScalingFix minWidth={320} />);
		rerender(<MobileScalingFix minWidth={1024} />);
		expect(viewportMetas()).toHaveLength(1);
		expect(viewportContent()).toBe("width=1024, initial-scale=1");
		unmount();
		expect(viewportMetas()).toHaveLength(0);
	});

	it("[ISSUE-3459-ITEM-5] restores the content and removes its own meta under StrictMode", () => {
		const meta = addViewportMeta("width=device-width");
		const withMeta = render(
			<React.StrictMode>
				<MobileScalingFix minWidth={320} />
			</React.StrictMode>,
		);
		expect(meta.content).toBe("width=320, initial-scale=1");
		withMeta.unmount();
		expect(meta.content).toBe("width=device-width");

		meta.remove();
		const withoutMeta = render(
			<React.StrictMode>
				<MobileScalingFix minWidth={320} />
			</React.StrictMode>,
		);
		expect(viewportMetas()).toHaveLength(1);
		expect(viewportContent()).toBe("width=320, initial-scale=1");
		withoutMeta.unmount();
		expect(viewportMetas()).toHaveLength(0);
	});

	it("[ISSUE-3459-ITEM-5] restores the page's own maximum-scale on iPhone on unmount", () => {
		setPlatform("iPhone");
		const meta = addViewportMeta(
			"width=device-width, initial-scale=1, maximum-scale=5",
		);
		const { unmount } = render(<MobileScalingFix minWidth={1000} />);
		expect(directives(meta.content).width).toBe("1000");
		unmount();
		expect(meta.content).toBe(
			"width=device-width, initial-scale=1, maximum-scale=5",
		);
	});
});

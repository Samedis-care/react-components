import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import MobileScalingFix from "../../src/standalone/MobileScalingFix/MobileScalingFix";

describe("MobileScalingFix", () => {
	beforeEach(() => {
		// Remove any pre-existing viewport meta so tests start clean
		const existing = document.querySelector("meta[name='viewport']");
		if (existing) existing.remove();
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
});

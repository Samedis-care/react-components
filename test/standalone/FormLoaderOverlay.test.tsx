import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, expectTypeOf, afterEach } from "vitest";
import { render, cleanup, within } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import FormLoaderOverlay, {
	FormLoaderOverlayClassKey,
	FormLoaderOverlayProps,
} from "../../src/standalone/Form/FormLoaderOverlay";
import type * as PackageRoot from "../../src";

afterEach(cleanup);

const theme = createTheme();

const withTheme = (ui: React.ReactElement, t: Theme = theme) => (
	<ThemeProvider theme={t}>{ui}</ThemeProvider>
);

const renderOverlay = (ui: React.ReactElement, t: Theme = theme) =>
	render(withTheme(ui, t));

// the CcFormLoaderOverlay-root part of emotion's class name exists in development and
// test builds only; fine as a test selector, not as an app selector
const overlayRoot = (container: HTMLElement) => {
	const el = container.querySelector<HTMLElement>(
		'[class*="CcFormLoaderOverlay-root"]',
	);
	if (!el) throw new Error("overlay root not rendered");
	return el;
};

describe("FormLoaderOverlay", () => {
	it("[ISSUE-3461-ITEM-7] applies the theme's loader slot override to the box around the spinner", () => {
		const themed = createTheme({
			components: {
				CcFormLoaderOverlay: {
					styleOverrides: { loader: { outlineColor: "rgb(40, 40, 40)" } },
				},
			},
		});
		const { container } = renderOverlay(<FormLoaderOverlay visible />, themed);
		const root = overlayRoot(container);
		const progressbar = within(root).getByRole("progressbar");
		const styled = Array.from(root.querySelectorAll<HTMLElement>("*")).filter(
			(el) => getComputedStyle(el).outlineColor === "rgb(40, 40, 40)",
		);
		// the override reaches an element inside the overlay that holds the spinner
		expect(styled.some((el) => el.contains(progressbar))).toBe(true);
	});

	it("[ISSUE-3473-ITEM-6] exports FormLoaderOverlay from the package root", async () => {
		const root = (await import("../../src")) as Record<string, unknown>;
		expect(
			root.FormLoaderOverlay,
			"FormLoaderOverlay is missing from the package root",
		).toBe(FormLoaderOverlay);
	}, 90000);

	it("[ISSUE-3473-ITEM-6] exports its props and class key types from the package root", () => {
		// checked by tsc (tsconfig-test.json), not at runtime
		expectTypeOf<PackageRoot.FormLoaderOverlayProps>().toEqualTypeOf<FormLoaderOverlayProps>();
		expectTypeOf<PackageRoot.FormLoaderOverlayClassKey>().toEqualTypeOf<FormLoaderOverlayClassKey>();
	});
});

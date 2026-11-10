import "@testing-library/jest-dom/vitest";
import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, within } from "@testing-library/react";
import { ThemeProvider, createTheme, Theme } from "@mui/material";
import FormLoaderOverlay from "../../src/standalone/Form/FormLoaderOverlay";

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
});

import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import { BackActionButton } from "../../../src/backend-components/Form/DefaultFormPageButtons";

const theme = createTheme();
const wrap = (ui: React.ReactNode) =>
	render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

afterEach(() => {
	cleanup();
});

/**
 * Collects values of a given CSS property (or custom property) from all rules
 * whose selector actually matches the element.
 * MUI v7 injects colors via CSS custom properties such as --variant-containedBg,
 * so those must be queried in addition to standard properties.
 */
function getAppliedCssValues(el: HTMLElement, property: string): string[] {
	const styleTexts = Array.from(document.querySelectorAll("style"))
		.map((s) => s.textContent ?? "")
		.join("\n");

	const values: string[] = [];
	const escapedProp = property.replace(/-/g, "\\-");
	const rulePattern = new RegExp(
		`([^{}]+)\\{[^}]*${escapedProp}\\s*:\\s*([^;})]+)`,
		"g",
	);
	let match;
	while ((match = rulePattern.exec(styleTexts)) !== null) {
		const selector = match[1].trim();
		const value = match[2].trim().toLowerCase();
		try {
			if (el.matches(selector)) values.push(value);
		} catch {
			// skip selectors JSDOM cannot parse (e.g. inside @media)
		}
	}
	return values;
}

const GREY_BG = "#bcbdbf";

describe("BackActionButton / FlowEngineBackButton color prop", () => {
	it("uses grey background by default when no color prop is given", () => {
		wrap(<BackActionButton>Back</BackActionButton>);
		const button = screen.getByRole("button");
		const bgs = getAppliedCssValues(button, "background-color");
		expect(bgs.some((c) => c === GREY_BG)).toBe(true);
	});

	it("applies error palette colors when color=error is provided", () => {
		wrap(<BackActionButton color="error">Back</BackActionButton>);
		const button = screen.getByRole("button");

		// MUI v7 sets palette colors via CSS custom properties on the element's class
		const containedBgs = getAppliedCssValues(button, "--variant-containedBg");
		const containedColors = getAppliedCssValues(
			button,
			"--variant-containedColor",
		);

		// grey override must be absent
		expect(
			getAppliedCssValues(button, "background-color").some(
				(c) => c === GREY_BG,
			),
		).toBe(false);
		// theme error colors must be present
		expect(
			containedBgs.some((c) => c === theme.palette.error.main.toLowerCase()),
		).toBe(true);
		expect(
			containedColors.some(
				(c) => c === theme.palette.error.contrastText.toLowerCase(),
			),
		).toBe(true);
	});
});

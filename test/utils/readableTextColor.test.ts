import { describe, expect, it } from "vitest";
import { createTheme, decomposeColor, hslToRgb } from "@mui/material/styles";
import readableTextColor from "../../src/utils/internal/readableTextColor";

/** Relative luminance (WCAG) of an opaque CSS color */
const luminance = (color: string) => {
	let decoded = decomposeColor(color);
	if (decoded.type.startsWith("hsl")) decoded = decomposeColor(hslToRgb(color));
	const [r, g, b] = decoded.values.map((value) => {
		const c = value / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
	const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (high + 0.05) / (low + 0.05);
};

const light = createTheme();

describe("readableTextColor", () => {
	it.each([
		["MUI's default warning orange", "#ed6c02"],
		["SCF's warning yellow", "#FFCF00"],
		["an hsl color", "hsl(30, 100%, 50%)"],
	])(
		"[ISSUE-3474-ITEM-19] darkens %s just enough for 4.5:1 on white",
		(_name, color) => {
			const result = readableTextColor(light, color);

			expect(contrast(result, "#fff")).toBeGreaterThanOrEqual(4.5);
			// as close to the theme's color as the ratio allows
			expect(contrast(result, "#fff")).toBeLessThan(4.6);
			expect(luminance(result)).toBeLessThan(luminance(color));
		},
	);

	it("[ISSUE-3474-ITEM-19] leaves a color that already reaches 4.5:1 as it is", () => {
		// MUI's default error.main, 4.98:1 on white
		expect(readableTextColor(light, "#d32f2f")).toBe("#d32f2f");
	});

	it("[ISSUE-3474-ITEM-19] lightens on a dark background", () => {
		const dark = createTheme({ palette: { mode: "dark" } });
		const page = dark.palette.background.default;

		const result = readableTextColor(dark, "#8a4b00");

		expect(contrast(result, page)).toBeGreaterThanOrEqual(4.5);
		expect(luminance(result)).toBeGreaterThan(luminance("#8a4b00"));
		// MUI's dark warning.main reads well there already
		expect(readableTextColor(dark, dark.palette.warning.main)).toBe(
			dark.palette.warning.main,
		);
	});

	it("[ISSUE-3474-ITEM-19] reaches 4.5:1 against both the paper and the page background", () => {
		const theme = createTheme({
			palette: { background: { paper: "#fff", default: "#e0e0e0" } },
		});

		const result = readableTextColor(theme, "#ed6c02");

		expect(contrast(result, "#fff")).toBeGreaterThanOrEqual(4.5);
		expect(contrast(result, "#e0e0e0")).toBeGreaterThanOrEqual(4.5);
	});

	it("[ISSUE-3474-ITEM-19] returns a color it cannot measure as it is", () => {
		expect(readableTextColor(light, "var(--warning)")).toBe("var(--warning)");
		const theme = createTheme();
		theme.palette.background.default = "var(--page)";
		expect(readableTextColor(theme, "#ed6c02")).toBe("#ed6c02");
	});
});

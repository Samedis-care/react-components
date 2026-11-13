import { describe, expect, it } from "vitest";
import { decomposeColor, hslToRgb } from "@mui/material/styles";
import readableFill from "../../src/utils/internal/readableFill";

/** The channels (0-255) and alpha of a CSS color */
const channels = (color: string) => {
	const decoded = decomposeColor(color);
	return decoded.type.startsWith("hsl")
		? decomposeColor(hslToRgb(color)).values
		: decoded.values;
};

/** Relative luminance (WCAG) of a CSS color laid over an opaque background */
const luminance = (color: string, behind = [0, 0, 0]) => {
	const values = channels(color);
	const alpha = values[3] ?? 1;
	const [r, g, b] = values.slice(0, 3).map((value, i) => {
		const c = (value * alpha + behind[i] * (1 - alpha)) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** The contrast of text over an opaque fill, the text laid over the fill */
const textContrast = (text: string, fill: string) => {
	const behind = channels(fill).slice(0, 3);
	const [high, low] = [luminance(text, behind), luminance(fill)].sort(
		(x, y) => y - x,
	);
	return (high + 0.05) / (low + 0.05);
};

describe("readableFill", () => {
	it.each([
		["MUI's default info blue", "#0288d1"],
		["MUI's default warning orange", "#ed6c02"],
		["samedis.care's error red", "rgb(230, 45, 75)"],
		["an hsl color", "hsl(30, 100%, 50%)"],
	])(
		"[ISSUE-3470-ITEM-10] darkens %s behind white text just enough for 4.5:1",
		(_name, fill) => {
			const result = readableFill(fill, "#fff");

			expect(textContrast("#fff", result)).toBeGreaterThanOrEqual(4.5);
			// as close to the given fill as the ratio allows
			expect(textContrast("#fff", result)).toBeLessThan(4.6);
			expect(luminance(result)).toBeLessThan(luminance(fill));
		},
	);

	it("[ISSUE-3470-ITEM-10] leaves a fill that already reaches 4.5:1 as it is", () => {
		// MUI's default error.main, 4.98:1 with white
		expect(readableFill("#d32f2f", "#fff")).toBe("#d32f2f");
	});

	it("[ISSUE-3470-ITEM-10] lightens behind dark text, measuring translucent text as it shows", () => {
		// MUI's dark text: 4.46:1 as it shows on this red, 4.84:1 if it were opaque
		const text = "rgba(0, 0, 0, 0.87)";
		const fill = "rgb(230, 45, 75)";

		const result = readableFill(fill, text);

		expect(textContrast(text, result)).toBeGreaterThanOrEqual(4.5);
		expect(textContrast(text, result)).toBeLessThan(4.6);
		expect(luminance(result)).toBeGreaterThan(luminance(fill));
	});

	it("[ISSUE-3470-ITEM-10] returns a fill it cannot measure as it is", () => {
		expect(readableFill("var(--info)", "#fff")).toBe("var(--info)");
		expect(readableFill("#0288d1", "var(--text)")).toBe("#0288d1");
		// a translucent fill shows what lies under it
		expect(readableFill("rgba(2, 136, 209, 0.5)", "#fff")).toBe(
			"rgba(2, 136, 209, 0.5)",
		);
	});
});

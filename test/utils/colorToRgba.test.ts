import { afterEach, describe, expect, it, vi } from "vitest";
import colorToRgba from "../../src/utils/colorToRgba";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("colorToRgba", () => {
	it("[ISSUE-3481-ITEM-8] reads percentages in rgb() and color() as shares of 255", () => {
		expect(colorToRgba("rgb(50%, 20%, 10%)")).toEqual([128, 51, 26, 1]);
		expect(colorToRgba("rgb(100% 0% 50% / 25%)")).toEqual([255, 0, 128, 0.25]);
		expect(colorToRgba("color(srgb 1 0 0)")).toEqual([255, 0, 0, 1]);
		expect(colorToRgba("color(srgb 50% 0.2 none / 0.5)")).toEqual([
			128, 51, 0, 0.5,
		]);
		// linear light: 0.0031308 is 0.04045 encoded
		expect(colorToRgba("color(srgb-linear 1 0 0.0031308)")).toEqual([
			255, 0, 10, 1,
		]);
	});

	it("[ISSUE-3481-ITEM-8] reads the space-separated syntax, angle units, percentage alphas and hwb()", () => {
		expect(colorToRgba("rgb(46 125 50)")).toEqual([46, 125, 50, 1]);
		expect(colorToRgba("rgba(46 125 50 / 50%)")).toEqual([46, 125, 50, 0.5]);
		expect(colorToRgba("rgb(255, 0, 0, 0.5)")).toEqual([255, 0, 0, 0.5]);
		expect(colorToRgba("rgba(255, 0, 0, 50%)")).toEqual([255, 0, 0, 0.5]);
		expect(colorToRgba("hsl(260 60% 40%)")).toEqual([82, 41, 163, 1]);
		expect(colorToRgba("hsl(120deg 100% 25% / 0.3)")).toEqual([0, 128, 0, 0.3]);
		for (const hue of ["0.5turn", "200grad", `${Math.PI}rad`, "-180"])
			expect(colorToRgba(`hsl(${hue} 100 50)`), hue).toEqual([0, 255, 255, 1]);
		expect(colorToRgba("hwb(120 20% 20%)")).toEqual([51, 204, 51, 1]);
		expect(colorToRgba("hwb(0 60% 60%)")).toEqual([128, 128, 128, 1]);
		expect(colorToRgba("hwb(none 0% 0% / 0.5)")).toEqual([255, 0, 0, 0.5]);
	});

	it("[ISSUE-3481-ITEM-8] clamps values outside sRGB", () => {
		expect(colorToRgba("rgb(300, -20, 0)")).toEqual([255, 0, 0, 1]);
		expect(colorToRgba("rgba(0, 0, 0, 1.5)")).toEqual([0, 0, 0, 1]);
		expect(colorToRgba("color(srgb 1.2 -0.1 0)")).toEqual([255, 0, 0, 1]);
	});

	it("[ISSUE-3481-ITEM-8] still reads hex, comma-separated rgb() and hsl(), and keywords", () => {
		expect(colorToRgba("#abc")).toEqual([170, 187, 204, 1]);
		expect(colorToRgba("#ABCDEF")).toEqual([171, 205, 239, 1]);
		expect(colorToRgba("#1565c026")).toEqual([21, 101, 192, 0.149]);
		expect(colorToRgba("#0008")).toEqual([0, 0, 0, 0.533]);
		expect(colorToRgba("rgba(10, 20, 30, 0.5)")).toEqual([10, 20, 30, 0.5]);
		expect(colorToRgba("hsl(120, 100%, 25%)")).toEqual([0, 128, 0, 1]);
		expect(colorToRgba("hsla(120, 100%, 25%, 0.3)")).toEqual([0, 128, 0, 0.3]);
		expect(colorToRgba("navy")).toEqual([0, 0, 128, 1]);
		expect(colorToRgba("transparent")).toEqual([0, 0, 0, 0]);
	});

	it("[ISSUE-3481-ITEM-8] ignores case and spaces around the value", () => {
		expect(colorToRgba("RGB(10, 20, 30)")).toEqual([10, 20, 30, 1]);
		expect(colorToRgba("HSL(120DEG 100% 25%)")).toEqual([0, 128, 0, 1]);
		expect(colorToRgba(" #ABC ")).toEqual([170, 187, 204, 1]);
		expect(colorToRgba(" Navy ")).toEqual([0, 0, 128, 1]);
	});

	it("[ISSUE-3481-ITEM-8] cannot tell currentcolor", () => {
		expect(colorToRgba("currentColor")).toBeUndefined();
	});

	it("[ISSUE-3481-ITEM-8] leaves what it does not read to the browser", () => {
		// no canvas here, as on a server: what needs one throws
		const getContext = vi
			.spyOn(HTMLCanvasElement.prototype, "getContext")
			.mockReturnValue(null);
		const left = [
			"oklch(0.6 0.1 30)",
			"lab(50% 0 0)",
			"color(display-p3 1 0 0)",
			"color-mix(in srgb, red, blue)",
			"var(--brand)",
			"rgb(calc(10) 0 0)",
			// not valid CSS: the browser rejects them
			"rgb(50%, 20, 10)",
			"rgb(none, 0, 0)",
			"hwb(0, 0%, 0%)",
			"#abcd1",
			"constructor",
		];
		for (const color of left)
			expect(() => colorToRgba(color), color).toThrow("Canvas 2D");
		expect(getContext).toHaveBeenCalledTimes(left.length);
	});
});

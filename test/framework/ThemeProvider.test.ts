import { describe, it, expect } from "vitest";
import { getStandardTheme } from "../../src/framework/ThemeProvider";

describe("getStandardTheme", () => {
	it("returns an object with a palette property", () => {
		const theme = getStandardTheme(false);
		expect(theme).toHaveProperty("palette");
	});

	it("returns light theme when preferDark is false", () => {
		const theme = getStandardTheme(false);
		expect(theme.palette).toBeDefined();
		expect(theme.palette!.mode).toBe("light");
	});

	it("returns dark theme when preferDark is true", () => {
		const theme = getStandardTheme(true);
		expect(theme.palette).toBeDefined();
		expect(theme.palette!.mode).toBe("dark");
	});

	it("returns a valid ThemeOptions shape", () => {
		const theme = getStandardTheme(false);
		expect(typeof theme).toBe("object");
		expect(theme).not.toBeNull();
		expect(theme.palette).toEqual({ mode: "light" });
	});
});

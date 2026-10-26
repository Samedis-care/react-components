import { describe, expect, it } from "vitest";
import formatFileSize from "../../src/utils/formatFileSize";

describe("formatFileSize", () => {
	it.each<[number, string]>([
		[0, "0\u00a0byte"],
		[500, "500\u00a0byte"],
		[1023, "1,023\u00a0byte"],
		[1024, "1\u00a0kB"],
		[1536, "1.5\u00a0kB"],
		[15 * 1024 * 1024, "15\u00a0MB"],
		[1.25 * 1024 * 1024 * 1024, "1.3\u00a0GB"],
		[3 * 1024 ** 5, "3,072\u00a0TB"],
	])("formats %d bytes as %s", (bytes, expected) => {
		expect(formatFileSize(bytes, "en-US")).toBe(expected);
	});

	it("moves to the next unit where the rounded value would fill it", () => {
		expect(formatFileSize(1024 * 1024 - 1, "en-US")).toBe("1\u00a0MB");
		expect(formatFileSize(1024 * 1024 - 60, "en-US")).toBe("1,023.9\u00a0kB");
	});

	it.each<[string, string]>([
		["de-DE", "1,5\u00a0kB"],
		["fr", "1,5\u202fko"],
		["ru", "1,5\u00a0кБ"],
	])("formats for %s", (locale, expected) => {
		expect(formatFileSize(1536, locale)).toBe(expected);
	});
});

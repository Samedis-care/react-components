import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import timestampToAge from "../../src/utils/timestampToAge";

// timestampToAge formats in the language of the i18n instance; pin it to English
vi.mock("../../src/i18n", () => ({
	default: { language: "en" },
}));

describe("timestampToAge", () => {
	let now: number;

	beforeEach(() => {
		now = Date.now();
		vi.useFakeTimers();
		vi.setSystemTime(now);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("returns 'now' for timestamps less than 5 seconds ago", () => {
		const ts = new Date(now - 2000);
		expect(timestampToAge(ts)).toBe("now");
	});

	it("returns 'now' for timestamps exactly at the boundary (4999ms)", () => {
		const ts = new Date(now - 4999);
		expect(timestampToAge(ts)).toBe("now");
	});

	it("returns the seconds for timestamps 5s–59s ago", () => {
		const ts = new Date(now - 30000);
		expect(timestampToAge(ts)).toBe("30 seconds ago");
	});

	it("returns '1 minute ago' for timestamps exactly 1 minute ago", () => {
		const ts = new Date(now - 60000);
		expect(timestampToAge(ts)).toBe("1 minute ago");
	});

	it("returns plural 'minutes' for timestamps 2+ minutes ago", () => {
		const ts = new Date(now - 2 * 60000);
		expect(timestampToAge(ts)).toBe("2 minutes ago");
	});

	it("returns '1 hour ago' for timestamps exactly 1 hour ago", () => {
		const ts = new Date(now - 3600000);
		expect(timestampToAge(ts)).toBe("1 hour ago");
	});

	it("returns plural 'hours' for timestamps 2+ hours ago", () => {
		const ts = new Date(now - 3 * 3600000);
		expect(timestampToAge(ts)).toBe("3 hours ago");
	});

	it("returns '1 day ago' for timestamps exactly 1 day ago", () => {
		const ts = new Date(now - 86400000);
		expect(timestampToAge(ts)).toBe("1 day ago");
	});

	it("returns plural 'days' for timestamps 2+ days ago", () => {
		const ts = new Date(now - 5 * 86400000);
		expect(timestampToAge(ts)).toBe("5 days ago");
	});

	it("handles a timestamp at exactly the 1-hour boundary (3599999ms = still minutes)", () => {
		const ts = new Date(now - 3599999);
		const result = timestampToAge(ts);
		expect(result).toContain("minute");
	});
});

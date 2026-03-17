import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import timestampToAge from "../../src/utils/timestampToAge";

// timestampToAge uses i18n, mock it to return predictable strings
vi.mock("../../src/i18n", () => ({
	default: {
		t: (key: string, params?: Record<string, unknown>): string => {
			if (key === "utils.timestampToAge.just-now") return "just now";
			if (key === "utils.timestampToAge.less-minute")
				return "less than a minute";
			if (key === "utils.timestampToAge.str") {
				return `${String(params?.AMOUNT)} ${String(params?.UNIT)} ago`;
			}
			// unit translations
			const unitMap: Record<string, string> = {
				"utils.timestampToAge.minute": "minute",
				"utils.timestampToAge.minutes": "minutes",
				"utils.timestampToAge.hour": "hour",
				"utils.timestampToAge.hours": "hours",
				"utils.timestampToAge.day": "day",
				"utils.timestampToAge.days": "days",
			};
			return unitMap[key] ?? key;
		},
	},
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

	it("returns 'just now' for timestamps less than 5 seconds ago", () => {
		const ts = new Date(now - 2000);
		expect(timestampToAge(ts)).toBe("just now");
	});

	it("returns 'just now' for timestamps exactly at the boundary (4999ms)", () => {
		const ts = new Date(now - 4999);
		expect(timestampToAge(ts)).toBe("just now");
	});

	it("returns 'less than a minute' for timestamps 5s–59s ago", () => {
		const ts = new Date(now - 30000);
		expect(timestampToAge(ts)).toBe("less than a minute");
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

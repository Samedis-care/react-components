import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ccI18n from "../../src/i18n";
import timestampToAge from "../../src/utils/timestampToAge";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("timestampToAge", () => {
	beforeEach(async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-03-17T12:00:00Z"));
		await ccI18n.changeLanguage("en");
	});
	afterEach(async () => {
		vi.useRealTimers();
		await ccI18n.changeLanguage("en");
	});

	/** The age of a point in time `deltaMs` before now (after now if negative) */
	const ago = (deltaMs: number) =>
		timestampToAge(new Date(Date.now() - deltaMs));

	it("[ISSUE-3468-ITEM-3] words less than 5 seconds either way as now, and then counts seconds", () => {
		expect(ago(0)).toBe("now");
		expect(ago(4_999)).toBe("now");
		expect(ago(-4_999)).toBe("now");
		expect(ago(5_000)).toBe("5 seconds ago");
		expect(ago(59_999)).toBe("59 seconds ago");
		expect(ago(-5_000)).toBe("in 5 seconds");
	});

	it("[ISSUE-3468-ITEM-3] uses the largest unit the age fills, rounded down, up to years", () => {
		expect(ago(MINUTE)).toBe("1 minute ago");
		expect(ago(2 * MINUTE - 1)).toBe("1 minute ago");
		expect(ago(HOUR - 1)).toBe("59 minutes ago");
		expect(ago(HOUR)).toBe("1 hour ago");
		expect(ago(DAY - 1)).toBe("23 hours ago");
		expect(ago(DAY)).toBe("1 day ago");
		expect(ago(7 * DAY - 1)).toBe("6 days ago");
		expect(ago(7 * DAY)).toBe("1 week ago");
		expect(ago(30 * DAY)).toBe("4 weeks ago");
		expect(ago(31 * DAY)).toBe("1 month ago");
		expect(ago(364 * DAY)).toBe("11 months ago");
		expect(ago(365 * DAY)).toBe("1 year ago");
		expect(ago(800 * DAY)).toBe("2 years ago");
	});

	it("[ISSUE-3468-ITEM-3] words a time in the future as such, in every unit", () => {
		expect(ago(-2 * HOUR)).toBe("in 2 hours");
		expect(ago(-(2 * HOUR + 59 * MINUTE))).toBe("in 2 hours");
		expect(ago(-3 * DAY)).toBe("in 3 days");
		expect(ago(-400 * DAY)).toBe("in 1 year");
	});

	it("[ISSUE-3468-ITEM-3] follows the current language, region included", async () => {
		await ccI18n.changeLanguage("de-CH");
		expect(ago(5 * MINUTE)).toBe("vor 5 Minuten");
		await ccI18n.changeLanguage("es");
		expect(ago(-2 * DAY)).toBe("dentro de 2 días");
		await ccI18n.changeLanguage("it");
		expect(ago(3 * HOUR)).toBe("3 ore fa");
	});

	it("[ISSUE-3468-ITEM-3] returns an empty string for an invalid date", () => {
		expect(timestampToAge(new Date(NaN))).toBe("");
	});
});

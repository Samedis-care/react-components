// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	dateOnlyFromDateTime,
	denormalizeDate,
	formatDateOnly,
	normalizeDate,
	normalizeDateUtc,
	parseDateOnly,
	toDateOnly,
} from "../../src/utils/dateOnlyUtils";
import { ToDateLocaleStringOptions } from "../../src/constants";

/**
 * Timezones spanning the entire UTC-12 … UTC+14 range, including the
 * half- and quarter-hour offsets and both DST states of the southern zones.
 */
const ZONES = [
	"Pacific/Kiritimati", // UTC+14
	"Pacific/Apia", // UTC+13
	"Pacific/Chatham", // UTC+12:45 / +13:45
	"Pacific/Auckland", // UTC+12 / +13
	"Australia/Lord_Howe", // UTC+10:30 / +11
	"Asia/Tokyo", // UTC+9
	"Asia/Kolkata", // UTC+5:30
	"Europe/Berlin", // UTC+1 / +2
	"UTC", // UTC
	"America/New_York", // UTC-5 / -4
	"America/Los_Angeles", // UTC-8 / -7
	"Pacific/Marquesas", // UTC-9:30
	"Pacific/Pago_Pago", // UTC-11
	"Etc/GMT+12", // UTC-12
];

/** Days worth checking: both hemispheres' DST states, a year boundary and a leap day */
const SAMPLE_DAYS: [year: number, month: number, day: number][] = [
	[2026, 8, 13],
	[2026, 1, 15],
	[2026, 12, 31],
	[2024, 2, 29],
];

afterEach(() => {
	vi.unstubAllEnvs();
});

/** Runs fn as if the user were in the given timezone */
const inZone = <T>(tz: string, fn: () => T): T => {
	vi.stubEnv("TZ", tz);
	return fn();
};

/** The UTC parts of a value — for date-only values these carry the date */
const utcParts = (date: Date) => [
	date.getUTCFullYear(),
	date.getUTCMonth() + 1,
	date.getUTCDate(),
	date.getUTCHours(),
	date.getUTCMinutes(),
	date.getUTCSeconds(),
	date.getUTCMilliseconds(),
];

/** The local calendar day of a value */
const localDay = (date: Date) => [
	date.getFullYear(),
	date.getMonth() + 1,
	date.getDate(),
];

/** What a date picker hands us when the user picks the given day: local midnight */
const picked = (year: number, month: number, day: number) =>
	new Date(year, month - 1, day);

describe("dateOnlyUtils", () => {
	describe("normalizeDate (local calendar day → date-only value)", () => {
		it("anchors the picked local calendar day at noon UTC in every timezone", () => {
			for (const tz of ZONES) {
				for (const [year, month, day] of SAMPLE_DAYS) {
					const normalized = inZone(tz, () =>
						normalizeDate(picked(year, month, day)),
					);
					expect(utcParts(normalized), `${tz} ${year}-${month}-${day}`).toEqual(
						[year, month, day, 12, 0, 0, 0],
					);
				}
			}
		});

		it("ignores the time of day of the input", () => {
			for (const tz of ZONES) {
				const [start, end] = inZone(tz, () => [
					normalizeDate(new Date(2026, 7, 13, 0, 0, 0, 0)),
					normalizeDate(new Date(2026, 7, 13, 23, 59, 59, 999)),
				]);
				expect(start.toISOString(), tz).toEqual(end.toISOString());
			}
		});
	});

	describe("normalizeDateUtc (UTC calendar day → date-only value)", () => {
		it("anchors the UTC calendar day at noon UTC in every timezone", () => {
			for (const tz of ZONES) {
				for (const [year, month, day] of SAMPLE_DAYS) {
					const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
					const normalized = inZone(tz, () => normalizeDateUtc(new Date(iso)));
					expect(utcParts(normalized), `${tz} ${iso}`).toEqual([
						year,
						month,
						day,
						12,
						0,
						0,
						0,
					]);
				}
			}
		});

		it("ignores the time of day of the input", () => {
			for (const tz of ZONES) {
				const results = inZone(tz, () =>
					[
						"2026-08-13T00:00:00.000Z",
						"2026-08-13T12:00:00.000Z",
						"2026-08-13T23:59:59.999Z",
					].map((iso) => normalizeDateUtc(new Date(iso)).toISOString()),
				);
				expect(new Set(results).size, tz).toBe(1);
				expect(results[0], tz).toBe("2026-08-13T12:00:00.000Z");
			}
		});
	});

	describe("parseDateOnly", () => {
		it("parses date-only strings identically in every timezone", () => {
			for (const tz of ZONES) {
				const parsed = inZone(tz, () => parseDateOnly("2026-08-13"));
				expect(parsed.toISOString(), tz).toBe("2026-08-13T12:00:00.000Z");
			}
		});

		it("parses full ISO timestamps by their UTC day", () => {
			for (const tz of ZONES) {
				for (const iso of [
					"2026-08-13T00:00:00.000Z",
					"2026-08-13T12:00:00.000Z",
					"2026-08-13T23:59:59.999Z",
				]) {
					const parsed = inZone(tz, () => parseDateOnly(iso));
					expect(parsed.toISOString(), `${tz} ${iso}`).toBe(
						"2026-08-13T12:00:00.000Z",
					);
				}
			}
		});
	});

	describe("denormalizeDate (date-only value → local calendar day)", () => {
		it("returns the stored calendar day in local time in every timezone", () => {
			for (const tz of ZONES) {
				for (const [year, month, day] of SAMPLE_DAYS) {
					const local = inZone(tz, () =>
						denormalizeDate(normalizeDate(picked(year, month, day))),
					);
					expect(localDay(local), `${tz} ${year}-${month}-${day}`).toEqual([
						year,
						month,
						day,
					]);
				}
			}
		});

		it("returns local midnight", () => {
			for (const tz of ZONES) {
				const local = inZone(tz, () =>
					denormalizeDate(new Date("2026-08-13T12:00:00.000Z")),
				);
				expect(
					[local.getHours(), local.getMinutes(), local.getSeconds()],
					tz,
				).toEqual([0, 0, 0]);
			}
		});

		it("keeps the calendar day where local midnight does not exist (DST spring-forward at 00:00)", () => {
			// these zones skip 00:00 → 01:00 on the given day
			for (const [tz, iso, expected] of [
				["America/Havana", "2026-03-08T12:00:00.000Z", [2026, 3, 8]],
				["America/Santiago", "2026-09-06T12:00:00.000Z", [2026, 9, 6]],
				["Asia/Beirut", "2026-03-29T12:00:00.000Z", [2026, 3, 29]],
			] as const) {
				const local = inZone(tz, () => denormalizeDate(new Date(iso)));
				expect(localDay(local), `${tz} ${iso}`).toEqual([...expected]);
			}
		});
	});

	describe("round trip", () => {
		it("survives pick → store → serialize → parse → pick in every timezone", () => {
			for (const tz of ZONES) {
				for (const [year, month, day] of SAMPLE_DAYS) {
					const shown = inZone(tz, () => {
						const stored = normalizeDate(picked(year, month, day));
						const fromBackend = parseDateOnly(stored.toISOString());
						return denormalizeDate(fromBackend);
					});
					expect(localDay(shown), `${tz} ${year}-${month}-${day}`).toEqual([
						year,
						month,
						day,
					]);
				}
			}
		});

		it("does not drift across repeated save/load cycles", () => {
			for (const tz of ZONES) {
				const shown = inZone(tz, () => {
					let stored = normalizeDate(picked(2026, 8, 13));
					const days: number[][] = [];
					for (let i = 0; i < 5; ++i) {
						// simulate the user re-opening the record: parse, show, re-pick, save
						const local = denormalizeDate(parseDateOnly(stored.toISOString()));
						days.push(localDay(local));
						stored = normalizeDate(local);
					}
					return days;
				});
				for (const [i, day] of shown.entries()) {
					expect(day, `${tz} cycle ${i + 1}`).toEqual([2026, 8, 13]);
				}
			}
		});

		it("keeps the picked day in timezones at or beyond UTC+12", () => {
			for (const tz of [
				"Pacific/Auckland",
				"Pacific/Chatham",
				"Pacific/Apia",
				"Pacific/Kiritimati",
			]) {
				const shown = inZone(tz, () =>
					formatDateOnly(normalizeDate(picked(2026, 8, 13)), "en-CA"),
				);
				expect(shown, tz).toBe("2026-08-13");
			}
		});

		it("keeps the day of a date-only string from the backend in timezones behind UTC", () => {
			for (const tz of [
				"America/New_York",
				"America/Los_Angeles",
				"Pacific/Marquesas",
				"Pacific/Pago_Pago",
				"Etc/GMT+12",
			]) {
				const shown = inZone(tz, () =>
					formatDateOnly(parseDateOnly("2026-08-13"), "en-CA"),
				);
				expect(shown, tz).toBe("2026-08-13");
			}
		});
	});

	describe("formatDateOnly", () => {
		it("formats the stored calendar day identically in every timezone", () => {
			const value = new Date("2026-08-13T12:00:00.000Z");
			for (const locale of ["en-CA", "de-DE", "en-US"]) {
				const baseline = inZone("UTC", () => formatDateOnly(value, locale));
				for (const tz of ZONES) {
					expect(
						inZone(tz, () => formatDateOnly(value, locale)),
						`${tz} ${locale}`,
					).toBe(baseline);
				}
			}
		});

		it("honours explicit format options in every timezone", () => {
			const value = new Date("2026-08-13T12:00:00.000Z");
			for (const tz of ZONES) {
				expect(
					inZone(tz, () =>
						formatDateOnly(value, "de-DE", ToDateLocaleStringOptions),
					),
					tz,
				).toBe("13.08.2026");
			}
		});

		it("never lets a caller override the UTC anchor", () => {
			const value = new Date("2026-08-13T12:00:00.000Z");
			expect(
				inZone("Pacific/Auckland", () =>
					formatDateOnly(value, "en-CA", { timeZone: "Pacific/Auckland" }),
				),
			).toBe("2026-08-13");
		});
	});

	describe("dateOnlyFromDateTime (instant → date-only value)", () => {
		it("uses the calendar day the viewer sees the instant on", () => {
			// 2026-08-13T22:30:00Z is already the 14th in Berlin, still the 13th in New York
			for (const [tz, expected] of [
				["Pacific/Kiritimati", "2026-08-14T12:00:00.000Z"], // +14 → 14th, 12:30
				["Pacific/Auckland", "2026-08-14T12:00:00.000Z"], // +12 → 14th, 10:30
				["Europe/Berlin", "2026-08-14T12:00:00.000Z"], // +2 → 14th, 00:30
				["UTC", "2026-08-13T12:00:00.000Z"], // 22:30
				["America/New_York", "2026-08-13T12:00:00.000Z"], // -4 → 18:30
				["Etc/GMT+12", "2026-08-13T12:00:00.000Z"], // -12 → 10:30
			] as const) {
				const value = inZone(tz, () =>
					dateOnlyFromDateTime("2026-08-13T22:30:00.000Z"),
				);
				expect(value.toISOString(), tz).toBe(expected);
			}
		});

		it("rolls back over midnight for timezones behind UTC", () => {
			// 2026-08-13T02:00:00Z is still the 12th in the Americas
			for (const [tz, expected] of [
				["Europe/Berlin", "2026-08-13T12:00:00.000Z"], // +2 → 04:00
				["America/New_York", "2026-08-12T12:00:00.000Z"], // -4 → 22:00 on the 12th
				["America/Los_Angeles", "2026-08-12T12:00:00.000Z"], // -7 → 19:00 on the 12th
			] as const) {
				const value = inZone(tz, () =>
					dateOnlyFromDateTime("2026-08-13T02:00:00.000Z"),
				);
				expect(value.toISOString(), tz).toBe(expected);
			}
		});

		it("always returns a date-only value anchored at noon UTC", () => {
			for (const tz of ZONES) {
				for (const iso of [
					"2026-08-13T00:00:00.000Z",
					"2026-08-13T11:59:59.999Z",
					"2026-08-13T23:59:59.999Z",
				]) {
					const value = inZone(tz, () => dateOnlyFromDateTime(iso));
					expect(
						[value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds()],
						`${tz} ${iso}`,
					).toEqual([12, 0, 0]);
				}
			}
		});

		it("accepts a string and a Date alike", () => {
			for (const tz of ZONES) {
				const [fromString, fromDate] = inZone(tz, () => [
					dateOnlyFromDateTime("2026-08-13T22:30:00.000Z"),
					dateOnlyFromDateTime(new Date("2026-08-13T22:30:00.000Z")),
				]);
				expect(fromString.toISOString(), tz).toBe(fromDate.toISOString());
			}
		});

		it("displays the same day the raw timestamp displays locally", () => {
			// the property that matters: converting an instant for date-only display must
			// not change which day the user is shown
			for (const tz of ZONES) {
				for (const iso of [
					"2026-08-13T00:30:00.000Z",
					"2026-08-13T12:00:00.000Z",
					"2026-08-13T22:30:00.000Z",
					"2026-01-15T23:15:00.000Z",
				]) {
					const [converted, raw] = inZone(tz, () => [
						formatDateOnly(dateOnlyFromDateTime(iso), "en-CA"),
						new Date(iso).toLocaleDateString("en-CA"),
					]);
					expect(converted, `${tz} ${iso}`).toBe(raw);
				}
			}
		});
	});

	describe("toDateOnly (whatever the backend sent → date-only value)", () => {
		it("keeps the date of a date-only string in every timezone", () => {
			for (const tz of ZONES) {
				for (const [year, month, day] of SAMPLE_DAYS) {
					const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
					const value = inZone(tz, () => toDateOnly(iso));
					expect(utcParts(value), `${tz} ${iso}`).toEqual([
						year,
						month,
						day,
						12,
						0,
						0,
						0,
					]);
				}
			}
		});

		it("keeps the date of a noon UTC anchor, whatever the offset notation", () => {
			// noon UTC is this library's own date-only serialization — treating it as an
			// instant would make the day drift on every save/load cycle in UTC+12 and up
			for (const tz of ZONES) {
				for (const iso of [
					"2026-08-13T12:00:00.000Z",
					"2026-08-13T12:00:00Z",
					"2026-08-13T12:00:00.000+00:00",
					"2026-08-13T14:00:00.000+02:00",
				]) {
					const value = inZone(tz, () => toDateOnly(iso));
					expect(value.toISOString(), `${tz} ${iso}`).toBe(
						"2026-08-13T12:00:00.000Z",
					);
				}
			}
		});

		it("converts a timestamp to the viewer's local day", () => {
			for (const [tz, expected] of [
				["Pacific/Kiritimati", "2026-08-14T12:00:00.000Z"],
				["Pacific/Auckland", "2026-08-14T12:00:00.000Z"],
				["Europe/Berlin", "2026-08-14T12:00:00.000Z"],
				["UTC", "2026-08-13T12:00:00.000Z"],
				["America/New_York", "2026-08-13T12:00:00.000Z"],
			] as const) {
				const value = inZone(tz, () => toDateOnly("2026-08-13T22:30:00.000Z"));
				expect(value.toISOString(), tz).toBe(expected);
			}
		});

		it("converts a midnight UTC timestamp to the viewer's local day", () => {
			// midnight UTC has a time part, so it is read as an instant: a record created
			// at 2026-08-13T00:00:00Z was created on the 12th in New York
			for (const [tz, expected] of [
				["Europe/Berlin", "2026-08-13T12:00:00.000Z"],
				["UTC", "2026-08-13T12:00:00.000Z"],
				["America/New_York", "2026-08-12T12:00:00.000Z"],
				["Pacific/Pago_Pago", "2026-08-12T12:00:00.000Z"],
			] as const) {
				const value = inZone(tz, () => toDateOnly("2026-08-13T00:00:00.000Z"));
				expect(value.toISOString(), tz).toBe(expected);
			}
		});

		it("keeps the date of a non-ISO date-only string in every timezone", () => {
			// these parse as local midnight, so the local reading gives the literal date
			for (const tz of ZONES) {
				for (const input of ["2026/08/13", "Aug 13, 2026"]) {
					const value = inZone(tz, () => toDateOnly(input));
					expect(value.toISOString(), `${tz} ${input}`).toBe(
						"2026-08-13T12:00:00.000Z",
					);
				}
			}
		});

		it("accepts Date and epoch number input", () => {
			const iso = "2026-08-13T22:30:00.000Z";
			for (const tz of ZONES) {
				const [fromString, fromDate, fromNumber] = inZone(tz, () => [
					toDateOnly(iso),
					toDateOnly(new Date(iso)),
					toDateOnly(new Date(iso).getTime()),
				]);
				expect(fromDate.toISOString(), tz).toBe(fromString.toISOString());
				expect(fromNumber.toISOString(), tz).toBe(fromString.toISOString());
			}
		});

		it("always returns a value anchored at noon UTC", () => {
			for (const tz of ZONES) {
				for (const input of [
					"2026-08-13",
					"2026-08-13T00:00:00.000Z",
					"2026-08-13T22:30:00.000Z",
					"2026/08/13",
				]) {
					const value = inZone(tz, () => toDateOnly(input));
					expect(
						[value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds()],
						`${tz} ${input}`,
					).toEqual([12, 0, 0]);
				}
			}
		});

		it("does not drift across save/load cycles, for either wire format", () => {
			for (const tz of ZONES) {
				for (const wire of ["2026-08-13", "2026-08-13T12:00:00.000Z"]) {
					const seen = inZone(tz, () => {
						let value = toDateOnly(wire);
						const days: string[] = [];
						for (let i = 0; i < 5; ++i) {
							days.push(value.toISOString());
							value = toDateOnly(value.toISOString());
						}
						return days;
					});
					for (const [i, day] of seen.entries()) {
						expect(day, `${tz} ${wire} cycle ${i + 1}`).toBe(
							"2026-08-13T12:00:00.000Z",
						);
					}
				}
			}
		});
	});

	/**
	 * A date picker publishes a value on every keystroke, so a user typing 2026
	 * hands us the years 2, 20 and 202 along the way. `Date.UTC` and the `Date`
	 * constructor map the years 0–99 to 1900+year, which would silently turn those
	 * into real 19xx dates and record them in a form.
	 */
	describe("years below 100", () => {
		/** A local calendar day in a year the `Date` constructor would shift */
		const lowYearLocal = (year: number, month: number, day: number) => {
			const date = new Date(2000, month - 1, day);
			date.setFullYear(year);
			return date;
		};

		/** A UTC calendar day in a year `Date.UTC` would shift */
		const lowYearUtc = (year: number, month: number, day: number) => {
			const date = new Date(Date.UTC(2000, month - 1, day, 12));
			date.setUTCFullYear(year);
			return date;
		};

		it("normalizeDate keeps the year instead of shifting it into 19xx", () => {
			for (const tz of ZONES) {
				for (const year of [0, 2, 20, 99]) {
					const normalized = inZone(tz, () =>
						normalizeDate(lowYearLocal(year, 8, 12)),
					);
					expect(utcParts(normalized), `${tz} year ${year}`).toEqual([
						year,
						8,
						12,
						12,
						0,
						0,
						0,
					]);
				}
			}
		});

		it("normalizeDateUtc keeps the year instead of shifting it into 19xx", () => {
			for (const year of [0, 2, 20, 99]) {
				expect(
					utcParts(normalizeDateUtc(lowYearUtc(year, 8, 12))),
					`year ${year}`,
				).toEqual([year, 8, 12, 12, 0, 0, 0]);
			}
		});

		it("denormalizeDate keeps the year instead of shifting it into 19xx", () => {
			for (const tz of ZONES) {
				for (const year of [0, 2, 20, 99]) {
					const local = inZone(tz, () =>
						denormalizeDate(lowYearUtc(year, 8, 12)),
					);
					expect(localDay(local), `${tz} year ${year}`).toEqual([year, 8, 12]);
				}
			}
		});

		it("round trips a low year without drifting into 19xx", () => {
			for (const tz of ZONES) {
				const cycled = inZone(tz, () =>
					normalizeDate(denormalizeDate(lowYearUtc(20, 8, 12))),
				);
				expect(utcParts(cycled), tz).toEqual([20, 8, 12, 12, 0, 0, 0]);
			}
		});

		it("leaves the years from 100 on alone", () => {
			for (const year of [100, 1899, 1920, 2026]) {
				expect(
					utcParts(normalizeDateUtc(lowYearUtc(year, 8, 12))),
					`year ${year}`,
				).toEqual([year, 8, 12, 12, 0, 0, 0]);
			}
		});
	});

	describe("public export", () => {
		it("is exported from the package index for consumers", async () => {
			const index = await import("../../src/utils/index");
			expect(index.normalizeDate).toBe(normalizeDate);
			expect(index.normalizeDateUtc).toBe(normalizeDateUtc);
			expect(index.parseDateOnly).toBe(parseDateOnly);
			expect(index.denormalizeDate).toBe(denormalizeDate);
			expect(index.formatDateOnly).toBe(formatDateOnly);
		});
	});
});

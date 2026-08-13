import { afterEach, describe, expect, it, vi } from "vitest";
import React from "react";
import TypeDate from "../../src/backend-integration/Model/Types/TypeDate";
import TypeDateNullable from "../../src/backend-integration/Model/Types/TypeDateNullable";

/**
 * Timezones spanning the entire UTC-12 … UTC+14 range.
 * The zones at or beyond UTC+12 are the ones a noon-UTC value read with the
 * local getters shifts a day forward in; the zones behind UTC are the ones a
 * date-only string (parsed as UTC midnight) shifts a day backward in.
 */
const ZONES = [
	"Pacific/Kiritimati", // UTC+14
	"Pacific/Apia", // UTC+13
	"Pacific/Chatham", // UTC+12:45 / +13:45
	"Pacific/Auckland", // UTC+12 / +13
	"Asia/Tokyo", // UTC+9
	"Asia/Kolkata", // UTC+5:30
	"Europe/Berlin", // UTC+1 / +2
	"UTC", // UTC
	"America/New_York", // UTC-5 / -4
	"America/Los_Angeles", // UTC-8 / -7
	"Pacific/Pago_Pago", // UTC-11
	"Etc/GMT+12", // UTC-12
];

afterEach(() => {
	vi.unstubAllEnvs();
});

/** Runs fn as if the user were in the given timezone */
const inZone = <T>(tz: string, fn: () => T): T => {
	vi.stubEnv("TZ", tz);
	return fn();
};

// the types are abstract only because of render() — the (de)serialization and
// stringify logic under test lives entirely in the base classes
class TestTypeDate extends TypeDate {
	render(): React.ReactElement {
		throw new Error("not used in this test");
	}
}
class TestTypeDateNullable extends TypeDateNullable {
	render(): React.ReactElement {
		throw new Error("not used in this test");
	}
}

const type = new TestTypeDate();
const nullableType = new TestTypeDateNullable();

describe.each([
	["TypeDate", type],
	["TypeDateNullable", nullableType],
] as const)("%s", (_name, subject) => {
	describe("deserialize", () => {
		it("keeps the day of a date-only string in every timezone", () => {
			for (const tz of ZONES) {
				const value = inZone(tz, () => subject.deserialize("2026-08-13"));
				expect(value, tz).toBeInstanceOf(Date);
				expect((value as Date).toISOString(), tz).toBe(
					"2026-08-13T12:00:00.000Z",
				);
			}
		});

		it("keeps the day of its own noon UTC serialization in every timezone", () => {
			for (const tz of ZONES) {
				const value = inZone(tz, () =>
					subject.deserialize("2026-08-13T12:00:00.000Z"),
				);
				expect((value as Date).toISOString(), tz).toBe(
					"2026-08-13T12:00:00.000Z",
				);
			}
		});

		it("shows a timestamp on the day the viewer sees it", () => {
			// fields like created_at / last_activity_at are timestamps rendered as dates:
			// 2026-08-13T22:30:00Z is already the 14th in Berlin, still the 13th in New York
			for (const [tz, expected] of [
				["Pacific/Auckland", "2026-08-14T12:00:00.000Z"],
				["Europe/Berlin", "2026-08-14T12:00:00.000Z"],
				["UTC", "2026-08-13T12:00:00.000Z"],
				["America/New_York", "2026-08-13T12:00:00.000Z"],
			] as const) {
				const value = inZone(tz, () =>
					subject.deserialize("2026-08-13T22:30:00.000Z"),
				);
				expect((value as Date).toISOString(), tz).toBe(expected);
			}
		});

		it("shows a timestamp that has rolled over midnight on the local day", () => {
			for (const [tz, expected] of [
				["Europe/Berlin", "2026-08-13T12:00:00.000Z"],
				["America/New_York", "2026-08-12T12:00:00.000Z"],
				["America/Los_Angeles", "2026-08-12T12:00:00.000Z"],
			] as const) {
				const value = inZone(tz, () =>
					subject.deserialize("2026-08-13T02:00:00.000Z"),
				);
				expect((value as Date).toISOString(), tz).toBe(expected);
			}
		});

		it("does not drift across repeated serialize/deserialize cycles", () => {
			for (const tz of ZONES) {
				const days = inZone(tz, () => {
					let value = subject.deserialize("2026-08-13") as Date;
					const seen: string[] = [];
					for (let i = 0; i < 5; ++i) {
						const wire = subject.serialize(value) as string;
						seen.push(wire);
						value = subject.deserialize(wire) as Date;
					}
					return seen;
				});
				for (const [i, wire] of days.entries()) {
					expect(wire, `${tz} cycle ${i + 1}`).toBe("2026-08-13T12:00:00.000Z");
				}
			}
		});
	});

	describe("stringify", () => {
		it("shows the stored day in every timezone", () => {
			const value = new Date("2026-08-13T12:00:00.000Z");
			const baseline = inZone("UTC", () => subject.stringify(value));
			for (const tz of ZONES) {
				expect(
					inZone(tz, () => subject.stringify(value)),
					tz,
				).toBe(baseline);
			}
			// guard against the assertion above passing on an empty/constant string
			expect(baseline).not.toBe(
				inZone("UTC", () =>
					subject.stringify(new Date("2026-08-12T12:00:00.000Z")),
				),
			);
		});
	});
});

describe("TypeDate", () => {
	describe("getDefaultValue", () => {
		it("returns today's local calendar day anchored at noon UTC", () => {
			for (const tz of ZONES) {
				const [value, expected] = inZone(tz, () => {
					const now = new Date();
					return [
						type.getDefaultValue(),
						[now.getFullYear(), now.getMonth(), now.getDate()],
					] as const;
				});
				expect(
					[
						value.getUTCFullYear(),
						value.getUTCMonth(),
						value.getUTCDate(),
						value.getUTCHours(),
					],
					tz,
				).toEqual([...expected, 12]);
			}
		});
	});
});

describe("TypeDateNullable", () => {
	it("passes null through deserialize and serialize", () => {
		expect(nullableType.deserialize(null)).toBeNull();
		expect(nullableType.deserialize("")).toBeNull();
		expect(nullableType.serialize(null)).toBeNull();
	});

	it("returns null as default value", () => {
		expect(nullableType.getDefaultValue()).toBeNull();
	});
});
